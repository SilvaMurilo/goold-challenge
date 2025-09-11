require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const cookieParser = require('cookie-parser');


const authRoutes = require('./routes/auth');
const meRoutes = require('./routes/me');
const bookings = require('./routes/bookings');
const roomsRoutes = require('./routes/rooms');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));


app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/me', meRoutes);
app.use('/bookings', bookings);
app.use('/rooms', roomsRoutes);

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