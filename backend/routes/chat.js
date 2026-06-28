const express = require('express');
const router = express.Router({ mergeParams: true });
const { chat, getChatHistory } = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', chat);
router.get('/history', getChatHistory);

module.exports = router;