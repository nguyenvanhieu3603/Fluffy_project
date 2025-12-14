import { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaUsers, FaPaw, FaStore, FaMoneyBillWave, FaShoppingCart } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Đăng ký đầy đủ các thành phần biểu đồ
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalSalesVolume: 0,
    totalCommission: 0,
    pendingOrders: 0,
    monthlyRevenue: [],
    monthlyUserGrowth: [],
    statusDistribution: { pending: 0, confirmed: 0, shipping: 0, completed: 0, cancelled: 0 }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
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

  // --- CẤU HÌNH BIỂU ĐỒ ---

  // 1. Bar Chart: Doanh thu (Hoa hồng)
  const revenueChartData = {
    labels: stats.monthlyRevenue?.map(item => item.name) || [],
    datasets: [
      {
        label: 'Hoa hồng (VND)',
        data: stats.monthlyRevenue?.map(item => item.value) || [],
        backgroundColor: '#F59E0B',
        borderRadius: 6,
      },
    ],
  };

  // 2. Line Chart: Tăng trưởng User (MỚI)
  const userGrowthData = {
    labels: stats.monthlyUserGrowth?.map(item => item.name) || [],
    datasets: [
      {
        label: 'Khách hàng mới',
        data: stats.monthlyUserGrowth?.map(item => item.value) || [],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4, // Đường cong mềm mại
        fill: true,
      },
    ],
  };

  // 3. Doughnut Chart: Trạng thái đơn hàng (MỚI)
  const orderStatusData = {
    labels: ['Chờ duyệt', 'Đã xác nhận', 'Đang giao', 'Hoàn thành', 'Đã hủy'],
    datasets: [
      {
        data: [
            stats.statusDistribution?.pending || 0,
            stats.statusDistribution?.confirmed || 0,
            stats.statusDistribution?.shipping || 0,
            stats.statusDistribution?.completed || 0,
            stats.statusDistribution?.cancelled || 0,
        ],
        backgroundColor: [
          '#FCD34D', // Yellow (Pending)
          '#60A5FA', // Blue (Confirmed)
          '#A78BFA', // Purple (Shipping)
          '#34D399', // Green (Completed)
          '#F87171', // Red (Cancelled)
        ],
        borderWidth: 0,
      },
    ],
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Đang tải thống kê hệ thống...</div>;

  const StatCard = ({ title, value, subValue, icon, color }) => (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{title}</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">{value}</h3>
              {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${color}`}>
              {icon}
          </div>
      </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Quản trị</h2>
      
      {/* HÀNG 1: THẺ THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Tổng Hoa Hồng" 
            value={formatPrice(stats.totalCommission)} 
            subValue={`Trên tổng GMV: ${formatPrice(stats.totalSalesVolume)}`}
            icon={<FaMoneyBillWave />} 
            color="bg-green-100 text-green-600" 
          />
          <StatCard 
            title="Đơn Chờ Duyệt" 
            value={stats.pendingOrders} 
            subValue="Cần xử lý ngay"
            icon={<FaShoppingCart />} 
            color="bg-red-100 text-red-600" 
          />
           <StatCard 
            title="Người Dùng" 
            value={stats.totalUsers}
            subValue={`${stats.totalSellers} Người bán hàng`} 
            icon={<FaUsers />} 
            color="bg-purple-100 text-purple-600" 
          />
          <StatCard 
            title="Sản Phẩm" 
            value={stats.totalProducts} 
            icon={<FaPaw />} 
            color="bg-yellow-100 text-yellow-600" 
          />
      </div>

      {/* HÀNG 2: BIỂU ĐỒ CHÍNH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Cột Trái: Biểu đồ Doanh thu (Chiếm 2 phần) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4">Biểu đồ Hoa hồng (6 tháng)</h3>
              <div className="h-64">
                  <Bar options={{ responsive: true, maintainAspectRatio: false }} data={revenueChartData} />
              </div>
          </div>

          {/* Cột Phải: Biểu đồ Tròn trạng thái đơn (Chiếm 1 phần) */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <h3 className="font-bold text-gray-700 mb-4 w-full text-left">Tỷ lệ đơn hàng</h3>
              <div className="h-56 w-full flex justify-center">
                  <Doughnut options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} data={orderStatusData} />
              </div>
          </div>
      </div>

      {/* HÀNG 3: BIỂU ĐỒ TĂNG TRƯỞNG & GHI CHÚ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4">Tăng trưởng Khách hàng mới</h3>
              <div className="h-64">
                  <Line options={{ responsive: true, maintainAspectRatio: false }} data={userGrowthData} />
              </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
              <div className="bg-blue-50 text-blue-800 p-5 rounded-xl text-sm border border-blue-100">
                  <h4 className="font-bold mb-2 flex items-center gap-2"><FaStore /> Thông tin hệ thống</h4>
                  <p>Hệ thống hiện đang vận hành ổn định. Doanh thu hiển thị là phần <strong>hoa hồng 10%</strong> thực nhận từ các đơn hàng hoàn tất.</p>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-700 mb-3">Thao tác nhanh</h4>
                  <div className="space-y-2">
                      <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm text-gray-600 transition-colors">
                          • Xuất báo cáo doanh thu
                      </button>
                      <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm text-gray-600 transition-colors">
                          • Gửi thông báo toàn hệ thống
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;