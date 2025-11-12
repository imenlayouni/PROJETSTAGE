const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');

// Get messages between two users (sender and recipient)
router.get('/:userId/:otherId', async (req, res) => {
  try {
    const { userId, otherId } = req.params;
    console.log(`GET /api/chats/${userId}/${otherId} requested`);
    const msgs = await Chat.find({
      $or: [
        { senderId: userId, recipientId: otherId },
        { senderId: otherId, recipientId: userId }
      ]
    }).sort({ createdAt: 1 });
    console.log(`Returned ${msgs.length} messages for ${userId} <-> ${otherId}`);
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug: return latest messages
router.get('/debug/latest', async (req, res) => {
  try {
    const msgs = await Chat.find().sort({ createdAt: -1 }).limit(50);
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a message
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/chats body:', req.body);
    const { senderId, recipientId, message } = req.body;
    if (!senderId || !recipientId || !message) {
      return res.status(400).json({ error: 'senderId, recipientId and message are required' });
    }
    const chat = await Chat.create({ senderId, recipientId, message });
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
