const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Kirim komentar baru
router.post('/comment', async (req, res) => {
  const { content, parentId } = req.body;
  const user = req.session.user;

  if (!user) return res.status(401).send("Login dulu bro.");

  const comment = new Comment({
    username: user.username,
    content,
    role: user.role,
    parentId: parentId || null
  });

  await comment.save();
  res.status(201).json(comment);
});

// Ambil semua komentar (termasuk balasan)
router.get('/comments', async (req, res) => {
  const comments = await Comment.find().sort({ createdAt: 1 });
  res.json(comments);
});

module.exports = router;
