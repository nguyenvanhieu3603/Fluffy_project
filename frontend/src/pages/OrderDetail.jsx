import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaMapMarkerAlt, FaPhone, FaUser, FaBoxOpen, FaClock } from 'react-icons/fa';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        toast.error('Lỗi khi tải đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
      if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
          try {
              await api.put(`/orders/${id}/cancel`);
              toast.success('Đã hủy đơn hàng thành công');
              // Reload lại thông tin đơn hàng
              const { data } = await api.get(`/orders/${id}`);
              setOrder(data);
          } catch (error) {
              toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
          }
      }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return <div className="text-center py-20">Đang tải chi tiết đơn hàng...</div>;
  if (!order) return <div className="text-center py-20">Không tìm thấy đơn hàng.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/my-orders" className="inline-flex items-center text-gray-500 hover:text-[var(--color-primary)] mb-6">
          <FaArrowLeft className="mr-2" /> Quay lại danh sách đơn hàng
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  Đơn hàng #{order._id.slice(-6).toUpperCase()}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                  Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
          </div>
          <div className="mt-4 md:mt-0">
             {/* Badge Trạng Thái */}
             <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase 
                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {order.status === 'pending' ? 'Chờ xác nhận' : 
                 order.status === 'cancelled' ? 'Đã hủy' : 
                 order.status === 'delivered' ? 'Đã giao' : order.status}
             </span>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Thông tin giao hàng */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-[var(--color-primary)]"/> Địa chỉ nhận hàng
                </h2>
                <div className="text-gray-700">
                    <p className="font-semibold"><FaUser className="inline mr-2 text-gray-400"/> {order.shippingInfo.fullName}</p>
                    <p className="mt-2"><FaPhone className="inline mr-2 text-gray-400"/> {order.shippingInfo.phone}</p>
                    <p className="mt-2"><FaMapMarkerAlt className="inline mr-2 text-gray-400"/> {order.shippingInfo.address}</p>
                </div>
            </div>

            {/* 2. Danh sách sản phẩm */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaBoxOpen className="text-[var(--color-primary)]"/> Sản phẩm
                </h2>
                <div className="divide-y divide-gray-100">
                    {order.orderItems.map((item, index) => (
                        <div key={index} className="py-4 flex items-center gap-4">
                            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md border bg-gray-50" />
                            <div className="flex-1">
                                <Link to={`/product/${item.pet}`} className="font-medium text-gray-800 hover:text-[var(--color-primary)]">
                                    {item.name}
                                </Link>
                                <div className="text-sm text-gray-500 mt-1">
                                    Số lượng: {item.quantity}
                                </div>
                                <div className="text-sm font-bold text-[var(--color-primary)] mt-1">
                                    {formatPrice(item.price)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* CỘT PHẢI: THANH TOÁN & ACTION */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Tổng thanh toán</h2>
                
                <div className="space-y-3 text-gray-600 text-sm border-b border-gray-100 pb-4 mb-4">
                    <div className="flex justify-between">
                        <span>Tiền hàng:</span>
                        <span>{formatPrice(order.prices.itemsPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Phí vận chuyển:</span>
                        <span>{formatPrice(order.prices.shippingPrice)}</span>
                    </div>
                </div>
                
                <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                    <span>Tổng tiền:</span>
                    <span className="text-[var(--color-primary)]">{formatPrice(order.prices.totalPrice)}</span>
                </div>

                <div className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
                    Phương thức: <span className="font-semibold text-gray-700">{order.paymentMethod}</span>
                </div>

                {/* NÚT HỦY ĐƠN (Chỉ hiện khi pending) */}
                {order.status === 'pending' && (
                    <button 
                        onClick={handleCancelOrder}
                        className="w-full bg-red-100 text-red-600 py-3 rounded-lg font-bold hover:bg-red-200 transition-colors border border-red-200"
                    >
                        Hủy đơn hàng
                    </button>
                )}
                
                {/* Thông tin thêm */}
                {order.status === 'cancelled' && (
                    <div className="text-center text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg">
                        Đơn hàng đã bị hủy vào {new Date(order.cancelledAt).toLocaleDateString('vi-VN')}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;