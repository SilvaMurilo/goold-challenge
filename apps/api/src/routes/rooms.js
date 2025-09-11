const router = require('express').Router();
const { Room } = require('../models');

router.get('/', async (_req, res) => {
  const rooms = await Room.findAll({ attributes: ['id', 'name'], order: [['name','ASC']] });
  return res.json(rooms);
});

module.exports = router;
