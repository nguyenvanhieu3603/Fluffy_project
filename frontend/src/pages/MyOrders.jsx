import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { FaList, FaEye, FaSearch, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Danh sách tabs (Thêm completed)
  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'shipping', label: 'Vận chuyển' },
    { id: 'delivered', label: 'Chờ giao hàng' }, // delivered = shipper đã giao, chờ khách confirm
    { id: 'completed', label: 'Hoàn thành' },    // completed = khách đã bấm nhận
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Hàm xử lý bấm "Đã nhận hàng"
  const handleConfirmReceived = async (id) => {
      if(window.confirm('Bạn xác nhận đã nhận được hàng và sản phẩm không có vấn đề gì chứ?')) {
          try {
              await api.put(`/orders/${id}/received`);
              toast.success('Cảm ơn bạn đã mua hàng!');
              fetchOrders(); // Load lại để cập nhật trạng thái
          } catch (error) {
              toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
          }
      }
  };

  const filteredOrders = orders.filter(order => {
      if (activeTab === 'all') return true;
      if (activeTab === 'shipping') return order.status === 'confirmed' || order.status === 'shipping';
      return order.status === activeTab;
  });

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getStatusColor = (status) => {
      switch(status) {
          case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'shipping': return 'bg-purple-100 text-purple-800 border-purple-200';
          case 'delivered': return 'bg-orange-100 text-orange-800 border-orange-200'; // Đã giao, chờ confirm
          case 'completed': return 'bg-green-100 text-green-800 border-green-200';   // Đã xong
          case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  const getStatusText = (status) => {
    switch(status) {
        case 'pending': return 'Chờ xác nhận';
        case 'confirmed': return 'Đã xác nhận';
        case 'shipping': return 'Đang giao hàng';
        case 'delivered': return 'Đã giao hàng';
        case 'completed': return 'Hoàn thành';
        case 'cancelled': return 'Đã hủy';
        default: return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header & Tabs */}
      <div className="bg-white rounded-t-xl shadow-sm border-b border-gray-200 sticky top-20 z-10">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaList className="text-[var(--color-primary)]"/> Đơn mua
              </h1>
          </div>
          <div className="flex overflow-x-auto no-scrollbar">
              {tabs.map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                          activeTab === tab.id 
                          ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                          : 'border-transparent text-gray-500 hover:text-[var(--color-primary)]'
                      }`}
                  >
                      {tab.label}
                  </button>
              ))}
          </div>
      </div>

      {/* List Orders */}
      <div className="mt-4 space-y-4">
        {loading ? (
            <div className="text-center py-20 text-gray-500">Đang tải đơn hàng...</div>
        ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <p className="text-gray-500 text-lg mb-4">Chưa có đơn hàng nào.</p>
                <Link to="/pets" className="inline-block bg-[var(--color-primary)] text-white px-6 py-2 rounded-full font-bold">Mua sắm ngay</Link>
            </div>
        ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                 <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                        <span className="text-gray-400 text-xs hidden md:inline">|</span>
                        <span className="text-gray-500 text-sm hidden md:inline">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className={`px-3 py-1 rounded border text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                    </div>
                 </div>

                 {order.orderItems.map((item, idx) => (
                    <div key={idx} className="p-6 flex items-start gap-4 border-b border-gray-50 last:border-0">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md border border-gray-200 bg-gray-100" />
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-800 text-lg mb-1">{item.name}</h3>
                            <div className="flex justify-between items-end">
                                <div className="text-sm text-gray-500">x{item.quantity}</div>
                                <div className="text-[var(--color-primary)] font-medium">{formatPrice(item.price)}</div>
                            </div>
                        </div>
                    </div>
                 ))}

                 <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-gray-600 text-sm">
                        Tổng số tiền: <span className="text-xl font-bold text-[var(--color-primary)] ml-1">{formatPrice(order.prices.totalPrice)}</span>
                    </div>
                    
                    <div className="flex gap-3">
                        <Link to={`/order/${order._id}`} className="px-6 py-2 rounded border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors">
                            Xem Chi Tiết
                        </Link>
                        
                        {/* NÚT ĐÃ NHẬN ĐƯỢC HÀNG (Chỉ hiện khi status là delivered) */}
                        {order.status === 'delivered' && (
                             <button 
                                onClick={() => handleConfirmReceived(order._id)}
                                className="px-6 py-2 rounded bg-[var(--color-primary)] text-white font-medium hover:bg-yellow-600 transition-colors shadow-sm flex items-center gap-2"
                             >
                                <FaCheckCircle /> Đã nhận được hàng
                             </button>
                        )}

                        {order.status === 'completed' && (
                             <button className="px-6 py-2 rounded bg-[var(--color-primary)] text-white font-medium hover:bg-yellow-600 transition-colors shadow-sm">
                                Mua Lại
                             </button>
                        )}
                    </div>
                 </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;