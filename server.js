require ('dotenv').config();
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

const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/assets/img/user-uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = req.session.user.username + '-' + Date.now() + ext;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

app.post('/upload-photo', upload.single('profileImage'), async (req, res) => {
  if (!req.session.user) return res.status(401).send('Unauthorized');

  const user = await User.findOne({ email: req.session.user.email });
  user.logo = '/assets/img/user-uploads/' + req.file.filename;
  await user.save();

  req.session.user.logo = user.logo;
  res.sendStatus(200);
});

const commentRoutes = require('./routes/comment');
app.use('/', commentRoutes);

// === Start Server ===
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server was RUNNING localhost://${process.env.PORT}`);
});

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }
  next();
}

app.get('/dashboard', requireLogin, (req, res) => {
  res.send('Halaman dashboard ini cuma bisa diakses kalau udah login!');
});

const profileRoutes = require('./routes/profile');
const User = require('./models/User'); // atau sesuaikan path-nya kalau beda
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
