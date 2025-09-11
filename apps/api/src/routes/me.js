const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { User } = require('../models');


router.get('/', requireAuth, async (req, res) => {
const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password_hash'] } });
if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
return res.json(user);
});


module.exports = router;