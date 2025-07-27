const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Comment = require('../models/Comment');
const multer = require('multer');
const path = require('path');

// Middleware cek login
function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).send('Unauthorized');
  next();
}

// === GET PROFILE DATA ===
router.get('/', requireLogin, async (req, res) => {
  const user = await User.findOne({ email: req.session.user.email });
  if (!user) return res.status(404).send('User not found');

  res.json({
    username: user.username,
    profilePic: user.logo,
    password: user.password, // tampilkan hanya jika sangat diperlukan
  });
});

// === GET COMMENTS BY USER ===
router.get('/comments', requireLogin, async (req, res) => {
  const comments = await Comment.find({ username: req.session.user.username });
  res.json(comments);
});

// === UPDATE PASSWORD ===
router.post('/password', requireLogin, async (req, res) => {
  const { password } = req.body;
  await User.updateOne({ email: req.session.user.email }, { password });
  res.sendStatus(200);
});

// === UPLOAD PROFILE PICTURE ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, req.session.user.username + '-' + unique);
  }
});

const upload = multer({ storage });

router.post('/picture', requireLogin, upload.single('profilePic'), async (req, res) => {
  const imagePath = '/uploads/' + req.file.filename;
  await User.updateOne({ email: req.session.user.email }, { logo: imagePath });
  req.session.user.logo = imagePath; // update session juga
  res.sendStatus(200);
});

module.exports = router;
