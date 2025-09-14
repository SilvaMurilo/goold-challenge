const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Address } = require('../models');
const { logAction } = require('../services/audit');

router.post('/register', async (req, res) => {
  try {
    const {
      name,
      last_name,
      email,
      password,
      // campos de endereço (conforme sua migration "users")
      postal_code,
      street,
      address_number,
      neighborhood,
      city,
      state,
      address_line2,   // opcional
      region           // opcional
    } = req.body || {};

    // validações mínimas (evite deixar null/undefined em colunas NOT NULL)
    if (!name?.trim())      return res.status(422).json({ error: 'Nome é obrigatório' });
    if (!last_name?.trim())      return res.status(422).json({ error: 'Sobrenome é obrigatório' });
    if (!email?.trim())     return res.status(422).json({ error: 'E-mail é obrigatório' });
    if (!password?.trim())  return res.status(422).json({ error: 'Senha é obrigatória' });

    if (!postal_code?.trim())   return res.status(422).json({ error: 'CEP é obrigatório' });
    if (!street?.trim())        return res.status(422).json({ error: 'Rua é obrigatória' });
    if (!address_number?.trim())        return res.status(422).json({ error: 'Número é obrigatório' });
    if (!neighborhood?.trim())  return res.status(422).json({ error: 'Bairro é obrigatório' });
    if (!city?.trim())          return res.status(422).json({ error: 'Cidade é obrigatória' });
    if (!state?.trim())         return res.status(422).json({ error: 'Estado é obrigatório' });

    const normalizedEmail = String(email).toLowerCase().trim();

    // checa duplicidade
    const exists = await User.findOne({ where: { email: normalizedEmail } });
    if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' });

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      last_name,
      email: normalizedEmail,
      password_hash,
      role: 'CUSTOMER', // default também está na migration, mas deixei explícito
      postal_code,
      address_number,
      street,
      neighborhood,
      city,
      state,
      address_line2: address_line2 ?? null,
      region: region ?? null,
    });
    await logAction({
      action: 'CADASTRO',
      userId: user.id,
      entity: 'auth',
      entityId: String(user.id),
      description: `Usuário ${user.email} cadastrou`,
    });
    // responde sem o hash
    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (e) {
    // trata erro de unique de forma amigável
    if (e?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    console.error(e);
    return res.status(500).json({ error: 'Erro ao registrar' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ where: { email: String(email).toLowerCase().trim() } });
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // cookie httpOnly + secure
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 1000,
  });
  await logAction({
    action: 'LOGIN',
    userId: user.id,
    entity: 'auth',
    entityId: String(user.id),
    description: `Usuário ${user.email} autenticou`,
  });

  return res.json({ ok: true, token, role: user.role });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ ok: true });
});


module.exports = router;