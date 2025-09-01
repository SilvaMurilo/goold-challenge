const jwt = require('jsonwebtoken');


module.exports = function requireAuth(req, res, next) {
const header = req.headers.authorization || '';
const token = header.startsWith('Bearer ') ? header.slice(7) : null;
if (!token) return res.status(401).json({ error: 'Token ausente' });
try {
const payload = jwt.verify(token, process.env.JWT_SECRET);
req.user = payload; // { id, role }
next();
} catch {
return res.status(401).json({ error: 'Token inválido' });
}
};