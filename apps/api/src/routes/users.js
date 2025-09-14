// routes/users.js
'use strict';
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { requireAuth } = require('../middleware/auth');
const { Op } = require('sequelize');
const { User } = require('../models');

// helper para esconder hash
function toPublicUser(u) {
  if (!u) return null;
  const j = u.toJSON ? u.toJSON() : u;
  const { password_hash, ...rest } = j;
  return rest;
}

// LIKE compat (pg usa iLike, mysql/sqlite usa like)
const LIKE = Op.iLike || Op.like;

router.get('/me', requireAuth, async (req, res) => {
  try {
    const me = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!me) return res.status(404).json({ error: 'Usuário não encontrado' });
    return res.json(toPublicUser(me));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao obter usuário autenticado' });
  }
});

/**
 * GET /users
 * - CUSTOMER: retorna o próprio usuário (objeto direto — sem {data})
 * - ADMIN: lista paginada { page, pageSize, total, data }
 *   query: q, page=1, pageSize=10, order=DESC
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { role, id: authUserId } = req.user;

    if (role !== 'ADMIN') {
      const me = await User.findByPk(authUserId, { attributes: { exclude: ['password_hash'] } });
      if (!me) return res.status(404).json({ error: 'Usuário não encontrado' });
      return res.json(toPublicUser(me)); // <<< flat
    }

    const { q = '', page = '1', pageSize = '10', order = 'DESC' } = req.query;

    const where = {};
    if (q) {
      where[Op.or] = [
        { name:      { [LIKE]: `%${q}%` } },
        { last_name: { [LIKE]: `%${q}%` } },
        { email:     { [LIKE]: `%${q}%` } },
      ];
    }

    const limit = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (pageNum - 1) * limit;

    const { rows, count } = await User.findAndCountAll({
      where,
      order: [['createdAt', order === 'ASC' ? 'ASC' : 'DESC']],
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
 * PATCH /users
 * Atualiza somente os campos enviados
 * body: user_id?(ADMIN), name?, last_name?, email?, password?,
 *       postal_code?, street?, address_number?, address_line2?,
 *       neighborhood?, city?, state?, region?
 */
router.patch('/', requireAuth, async (req, res) => {
  try {
    const { role, id: authUserId } = req.user;
    const {
      user_id, // ADMIN pode apontar outro usuário
      name,
      last_name,
      email,
      password,
      postal_code,
      street,
      address_number,
      address_line2,
      neighborhood,
      city,
      state,
      region,
    } = req.body || {};

    const targetUserId = role === 'ADMIN' && user_id ? Number(user_id) : authUserId;

    const user = await User.findByPk(targetUserId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Email único (só se veio e mudou)
    if (typeof email !== 'undefined' && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) return res.status(409).json({ error: 'E-mail já está em uso' });
    }

    // aplica somente chaves presentes (inclusive string vazia para “limpar”)
    if (typeof name           !== 'undefined') user.name = name;
    if (typeof last_name      !== 'undefined') user.last_name = last_name;
    if (typeof email          !== 'undefined') user.email = email;

    if (typeof postal_code    !== 'undefined') user.postal_code = postal_code;
    if (typeof street         !== 'undefined') user.street = street;
    if (typeof address_number !== 'undefined') user.address_number = address_number;
    if (typeof address_line2  !== 'undefined') user.address_line2 = address_line2;
    if (typeof neighborhood   !== 'undefined') user.neighborhood = neighborhood;
    if (typeof city           !== 'undefined') user.city = city;
    if (typeof state          !== 'undefined') user.state = state;
    if (typeof region         !== 'undefined') user.region = region;

    // senha (opcional)
    if (typeof password !== 'undefined') {
      if (!String(password).trim() || String(password).length < 6) {
        return res.status(400).json({ error: 'Senha inválida (min 6 caracteres)' });
      }
      user.password_hash = await bcrypt.hash(String(password), 10);
    }

    await user.save();
    return res.json({ data: toPublicUser(user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});


module.exports = router;
