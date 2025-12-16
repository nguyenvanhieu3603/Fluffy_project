import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { io } from 'socket.io-client';
import { FaComments, FaPaperPlane, FaTimes, FaMinus } from 'react-icons/fa';

// URL Backend
const ENDPOINT = "http://localhost:5000";
var socket;

const CustomerChat = ({ sellerId }) => { // sellerId được truyền vào nếu đang ở trang chi tiết sản phẩm
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // 1. Kết nối Socket
  useEffect(() => {
    if (user) {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("message_received", (newMessageReceived) => {
            if (conversation && conversation._id === newMessageReceived.conversationId) {
                setMessages((prev) => [...prev, newMessageReceived]);
            }
        });
    }
    return () => {
        if (socket) socket.disconnect();
    };
  }, [user, conversation]);

  // 2. Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Khởi tạo hội thoại
  const initializeChat = async () => {
      if (!user) return alert("Vui lòng đăng nhập để chat!");
      if (!sellerId) return; // Chỉ chat khi biết chat với ai (ví dụ đang ở trang shop hoặc sản phẩm)

      setIsOpen(true);
      setLoading(true);
      try {
          // Tìm hoặc tạo hội thoại với Seller
          const { data } = await api.post('/chat/conversation', { receiverId: sellerId });
          setConversation(data);
          
          // Join room socket
          socket.emit("join_chat", data._id);

          // Lấy tin nhắn cũ
          const msgRes = await api.get(`/chat/message/${data._id}`);
          setMessages(msgRes.data);
      } catch (error) {
          console.error("Lỗi chat:", error);
      } finally {
          setLoading(false);
      }
  };

  const sendMessage = async (e) => {
      e.preventDefault();
      if (!newMessage.trim() || !conversation) return;

      try {
          const { data } = await api.post('/chat/message', {
              conversationId: conversation._id,
              text: newMessage
          });

          // Gửi qua socket
          socket.emit("new_message", { ...data, conversationId: conversation._id });

          setMessages([...messages, data]);
          setNewMessage("");
      } catch (error) {
          console.error("Lỗi gửi tin:", error);
      }
  };

  // Nếu không có sellerId (ví dụ ở trang chủ), không hiện nút chat hoặc hiện danh sách (tùy chọn)
  // Ở đây demo: Chỉ hiện khi có Seller cụ thể được truyền vào
  if (!sellerId) return null;

  return (
    <>
      {!isOpen && (
          <button 
            onClick={initializeChat}
            className="fixed bottom-6 right-6 bg-[var(--color-primary)] text-white p-4 rounded-full shadow-lg hover:bg-yellow-600 transition-all z-50 animate-bounce"
          >
              <FaComments className="text-2xl" />
          </button>
      )}

      {isOpen && (
          <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
              {/* Header */}
              <div className="bg-[var(--color-primary)] p-3 flex justify-between items-center text-white">
                  <span className="font-bold flex items-center gap-2">
                      <FaComments /> Chat với Shop
                  </span>
                  <div className="flex gap-2">
                      <button onClick={() => setIsOpen(false)}><FaMinus /></button>
                      <button onClick={() => setIsOpen(false)}><FaTimes /></button>
                  </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-3 overflow-y-auto bg-gray-50 flex flex-col gap-2">
                  {loading ? <div className="text-center text-gray-500 text-sm">Đang kết nối...</div> : 
                   messages.map((msg, idx) => (
                      <div key={idx} className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender === user._id ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-800 self-start'}`}>
                          {msg.text}
                      </div>
                  ))}
                  <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-2 border-t flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 border rounded-full px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="text-blue-500 hover:text-blue-700 px-2"><FaPaperPlane /></button>
              </form>
          </div>
      )}
    </>
  );
};

export default CustomerChat;