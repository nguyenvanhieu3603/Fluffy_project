import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaBox, FaCheck, FaTruck, FaCheckDouble } from 'react-icons/fa';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/seller-orders');
      setOrders(data);
    } catch (error) {
      toast.error('Lỗi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Hàm xử lý đổi trạng thái
  const updateStatusHandler = async (id, newStatus) => {
      try {
          await api.put(`/orders/${id}/status`, { status: newStatus });
          toast.success(`Cập nhật trạng thái: ${newStatus} thành công!`);
          fetchOrders(); // Load lại dữ liệu mới
      } catch (error) {
          toast.error('Cập nhật thất bại');
      }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getStatusBadge = (status) => {
      switch(status) {
          case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold uppercase">Chờ duyệt</span>;
          case 'confirmed': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold uppercase">Đã xác nhận</span>;
          case 'shipping': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold uppercase">Đang giao</span>;
          case 'delivered': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold uppercase">Hoàn thành</span>;
          case 'cancelled': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold uppercase">Đã hủy</span>;
          default: return status;
      }
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaBox className="text-[var(--color-primary)]"/> Quản lý Đơn hàng
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <th className="p-4 border-b">Mã đơn</th>
                    <th className="p-4 border-b">Khách hàng</th>
                    <th className="p-4 border-b">Sản phẩm</th>
                    <th className="p-4 border-b">Tổng tiền</th>
                    <th className="p-4 border-b">Trạng thái</th>
                    <th className="p-4 border-b">Hành động</th>
                </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
                {orders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-700">#{order._id.slice(-6).toUpperCase()}</td>
                        <td className="p-4">
                            <div className="font-semibold">{order.shippingInfo.fullName}</div>
                            <div className="text-xs text-gray-500">{order.shippingInfo.phone}</div>
                        </td>
                        <td className="p-4 max-w-xs">
                             {order.orderItems.map((item, idx) => (
                                 <div key={idx} className="flex items-center gap-2 mb-1">
                                     <img src={item.image} className="w-8 h-8 rounded object-cover border"/>
                                     <span className="truncate">{item.name} (x{item.quantity})</span>
                                 </div>
                             ))}
                        </td>
                        <td className="p-4 font-bold text-[var(--color-primary)]">{formatPrice(order.prices.totalPrice)}</td>
                        <td className="p-4">{getStatusBadge(order.status)}</td>
                        <td className="p-4">
                            {/* CÁC NÚT HÀNH ĐỘNG DỰA TRÊN TRẠNG THÁI */}
                            {order.status === 'pending' && (
                                <button 
                                    onClick={() => updateStatusHandler(order._id, 'confirmed')}
                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1 text-xs shadow-sm"
                                >
                                    <FaCheck /> Xác nhận
                                </button>
                            )}
                            
                            {order.status === 'confirmed' && (
                                <button 
                                    onClick={() => updateStatusHandler(order._id, 'shipping')}
                                    className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 flex items-center gap-1 text-xs shadow-sm"
                                >
                                    <FaTruck /> Giao hàng
                                </button>
                            )}

                            {order.status === 'shipping' && (
                                <button 
                                    onClick={() => updateStatusHandler(order._id, 'delivered')}
                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1 text-xs shadow-sm"
                                >
                                    <FaCheckDouble /> Hoàn thành
                                </button>
                            )}
                            
                            {/* Đơn đã hủy hoặc hoàn thành thì không làm gì */}
                            {(order.status === 'cancelled' || order.status === 'delivered') && (
                                <span className="text-gray-400 text-xs italic">Đã chốt</span>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerOrders;