require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

const requestRoutes = require('./routes/request.routes');
app.use('/api/requests', requestRoutes);

app.use('/api/auth', authRoutes);

const auth = require('./middleware/auth');
app.get('/api/protected', auth, (req, res) => {
  res.json({ message: 'protected ok', user: req.user });
});

if (app._router) {
  app._router.stack
    .filter(r => r.route && r.route.path)
    .forEach(r => console.log('Mounted route:', Object.keys(r.route.methods).join(','), r.route.path));
}

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

module.exports = app;