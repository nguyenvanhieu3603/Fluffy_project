import { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { io } from 'socket.io-client';
import { FaUserCircle, FaPaperPlane, FaSearch } from 'react-icons/fa';

const ENDPOINT = "http://localhost:5000";
var socket;

const SellerChat = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
      if (user) {
          socket = io(ENDPOINT);
          socket.emit("setup", user);
          socket.on("message_received", (newMessageReceived) => {
              if (currentChat && currentChat._id === newMessageReceived.conversationId) {
                  setMessages((prev) => [...prev, newMessageReceived]);
              }
              // Refresh lại list conversation để update last message
              fetchConversations();
          });
      }
      return () => {
          if (socket) socket.disconnect();
      };
  }, [user, currentChat]);

  useEffect(() => {
      fetchConversations();
  }, []);

  useEffect(() => {
      if (currentChat) {
          fetchMessages(currentChat._id);
          socket.emit("join_chat", currentChat._id);
      }
  }, [currentChat]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
      try {
          const { data } = await api.get('/chat/conversations');
          setConversations(data);
      } catch (error) { console.error(error); }
  };

  const fetchMessages = async (id) => {
      try {
          const { data } = await api.get(`/chat/message/${id}`);
          setMessages(data);
      } catch (error) { console.error(error); }
  };

  const sendMessage = async (e) => {
      e.preventDefault();
      if (!newMessage.trim() || !currentChat) return;

      try {
          const { data } = await api.post('/chat/message', {
              conversationId: currentChat._id,
              text: newMessage
          });

          socket.emit("new_message", { ...data, conversationId: currentChat._id });
          setMessages([...messages, data]);
          setNewMessage("");
          fetchConversations(); // Update list bên trái
      } catch (error) { console.error(error); }
  };

  // Helper lấy thông tin người chat cùng (Khách hàng)
  const getReceiver = (members) => {
      return members.find(m => m._id !== user._id);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* SIDEBAR LIST */}
        <div className="w-1/3 border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-bold text-lg mb-2">Tin nhắn</h2>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400"/>
                    <input type="text" placeholder="Tìm khách hàng..." className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm outline-none"/>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => {
                    const receiver = getReceiver(conv.members);
                    return (
                        <div 
                            key={conv._id} 
                            onClick={() => setCurrentChat(conv)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${currentChat?._id === conv._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                        >
                            <img src={receiver?.avatar || "/uploads/default-avatar.jpg"} className="w-12 h-12 rounded-full object-cover border"/>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-800 truncate">{receiver?.fullName}</h4>
                                <p className={`text-sm truncate ${conv.lastMessageId !== user._id ? 'font-medium text-gray-800' : 'text-gray-500'}`}>
                                    {conv.lastMessageId === user._id ? 'Bạn: ' : ''}{conv.lastMessage}
                                </p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(conv.updatedAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* CHAT BOX */}
        <div className="w-2/3 flex flex-col">
            {currentChat ? (
                <>
                    {/* Header */}
                    <div className="p-4 border-b flex items-center gap-3 bg-white">
                        <img src={getReceiver(currentChat.members)?.avatar || "/uploads/default-avatar.jpg"} className="w-10 h-10 rounded-full object-cover"/>
                        <div>
                            <h3 className="font-bold text-gray-800">{getReceiver(currentChat.members)?.fullName}</h3>
                            <span className="text-xs text-green-500 flex items-center gap-1">● Đang hoạt động</span>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.sender === user._id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-3">
                        <input 
                            type="text" 
                            className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="Nhập tin nhắn..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
                            <FaPaperPlane />
                        </button>
                    </form>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
                    <FaUserCircle className="text-6xl mb-4 text-gray-200"/>
                    <p>Chọn một cuộc hội thoại để bắt đầu chat</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default SellerChat;