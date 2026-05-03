const express = require('express');
const router = express.Router();

// Hardcoded credentials for personal use
const GHOST_USER = {
  username: 'ghost69',
  password: '2001'
};

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === GHOST_USER.username && password === GHOST_USER.password) {
    // For personal use, we'll return a simple success response
    // In a real app, you'd use JWT here.
    return res.json({
      success: true,
      user: {
        username: GHOST_USER.username,
        token: 'simple-auth-token-ghost69-2001' // Simple static token
      }
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid username or password'
  });
});

module.exports = router;
