const express = require('express');
const router = express.Router();
const User = require('../models/User');

// === REGISTER ===
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const role = username === 'Ariel Evan' ? 'Dev🔧' : 'Visitor';

    const user = new User({ username, email, password, role });
    await user.save();

    req.session.user = {
      username: user.username,
      email: user.email,
      logo: user.logo,
      role: user.role
    };

    res.redirect('/');
  } catch (err) {
    res.status(400).send('❌ Email sudah digunakan atau error lainnya.');
  }
});


// === LOGIN ===
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).send('❌ Email atau password salah.');
    }

    // Simpan user ke session
    req.session.user = {
      username: user.username,
      email: user.email,
      logo: user.logo || '/assets/img/default-logo.png',
      role: user.role || 'Visitor'
    };

    return res.redirect('/');

  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Server error.');
  }
});

// === LOGOUT ===
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;

