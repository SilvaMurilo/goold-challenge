require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');


const authRoutes = require('./routes/auth');
const meRoutes = require('./routes/me');
const bookings = require('./routes/bookings');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());


app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/me', meRoutes);
app.use('/bookings', bookings);


const port = process.env.PORT || 4000;
app.listen(port, async () => {
try {
await sequelize.authenticate();
console.log('DB conectado!');
} catch (e) {
console.error('Falha ao conectar DB', e);
}
console.log(`API ouvindo em http://localhost:${port}`);
});