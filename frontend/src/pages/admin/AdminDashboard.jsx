import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaUsers, FaPaw, FaStore, FaMoneyBillWave, FaBlog } from 'react-icons/fa';
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

// Đăng ký các thành phần biểu đồ
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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
    monthlyRevenue: []
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

  // Cấu hình dữ liệu biểu đồ
  const chartData = {
    labels: stats.monthlyRevenue.map(item => item.name),
    datasets: [
      {
        label: 'Hoa hồng nhận được (VND)',
        data: stats.monthlyRevenue.map(item => item.Total),
        backgroundColor: 'rgba(245, 158, 11, 0.8)', // Màu primary (#F59E0B)
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Biểu đồ Hoa hồng 6 tháng gần nhất' },
    },
  };

  if (loading) return <div className="p-8">Đang tải thống kê...</div>;

  const StatCard = ({ title, value, subValue, icon, color }) => (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
              <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan Quản trị</h2>
      
      {/* 4 THẺ THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Hoa Hồng (10%)" 
            value={formatPrice(stats.totalCommission)} 
            subValue={`Tổng GMV: ${formatPrice(stats.totalSalesVolume)}`}
            icon={<FaMoneyBillWave />} 
            color="bg-green-100 text-green-600" 
          />
          <StatCard 
            title="Người Bán" 
            value={stats.totalSellers} 
            icon={<FaStore />} 
            color="bg-blue-100 text-blue-600" 
          />
           <StatCard 
            title="Người Dùng" 
            value={stats.totalUsers} 
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

      {/* BIỂU ĐỒ */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <Bar options={chartOptions} data={chartData} height={100} />
      </div>



      {/* GHI CHÚ */}
      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100">
          <strong>Lưu ý quản trị:</strong> Doanh thu hiển thị ở đây là phần <strong>hoa hồng (10%)</strong> mà sàn nhận được từ các đơn hàng đã giao thành công. Admin không chịu trách nhiệm xử lý đơn hàng chi tiết.
      </div>
    </div>
  );
};

export default AdminDashboard;