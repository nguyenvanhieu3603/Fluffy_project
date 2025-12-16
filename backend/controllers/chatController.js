const { Conversation, Message } = require('../models/chatModel');

// 1. Tạo hoặc Lấy cuộc hội thoại giữa 2 người (Người mua & Người bán)
const accessConversation = async (req, res) => {
  try {
    const { receiverId } = req.body; // ID người nhận (Shop hoặc Khách)
    const senderId = req.user._id;

    // Tìm xem đã có hội thoại chưa
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] }
    }).populate('members', 'fullName avatar email sellerInfo');

    if (conversation) {
      res.json(conversation);
    } else {
      // Nếu chưa, tạo mới
      const newConv = new Conversation({
        members: [senderId, receiverId]
      });
      const savedConv = await newConv.save();
      const populatedConv = await Conversation.findById(savedConv._id)
        .populate('members', 'fullName avatar email sellerInfo');
      res.status(201).json(populatedConv);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Lấy danh sách các cuộc hội thoại của User (Dùng cho cả Seller và Customer)
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.user._id] }
    })
    .populate('members', 'fullName avatar email sellerInfo')
    .sort({ updatedAt: -1 }); // Mới nhất lên đầu

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Gửi tin nhắn mới
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user._id;

    const newMessage = new Message({
      conversationId,
      sender: senderId,
      text
    });

    const savedMessage = await newMessage.save();

    // Cập nhật lastMessage cho hội thoại
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastMessageId: senderId
    });

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Lấy lịch sử tin nhắn của một hội thoại
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  accessConversation,
  getConversations,
  sendMessage,
  getMessages
};