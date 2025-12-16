import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const { data } = await api.get('/users/profile');
          setUser(data);
        } catch (error) {
          console.error("Lỗi xác thực:", error);
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
      
      if (data.role === 'admin') {
          navigate('/admin/dashboard'); 
      } else if (data.role === 'seller') {
          navigate('/seller/dashboard'); 
      } else {
          navigate('/'); 
      }

      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
      throw error; 
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
      throw error;
    }
  };

  const logout = () => {
    // 1. Xóa Token
    localStorage.removeItem('token');
    
    // 2. Xóa dữ liệu Giỏ hàng & Ship để người sau không thấy
    localStorage.removeItem('cartItems');
    localStorage.removeItem('shippingInfo');

    // 3. Reset State
    setUser(null);
    toast.info('Đã đăng xuất');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-yellow-600 animate-pulse">
          Đang tải dữ liệu...
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