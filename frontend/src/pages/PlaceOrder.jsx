import { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { FaMapMarkerAlt, FaPhone, FaUser, FaBoxOpen } from 'react-icons/fa';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { cartItems, itemsPrice, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  // Lấy thông tin giao hàng từ LocalStorage
  const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo'));

  // Nếu không có thông tin giao hàng, đuổi về trang nhập
  useEffect(() => {
    if (!shippingInfo) {
      navigate('/shipping');
    }
  }, [shippingInfo, navigate]);

  // Tính toán chi phí
  const shippingPrice = itemsPrice > 5000000 ? 0 : 30000; // Miễn phí ship nếu đơn > 5tr
  const totalPrice = itemsPrice + shippingPrice;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const placeOrderHandler = async () => {
    setLoading(true);
    try {
      // Map dữ liệu từ CartItems sang chuẩn OrderItems của Backend
      const orderItemsParams = cartItems.map(item => ({
        name: item.name,
        quantity: item.qty,
        image: item.images[0],
        price: item.price,
        pet: item._id,
        totalItemPrice: item.price * item.qty,
        // --- QUAN TRỌNG: THÊM DÒNG NÀY ---
        // Lấy ID seller từ object seller trong cartItem
        seller: item.seller?._id || item.seller 
      }));

      const orderData = {
        orderItems: orderItemsParams,
        shippingInfo: shippingInfo,
        paymentMethod: 'COD',
        itemsPrice: itemsPrice,
        shippingPrice: shippingPrice,
        totalPrice: totalPrice,
      };

      const { data } = await api.post('/orders', orderData);
      
      toast.success('Đặt hàng thành công!');
      clearCart(); // Xóa giỏ hàng
      navigate('/my-orders'); // Chuyển về trang danh sách đơn hàng
    } catch (error) {
      console.error(error); // Log lỗi ra console để dễ debug
      toast.error(error.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Xác nhận đơn hàng</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: THÔNG TIN */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Địa chỉ */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-[var(--color-primary)]"/> Địa chỉ nhận hàng
                </h2>
                <div className="text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-800"><FaUser className="inline mr-1"/> {shippingInfo?.fullName}</p>
                    <p><FaPhone className="inline mr-1"/> {shippingInfo?.phone}</p>
                    <p className="mt-2">{shippingInfo?.address}</p>
                </div>
            </div>

            {/* 2. Sản phẩm */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaBoxOpen className="text-[var(--color-primary)]"/> Sản phẩm ({cartItems.length})
                </h2>
                <div className="divide-y divide-gray-100">
                    {cartItems.map((item, index) => (
                        <div key={index} className="py-4 flex items-center gap-4">
                            <img src={item.images[0]} alt={item.name} className="w-16 h-16 object-cover rounded-md border" />
                            <div className="flex-1">
                                <Link to={`/product/${item._id}`} className="font-medium text-gray-800 hover:text-[var(--color-primary)]">
                                    {item.name}
                                </Link>
                                <div className="text-sm text-gray-500">
                                    {item.qty} x {formatPrice(item.price)} = <span className="font-bold text-gray-800">{formatPrice(item.qty * item.price)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* CỘT PHẢI: TỔNG KẾT & THANH TOÁN */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Đơn hàng</h2>
                
                <div className="space-y-3 text-gray-600 text-sm">
                    <div className="flex justify-between">
                        <span>Tiền hàng:</span>
                        <span>{formatPrice(itemsPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Phí vận chuyển:</span>
                        <span>{formatPrice(shippingPrice)}</span>
                    </div>
                    <div className="border-t pt-3 mt-3 flex justify-between text-lg font-bold text-gray-900">
                        <span>Tổng cộng:</span>
                        <span className="text-[var(--color-primary)]">{formatPrice(totalPrice)}</span>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <input type="radio" checked readOnly className="text-[var(--color-primary)]" />
                            <span className="font-medium text-gray-700">Thanh toán khi nhận hàng (COD)</span>
                        </label>
                    </div>

                    <button 
                        onClick={placeOrderHandler}
                        disabled={loading}
                        className={`w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold shadow-lg hover:bg-yellow-600 transition-colors uppercase tracking-wide ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;