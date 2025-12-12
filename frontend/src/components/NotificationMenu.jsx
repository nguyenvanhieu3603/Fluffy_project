import { useState, useEffect, useRef } from 'react';
import { FaBell, FaCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './NotificationMenu.css'; 

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  // Fetch thông báo
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Lỗi tải thông báo", error);
    }
  };

  // Gọi API mỗi khi mở menu hoặc lần đầu load
  useEffect(() => {
    fetchNotifications();

  }, []);

  // Xử lý click ra ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRead = async (id, link) => {
      try {
          await api.put(`/notifications/${id}/read`);
          // Cập nhật UI local luôn cho nhanh
          setNotifications(prev => prev.map(n => n._id === id ? {...n, isRead: true} : n));
          setUnreadCount(prev => Math.max(0, prev - 1));
          setIsOpen(false); // Đóng menu
      } catch (error) {
          console.error(error);
      }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Icon Chuông */}
      <button 
        onClick={() => { setIsOpen(!isOpen); if(!isOpen) fetchNotifications(); }}
        className="relative text-gray-600 hover:text-[var(--color-primary)] transition-colors text-2xl p-1"
      >
        <FaBell />
        {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white transform translate-x-1 -translate-y-1">
                {unreadCount > 9 ? '9+' : unreadCount}
            </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in origin-top-right">
            <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Thông báo</h3>
                <span className="text-xs text-gray-500">Mới nhận</span>
            </div>
            
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">
                        Chưa có thông báo nào
                    </div>
                ) : (
                    notifications.map(notif => (
                        <Link 
                            to={notif.link || '#'} 
                            key={notif._id}
                            onClick={() => handleRead(notif._id)}
                            className={`block p-3 border-b border-gray-50 hover:bg-yellow-50 transition-colors ${!notif.isRead ? 'bg-blue-50/50' : 'bg-white'}`}
                        >
                            <div className="flex gap-3">
                                <div className="mt-1">
                                    {/* Icon tùy loại thông báo */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${notif.type === 'order' ? 'bg-[var(--color-primary)]' : 'bg-blue-500'}`}>
                                        <FaBell />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>{notif.title}</h4>
                                        {!notif.isRead && <FaCircle className="text-[8px] text-red-500 mt-1"/>}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                                    <span className="text-[10px] text-gray-400 mt-1 block">
                                        {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
            
            <div className="p-2 text-center border-t border-gray-100 bg-gray-50">
                <button className="text-xs font-bold text-[var(--color-primary)] hover:underline">
                    Đánh dấu tất cả là đã đọc
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;