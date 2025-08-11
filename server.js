require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
// === Connect MongoDB ===
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// === Middleware ===
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// === Serve Static Files ===
app.use(express.static(path.join(__dirname, 'public')));

// === Auth Routes ===
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// === Session-check route untuk frontend ===
app.get('/session-user', (req, res) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      username: req.session.user.username,
      logo: req.session.user.logo || '/assets/img/default-logo.png',
      role: req.session.user.role || 'Visitor',
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// GANTI DENGAN INI (Cloudinary):
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
const User = require('./models/User');

// UPDATE route upload juga:
app.post('/upload-photo', upload.single('profileImage'), async (req, res) => {
  if (!req.session.user) return res.status(401).send('Unauthorized');

  try {
    const user = await User.findOne({ email: req.session.user.email });

    // YANG INI YANG PENTING - req.file.path itu Cloudinary URL
    user.logo = req.file.path; // Cloudinary URL, bukan local path
    await user.save();

    // Update session
    req.session.user.logo = user.logo;

    console.log('Cloudinary URL saved:', req.file.path); // Debug

    res.json({
      success: true,
      imageUrl: user.logo
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});


// Update route upload
app.post('/upload-photo', upload.single('profileImage'), async (req, res) => {
  if (!req.session.user) return res.status(401).send('Unauthorized');

  try {
    const user = await User.findOne({ email: req.session.user.email });

    // Ganti dari local path ke Cloudinary URL
    user.logo = req.file.path; // Cloudinary URL otomatis
    await user.save();

    // Update session
    req.session.user.logo = user.logo;

    // Return success dengan URL
    res.json({
      success: true,
      imageUrl: user.logo
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

const commentRoutes = require('./routes/comment');
app.use('/', commentRoutes);

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server was RUNNING at http://localhost:${PORT}`);
});

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }
  next();
}

function isLoggedIn(req, res, next) {
  console.log("Session:", req.session); // DEBUG di sini
  if (req.session && req.session.user) {
    return next();
  } else {
    res.send("Halaman dashboard ini cuma bisa diakses kalau udah login!");
  }
}

const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

// Route: GET profile info
app.get('/api/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({
    username: req.session.user.username,
    email: req.session.user.email,
    profilePic: req.session.user.logo || '/assets/img/default-logo.png',
    password: req.session.user.password || '******'
  });
});
