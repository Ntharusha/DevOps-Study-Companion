require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/memory', require('./routes/memory'));
app.use('/api/entries', require('./routes/entries'));
app.use('/api/labs', require('./routes/labs'));
app.use('/api/commands', require('./routes/commands'));
app.use('/api/errors', require('./routes/errors'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/timer', require('./routes/timer'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
