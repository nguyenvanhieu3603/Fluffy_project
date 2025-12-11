import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaStore } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Import api instance

const SellerRegister = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading

  const [formData, setFormData] = useState({
    shopName: '',
    shopAddress: '',
    shopDescription: '',
  });

  if (!user) {
    return <div className="text-center py-20">Vui lòng <a href="/login" className="text-blue-500">đăng nhập</a> để đăng ký bán hàng.</div>;
  }

  // Kiểm tra trạng thái hiện tại
  if (user.role === 'seller') {
      return (
        <div className="text-center py-20">
            <div className="text-2xl font-bold text-green-600 mb-4">Bạn đã là Người bán hàng!</div>
            <button onClick={() => navigate('/seller/dashboard')} className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-full">
                Vào trang quản lý
            </button>
        </div>
      );
  }

  // Nếu đã gửi yêu cầu và đang chờ duyệt
  if (user.sellerInfo?.status === 'pending') {
    return (
        <div className="text-center py-20 px-4">
             <FaStore className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Yêu cầu đang được xét duyệt</h2>
             <p className="text-gray-600 max-w-md mx-auto">
                 Chúng tôi đã nhận được hồ sơ đăng ký của shop <strong>{user.sellerInfo.shopName}</strong>. 
                 Vui lòng kiên nhẫn chờ đợi, Admin sẽ phản hồi trong vòng 24h.
             </p>
             <button onClick={() => navigate('/')} className="mt-8 text-[var(--color-primary)] hover:underline">
                 Về trang chủ
             </button>
        </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        // Gọi API backend
        const { data } = await api.post('/users/seller-register', formData);
        
        toast.success(data.message);
        
        // Cập nhật lại thông tin user trong LocalStorage hoặc bắt user login lại để refresh role (đơn giản nhất là báo thành công và chuyển trang)
        // Ở đây ta chuyển về trang profile hoặc home
        setTimeout(() => {
             // Reload lại trang để AuthContext cập nhật lại thông tin user mới (có sellerInfo.status = pending)
             window.location.reload(); 
        }, 1500);

    } catch (error) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <div className="text-center mb-8">
                <FaStore className="mx-auto h-12 w-12 text-[var(--color-primary)]" />
                <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Đăng ký trở thành Người bán</h2>
                <p className="mt-2 text-gray-600">Bắt đầu kinh doanh trên Fluffy và tiếp cận hàng ngàn khách hàng.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tên Gian hàng (Shop Name)</label>
                    <input
                        type="text"
                        name="shopName"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                        placeholder="Ví dụ: Pet Shop Sài Gòn"
                        value={formData.shopName}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Địa chỉ kho/cửa hàng</label>
                    <input
                        type="text"
                        name="shopAddress"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                        placeholder="Số nhà, đường, quận, thành phố..."
                        value={formData.shopAddress}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả gian hàng</label>
                    <textarea
                        name="shopDescription"
                        rows={4}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                        placeholder="Giới thiệu về shop của bạn..."
                        value={formData.shopDescription}
                        onChange={handleChange}
                    />
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-sm text-yellow-800">
                    <strong>Lưu ý:</strong> Yêu cầu của bạn sẽ được Admin xét duyệt trong vòng 24h.
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu đăng ký'}
                </button>
            </form>
        </div>
    </div>
  );
};

export default SellerRegister;