'use strict';

const express = require('express');
const { Op } = require('sequelize');
const { Log, User } = require('../models'); // ajuste o caminho se necessário

const router = express.Router();

/**
 * GET /logs
 * Query params:
 *  - q: busca textual (description)
 *  - action: ENUM('CREATE','UPDATE','DELETE','VIEW','LOGIN','LOGOUT')
 *  - entity, entity_id, user_id
 *  - date_from, date_to (ISO ou yyyy-mm-dd)
 *  - page (1-based), limit (default 20, máx 100)
 *  - includeUser=(0|1) para incluir dados do usuário
 */
router.get('/', async (req, res) => {
  try {
    const {
      q,
      action,
      entity,
      entity_id,
      user_id,
      date_from,
      date_to,
      page = 1,
      limit = 20,
      includeUser = '1',
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    /** @type {import('sequelize').WhereOptions} */
    const where = {};

    if (q) where.description = { [Op.iLike]: `%${q}%` };
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (entity_id) where.entity_id = entity_id;
    if (user_id) where.user_id = user_id;

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from);
      if (date_to) where.created_at[Op.lte] = new Date(date_to);
    }

    const include = includeUser === '1'
      ? [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
      : [];

    const { rows, count } = await Log.findAndCountAll({
      where,
      include,
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset,
    });

    res.json({
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        hasNext: offset + rows.length < count,
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao listar logs' });
  }
});

/** GET /logs/:id */
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

    const row = await Log.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });
    if (!row) return res.status(404).json({ error: 'Não encontrado' });

    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao obter log' });
  }
});

/**
 * POST /logs
 * body: { action, entity?, entity_id?, description?, user_id? }
 */
router.post('/', async (req, res) => {
  try {
    const { action, entity, entity_id, description, user_id } = req.body || {};
    if (!action) return res.status(400).json({ error: 'action é obrigatório' });

    const valid = ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT'];
    if (!valid.includes(action)) return res.status(400).json({ error: 'action inválido' });

    const log = await Log.create({
      action,
      entity: entity || null,
      entity_id: entity_id || null,
      description: description || null,
      user_id: user_id || null,
    });

    res.status(201).json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao criar log' });
  }
});

/** DELETE /logs/:id */
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

    const n = await Log.destroy({ where: { id } });
    if (!n) return res.status(404).json({ error: 'Não encontrado' });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao remover log' });
  }
});

module.exports = router;
