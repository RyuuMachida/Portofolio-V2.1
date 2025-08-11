const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Comment = require('../models/Comment');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'fill', quality: 'auto' }
    ]
  }
});

const upload = multer({ storage });

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
    password: user.password,
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

// === UPLOAD PHOTO ===
router.post('/upload-photo', requireLogin, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findOne({ email: req.session.user.email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Cloudinary URL otomatis
    user.logo = req.file.path;
    await user.save();

    // Update session
    req.session.user.logo = user.logo;
    
    res.json({ 
      success: true, 
      imageUrl: user.logo 
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;