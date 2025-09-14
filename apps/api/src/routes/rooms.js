// routes/rooms.js
'use strict';
const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { Room } = require('../models');

/**
 * GET /rooms
 * Lista salas. Por padrão devolve {id,name}, mas você pode
 * pedir campos extras com ?full=1
 */
router.get('/', requireAuth, async (req, res) => {
  const full = String(req.query.full || '') === '1';
  const attrs = full
    ? ['id', 'name', 'start_hour', 'end_hour', 'slot_minutes', 'createdAt', 'updatedAt']
    : ['id', 'name'];
  const rooms = await Room.findAll({ attributes: attrs, order: [['name', 'ASC']] });
  return res.json(rooms);
});

/**
 * POST /rooms (ADMIN)
 * body: { name, start_hour?, end_hour?, slot_minutes? }
 */
router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const {
      name,
      start_hour = '08:00',
      end_hour = '18:00',
      slot_minutes = 30,
    } = req.body || {};

    if (!String(name || '').trim()) {
      return res.status(400).json({ error: 'name é obrigatório' });
    }
    const slot = Number(slot_minutes) || 30;
    if (slot < 5 || slot > 240) {
      return res.status(400).json({ error: 'slot_minutes deve estar entre 5 e 240' });
    }

    const room = await Room.create({
      name: String(name).trim(),
      start_hour: String(start_hour).slice(0,5), // "HH:MM"
      end_hour: String(end_hour).slice(0,5),
      slot_minutes: slot,
    });

    return res.status(201).json({ data: room });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao criar sala' });
  }
});

/**
 * PATCH /rooms/:id (ADMIN)
 * body (parcial): { name?, start_hour?, end_hour?, slot_minutes? }
 */
router.patch('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const room = await Room.findByPk(id);
    if (!room) return res.status(404).json({ error: 'Sala não encontrada' });

    const payload = {};
    if (typeof req.body?.name !== 'undefined') {
      if (!String(req.body.name).trim()) {
        return res.status(400).json({ error: 'name não pode ser vazio' });
      }
      payload.name = String(req.body.name).trim();
    }
    if (typeof req.body?.start_hour !== 'undefined') {
      payload.start_hour = String(req.body.start_hour).slice(0,5);
    }
    if (typeof req.body?.end_hour !== 'undefined') {
      payload.end_hour = String(req.body.end_hour).slice(0,5);
    }
    if (typeof req.body?.slot_minutes !== 'undefined') {
      const slot = Number(req.body.slot_minutes);
      if (!Number.isFinite(slot) || slot < 5 || slot > 240) {
        return res.status(400).json({ error: 'slot_minutes inválido' });
      }
      payload.slot_minutes = slot;
    }

    await room.update(payload);
    return res.json({ data: room });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao atualizar sala' });
  }
});

module.exports = router;
