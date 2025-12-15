import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Mặc định là đang tải
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Gọi API lấy thông tin user
          const { data } = await api.get('/users/profile');
          setUser(data);
        } catch (error) {
          console.error("Lỗi xác thực:", error);
          // Nếu token lỗi thì xóa đi để tránh kẹt
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      

      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/users/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data);
      toast.success(`Chào mừng ${data.fullName}!`);
      
      // --- LOGIC CHUYỂN HƯỚNG SAU KHI ĐĂNG NHẬP ---
      if (data.role === 'admin') {
          navigate('/admin/dashboard'); // Admin vào Dashboard quản trị
      } else if (data.role === 'seller') {
          navigate('/seller/dashboard'); // Seller vào Kênh người bán
      } else {
          navigate('/'); // Khách hàng về trang chủ
      }
      // --------------------------------------------

      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const { data } = await api.post('/users/register', { fullName, email, password });
      localStorage.setItem('token', data.token);
      setUser(data);
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Đã đăng xuất');
    navigate('/login');
  };

  // Màn hình chờ khi đang check login (Thay vì màn hình trắng)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-yellow-600 animate-pulse">
          Đang tải dữ liệu Fluffy...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};