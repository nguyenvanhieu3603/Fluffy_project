// frontend/src/pages/Register.jsx
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaPaw } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Mật khẩu nhập lại không khớp');
    }
    try {
      await register(formData.fullName, formData.email, formData.password, formData.phone);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* CỘT TRÁI: FORM ĐĂNG KÝ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-full bg-orange-100 text-[var(--color-primary)] mb-4">
                <FaPaw className="text-3xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Tạo Tài Khoản</h2>
            <p className="text-gray-500 mt-2">Tham gia cộng đồng yêu thú cưng ngay hôm nay</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400"><FaUser /></span>
                <input
                  type="text" name="fullName"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Nguyễn Văn A"
                  onChange={handleChange} required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400"><FaEnvelope /></span>
                <input
                  type="email" name="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="name@example.com"
                  onChange={handleChange} required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400"><FaPhone /></span>
                <input
                  type="text" name="phone"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="0901234567"
                  onChange={handleChange} required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400"><FaLock /></span>
                    <input
                    type="password" name="password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="••••••••"
                    onChange={handleChange} required
                    />
                </div>
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại MK</label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400"><FaLock /></span>
                    <input
                    type="password" name="confirmPassword"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="••••••••"
                    onChange={handleChange} required
                    />
                </div>
                </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold text-lg hover:bg-yellow-600 transition duration-300 shadow-md mt-4"
            >
              Đăng Ký
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-[var(--color-primary)] font-bold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>

       {/* CỘT PHẢI: ẢNH (Ẩn trên mobile) */}
       <div className="hidden lg:flex w-1/2 bg-blue-50 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
             {/* Link ảnh Mèo online */}
            <img 
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop" 
                alt="Cute Cat" 
                className="w-full h-full object-cover"
            />
             <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="relative z-10 text-white text-center p-12">
            <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Gia nhập đại gia đình Fluffy</h2>
            <p className="text-lg drop-shadow-md">Chăm sóc thú cưng chưa bao giờ dễ dàng đến thế.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;