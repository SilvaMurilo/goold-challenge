const jwt = require('jsonwebtoken');

function extractBearer(req) {
  const h = (req && req.headers) ? req.headers : {};
  const auth = typeof h.authorization === 'string' ? h.authorization : '';
  if (!auth) return null;
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  return auth.slice(7).trim();
}

function requireAuth(req, res, next) {
  try {
    // if (req.method === 'OPTIONS') return next();
    const fromCookie = req?.cookies?.token || null;
    const fromBearer = extractBearer(req);
    const token = fromCookie || fromBearer;
    console.log(token)
    if (!token) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
