'use strict';
const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { Op } = require('sequelize');
const { Booking, Room, User } = require('../models');

function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

const ALLOWED_STATUS = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'];

router.get('/', requireAuth, async (req, res) => {
  try {
    const { role, id: authUserId } = req.user;
    const {
      userId,
      roomId,
      status,
      from,
      to,
      page = '1',
      pageSize = '10',
      order = 'DESC',
    } = req.query;

    const where = {};
    if (role === 'CUSTOMER') {
      where.user_id = authUserId;
    } else if (role === 'ADMIN' && userId) {
      where.user_id = Number(userId);
    }

    if (roomId) where.room_id = Number(roomId);
    if (status && ALLOWED_STATUS.includes(status)) where.status = status;

    if (from || to) {
      const start = parseDate(from);
      const end   = parseDate(to);
      where.start_at = {};
      if (start) where.start_at[Op.gte] = start;
      if (end)   where.start_at[Op.lte] = end;
    }

    const limit = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (pageNum - 1) * limit;

    const { rows, count } = await Booking.findAndCountAll({
      where,
      include: [
        { model: Room, as: 'room', attributes: ['id', 'name'] },
        ...(role === 'ADMIN'
          ? [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
          : []),
      ],
      order: [['start_at', order === 'ASC' ? 'ASC' : 'DESC']],
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
    return res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { role, id: authUserId } = req.user;
    const { room_id, start_at, end_at, user_id } = req.body;

    if (!room_id || !start_at || !end_at) {
      return res.status(400).json({ error: 'room_id, start_at e end_at são obrigatórios' });
    }
    const start = parseDate(start_at);
    const end   = parseDate(end_at);
    if (!start || !end || end <= start) {
      return res.status(400).json({ error: 'Intervalo de datas inválido' });
    }

    const targetUserId = role === 'ADMIN' && user_id ? Number(user_id) : authUserId;

    const overlap = await Booking.findOne({
      where: {
        room_id: Number(room_id),
        [Op.and]: [
          { start_at: { [Op.lt]: end } },
          { end_at:   { [Op.gt]: start } },
        ],
        status: { [Op.in]: ['PENDING', 'CONFIRMED'] },
      },
    });
    if (overlap) {
      return res.status(409).json({ error: 'Conflito de horário para esta sala' });
    }

    const booking = await Booking.create({
      user_id: targetUserId,
      room_id: Number(room_id),
      start_at: start,
      end_at: end,
      status: 'PENDING',
    });

    return res.status(201).json({ data: booking });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

/**
 * DELETE /bookings/:id
 * - CUSTOMER só pode cancelar o próprio
 * - Marca como CANCELLED (não deleta - soft delete)
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { role, id: authUserId } = req.user;
    const id = Number(req.params.id);

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ error: 'Agendamento não encontrado' });
    if (role !== 'ADMIN' && booking.user_id !== authUserId) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao cancelar agendamento' });
  }
});

/**
 * PATCH /bookings/:id/status
 * body: { status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' }
 * - ADMIN: pode confirmar/rejeitar/cancelar conforme transições definidas
 * - CUSTOMER: só pode CANCELAR o próprio (de PENDING ou CONFIRMED para CANCELLED)
 */
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { role, id: authUserId } = req.user;
    const id = Number(req.params.id);
    const next = String(req.body?.status || '').toUpperCase();

    if (!ALLOWED_STATUS.includes(next)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ error: 'Agendamento não encontrado' });

    // Regras de permissão por role
    const TRANSITIONS = {
      ADMIN: {
        PENDING:    ['CONFIRMED', 'REJECTED', 'CANCELLED'],
        CONFIRMED:  ['CANCELLED'],
        REJECTED:   [],
        CANCELLED:  [],
      },
      CUSTOMER: {
        PENDING:    ['CANCELLED'],
        CONFIRMED:  ['CANCELLED'],
        REJECTED:   [],
        CANCELLED:  [],
      },
    };

    // CUSTOMER só pode mexer no próprio agendamento
    if (role !== 'ADMIN' && booking.user_id !== authUserId) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const current = booking.status;
    const allowedNext = TRANSITIONS[role]?.[current] || [];
    if (!allowedNext.includes(next)) {
      return res.status(409).json({
        error: `Transição inválida para ${role}: ${current} -> ${next}`,
      });
    }

    // Se for CONFIRMAR, checar conflito de horário para a mesma sala
    if (next === 'CONFIRMED') {
      const overlap = await Booking.findOne({
        where: {
          id: { [Op.ne]: booking.id },
          room_id: booking.room_id,
          [Op.and]: [
            { start_at: { [Op.lt]: booking.end_at } },
            { end_at:   { [Op.gt]: booking.start_at } },
          ],
          status: { [Op.in]: ['PENDING', 'CONFIRMED'] },
        },
      });
      if (overlap) {
        return res.status(409).json({ error: 'Conflito de horário para confirmação' });
      }
    }

    booking.status = next;
    await booking.save();

    return res.json({ data: booking });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao atualizar status do agendamento' });
  }
});


module.exports = router;
