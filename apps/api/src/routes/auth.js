const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Address } = require('../models');


router.post('/register', async (req, res) => {
try {
const { name, email, password, address } = req.body;
const exists = await User.findOne({ where: { email } });
if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' });


const passwordHash = await bcrypt.hash(password, 10);
const user = await User.create({ name, email, passwordHash, role: 'CLIENT' });
if (address) await Address.create({ userId: user.id, ...address });


return res.status(201).json({ id: user.id, name: user.name, email: user.email });
} catch (e) {
console.error(e);
return res.status(500).json({ error: 'Erro ao registrar' });
}
});


router.post('/login', async (req, res) => {
try {
const { email, password } = req.body;
const user = await User.findOne({ where: { email } });
if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });


const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });


const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
return res.json({ token });
} catch (e) {
console.error(e);
return res.status(500).json({ error: 'Erro ao logar' });
}
});


module.exports = router;