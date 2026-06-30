const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');

router.get('/me', authenticate, (req, res) => {
  const { id, email, role, farmer, createdAt } = req.user;
  res.json({ id, email, role, farmer, createdAt });
});

module.exports = router;
