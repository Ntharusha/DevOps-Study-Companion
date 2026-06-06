const express = require('express');
const router = express.Router();

// Load administrative credentials from environment variables, fallback to professional defaults
const ADMIN_USER = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'devops123'
};

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    // Return a simple success response
    // For demo/personal portfolio, using a simple auth token
    return res.json({
      success: true,
      user: {
        username: ADMIN_USER.username,
        token: `token-${ADMIN_USER.username}-${Date.now()}` // Dynamic safe token
      }
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid username or password'
  });
});

module.exports = router;
