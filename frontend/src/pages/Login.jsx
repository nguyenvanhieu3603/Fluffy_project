// frontend/src/pages/Login.jsx
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaPaw } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* CỘT TRÁI: ẢNH (Ẩn trên mobile, hiện trên PC) */}
      <div className="hidden lg:flex w-1/2 bg-orange-50 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
            {/* Bạn có thể thay link ảnh này bằng ảnh trong folder public của bạn */}
            <img 
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop" 
                alt="Cute Dog" 
                className="w-full h-full object-cover"
            />
            {/* Lớp phủ màu để chữ nổi hơn nếu cần */}
            <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="relative z-10 text-white text-center p-12">
            <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Chào mừng trở lại!</h2>
            <p className="text-lg drop-shadow-md">Những người bạn nhỏ đang chờ đợi bạn.</p>
        </div>
      </div>

      {/* CỘT PHẢI: FORM ĐĂNG NHẬP */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-full bg-orange-100 text-[var(--color-primary)] mb-4">
                <FaPaw className="text-3xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Đăng Nhập</h2>
            <p className="text-gray-500 mt-2">Nhập thông tin để truy cập tài khoản</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400"><FaEnvelope /></span>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <Link to="/forgot-password" class="text-xs text-[var(--color-primary)] hover:underline">Quên mật khẩu?</Link>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400"><FaLock /></span>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold text-lg hover:bg-yellow-600 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Đăng Nhập
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" className="text-[var(--color-primary)] font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;