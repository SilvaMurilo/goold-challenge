'use strict';
const router = require('express').Router();
const bcrypt = require('bcrypt');
// const fetch = require('node-fetch'); // npm i node-fetch@2
const { requireAuth } = require('../middleware/auth');
const { Op } = require('sequelize');
const { User } = require('../models');

// Remove campos sensíveis
function toPublicUser(u) {
  if (!u) return null;
  const json = u.toJSON ? u.toJSON() : u;
  const { password_hash, ...rest } = json;
  console.log(rest)
  return rest;
}

/**
 * GET /users
 * - CUSTOMER: retorna apenas o próprio usuário
 * - ADMIN: lista usuários com paginação e busca
 *   query: q, page=1, pageSize=10, order=DESC
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { role, id: authUserId } = req.user;

    if (role !== 'ADMIN') {
      const me = await User.findByPk(authUserId);
      if (!me) return res.status(404).json({ error: 'Usuário não encontrado' });
      return res.json({...toPublicUser(me) });
    }

    const {
      q = '',
      page = '1',
      pageSize = '10',
      order = 'DESC',
    } = req.query;

    const where = {};
    if (q) {
      where[Op.or] = [
        { first_name: { [Op.iLike || Op.like]: `%${q}%` } },
        { last_name:  { [Op.iLike || Op.like]: `%${q}%` } },
        { email:      { [Op.iLike || Op.like]: `%${q}%` } },
      ];
    }

    const limit = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (pageNum - 1) * limit;

    const { rows, count } = await User.findAndCountAll({
      where,
      order: [['created_at', order === 'ASC' ? 'ASC' : 'DESC']],
      attributes: { exclude: ['password_hash'] },
      limit,
      offset,
      distinct: true,
    });

    return res.json({
      page: pageNum,
      pageSize: limit,
      total: count,
      data: rows,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

/**
 * GET /users/:id (ADMIN)
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'ADMIN') return res.status(403).json({ error: 'Sem permissão' });

    const id = Number(req.params.id);
    const user = await User.findByPk(id, { attributes: { exclude: ['password_hash'] } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    return res.json({ data: user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

/**
 * PUT /users
 * - CUSTOMER: atualiza o próprio cadastro
 * - ADMIN: pode atualizar o próprio ou outro usuário (via body.user_id)
 * body: first_name, last_name, email, password?, cep, address, number, complement, district, city, state, user_id?(ADMIN)
 */
router.put('/', requireAuth, async (req, res) => {
  try {
    const { role, id: authUserId } = req.user;
    const {
      user_id, // só ADMIN pode usar
      first_name,
      last_name,
      email,
      password, // opcional
      cep,
      address,
      number,
      complement,
      district,
      city,
      state,
    } = req.body || {};

    const targetUserId = role === 'ADMIN' && user_id ? Number(user_id) : authUserId;

    const user = await User.findByPk(targetUserId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Validações simples
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'Nome, sobrenome e e-mail são obrigatórios' });
    }

    // E-mail único (se mudou)
    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) return res.status(409).json({ error: 'E-mail já está em uso' });
    }

    // Atribuições
    user.first_name = first_name;
    user.last_name  = last_name;
    user.email      = email;

    if (typeof cep        !== 'undefined') user.cep = cep;
    if (typeof address    !== 'undefined') user.address = address;
    if (typeof number     !== 'undefined') user.number = number;
    if (typeof complement !== 'undefined') user.complement = complement;
    if (typeof district   !== 'undefined') user.district = district;
    if (typeof city       !== 'undefined') user.city = city;
    if (typeof state      !== 'undefined') user.state = String(state || '').toUpperCase();

    // Troca de senha (opcional)
    if (password && String(password).trim()) {
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'A senha deve ter ao menos 6 caracteres' });
      }
      user.password_hash = await bcrypt.hash(String(password), 10);
    }

    await user.save();

    return res.json({ data: toPublicUser(user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao salvar usuário' });
  }
});

/**
 * (Opcional) GET /users/cep/:cep
 * Helper para auto-completar endereço por CEP
 */
router.get('/cep/:cep', requireAuth, async (req, res) => {
  try {
    const raw = (req.params.cep || '').replace(/\D/g, '');
    if (raw.length !== 8) {
      return res.status(400).json({ error: 'CEP inválido' });
    }
    const r = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
    if (!r.ok) return res.status(502).json({ error: 'Falha ao consultar CEP' });
    const d = await r.json();
    if (d.erro) return res.status(404).json({ error: 'CEP não encontrado' });

    return res.json({
      cep: d.cep,
      address: d.logradouro,
      district: d.bairro,
      city: d.localidade,
      state: d.uf,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao consultar CEP' });
  }
});

module.exports = router;
