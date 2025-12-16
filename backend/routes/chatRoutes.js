const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    accessConversation, 
    getConversations, 
    sendMessage, 
    getMessages 
} = require('../controllers/chatController');

router.post('/conversation', protect, accessConversation); // Tạo/Lấy hội thoại
router.get('/conversations', protect, getConversations);   // Lấy danh sách hội thoại
router.post('/message', protect, sendMessage);             // Gửi tin nhắn
router.get('/message/:conversationId', protect, getMessages); // Lấy nội dung tin nhắn

module.exports = router;