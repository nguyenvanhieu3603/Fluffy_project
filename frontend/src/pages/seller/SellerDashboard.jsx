import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- MỚI: Import hook điều hướng
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaShoppingBag, FaBoxOpen, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Đăng ký Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SellerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // <--- MỚI: Khởi tạo hook
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/orders/seller-stats');
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Cấu hình biểu đồ
  const chartData = {
    labels: stats.monthlyRevenue?.map(item => item.name) || [], // Thêm optional chaining để tránh lỗi null
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: stats.monthlyRevenue?.map(item => item.sales) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Màu xanh dương (Blue-500)
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Biểu đồ Doanh thu 6 tháng gần nhất' },
    },
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu kinh doanh...</div>;

  const StatCard = ({ title, value, icon, color, bg }) => (
      <div className={`p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between bg-white`}>
          <div>
              <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
          </div>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${color} ${bg}`}>
              {icon}
          </div>
      </div>
  );

  return (
    <div>
      <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Xin chào, {user?.sellerInfo?.shopName}!</h2>
          <p className="text-gray-500">Đây là tình hình kinh doanh của shop bạn hôm nay.</p>
      </div>
      
      {/* 4 THẺ THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Tổng Doanh Thu" 
            value={formatPrice(stats.totalRevenue)} 
            icon={<FaMoneyBillWave />} 
            color="text-green-600" 
            bg="bg-green-100"
          />
          <StatCard 
            title="Tổng Đơn Hàng" 
            value={stats.totalOrders} 
            icon={<FaClipboardList />} 
            color="text-blue-600" 
            bg="bg-blue-100"
          />
          <StatCard 
            title="Sản Phẩm" 
            value={stats.totalProducts} 
            icon={<FaBoxOpen />} 
            color="text-purple-600" 
            bg="bg-purple-100"
          />
          <StatCard 
            title="Chờ Xử Lý" 
            value={stats.pendingOrders} 
            icon={<FaShoppingBag />} 
            color="text-yellow-600" 
            bg="bg-yellow-100"
          />
      </div>

      {/* BIỂU ĐỒ & LỜI NHẮN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột Biểu đồ (Chiếm 2 phần) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Bar options={chartOptions} data={chartData} />
          </div>

          {/* Cột Thông tin bên phải (Chiếm 1 phần) */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                  <h3 className="font-bold text-blue-800 mb-2">Mẹo bán hàng</h3>
                  <ul className="list-disc list-inside text-sm text-blue-700 space-y-2">
                      <li>Trả lời tin nhắn khách hàng nhanh chóng.</li>
                      <li>Đóng gói hàng cẩn thận để tránh hư hỏng.</li>
                      <li>Cập nhật trạng thái đơn hàng kịp thời.</li>
                      <li>Đăng thêm sản phẩm mới để thu hút khách.</li>
                  </ul>
              </div>

              {stats.pendingOrders > 0 ? (
                  <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-xl">
                      <h3 className="font-bold text-yellow-800 mb-2">Cần xử lý ngay!</h3>
                      <p className="text-sm text-yellow-700 mb-4">Bạn có <strong>{stats.pendingOrders} đơn hàng</strong> mới đang chờ xác nhận.</p>
                      <button 
                        onClick={() => navigate('/seller/orders')} // <--- MỚI: Điều hướng
                        className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold hover:bg-yellow-600 shadow-sm transition-colors"
                      >
                          Xử lý ngay
                      </button>
                  </div>
              ) : (
                  <div className="bg-green-50 border border-green-100 p-6 rounded-xl text-center">
                      <h3 className="font-bold text-green-800 mb-2">Tuyệt vời!</h3>
                      <p className="text-sm text-green-700">Bạn đã xử lý hết các đơn hàng mới.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default SellerDashboard;