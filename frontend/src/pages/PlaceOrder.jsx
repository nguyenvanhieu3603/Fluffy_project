import { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { FaMapMarkerAlt, FaPhone, FaUser, FaBoxOpen, FaMoneyBillWave, FaCreditCard, FaTicketAlt } from 'react-icons/fa';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { cartItems, itemsPrice, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // --- STATE COUPON ---
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo'));

  useEffect(() => {
    if (!shippingInfo) {
      navigate('/shipping');
    }
  }, [shippingInfo, navigate]);

  const shippingPrice = itemsPrice > 5000000 ? 0 : 30000;
  
  // Tổng tiền cuối cùng = Tiền hàng + Ship - Giảm giá
  const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountAmount);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // --- HÀM KIỂM TRA COUPON ---
  const applyCouponHandler = async () => {
      if(!couponCode.trim()) return toast.error('Vui lòng nhập mã giảm giá');
      setCouponLoading(true);
      try {
          const { data } = await api.post('/coupons/validate', {
              code: couponCode,
              orderTotal: itemsPrice // Gửi tổng tiền hàng (chưa ship) để check điều kiện
          });
          
          setDiscountAmount(data.discountPrice);
          setCouponApplied(couponCode);
          toast.success(`Áp dụng mã thành công! Giảm ${formatPrice(data.discountPrice)}`);
      } catch (error) {
          setDiscountAmount(0);
          setCouponApplied('');
          toast.error(error.response?.data?.message || 'Mã không hợp lệ');
      } finally {
          setCouponLoading(false);
      }
  };

  const placeOrderHandler = async () => {
    setLoading(true);
    try {
      const orderItemsParams = cartItems.map(item => ({
        name: item.name,
        quantity: item.qty,
        image: item.images[0],
        price: item.price,
        pet: item._id,
        totalItemPrice: item.price * item.qty,
        seller: item.seller?._id || item.seller 
      }));

      const orderData = {
        orderItems: orderItemsParams,
        shippingInfo: shippingInfo,
        paymentMethod: paymentMethod,
        itemsPrice: itemsPrice,
        shippingPrice: shippingPrice,
        totalPrice: totalPrice,
        // Gửi thêm thông tin coupon
        couponCode: couponApplied, 
        discountAmount: discountAmount
      };

      const { data: order } = await api.post('/orders', orderData);

      if (paymentMethod === 'VNPAY') {
          const { data: paymentData } = await api.post('/payment/create_payment_url', {
              orderId: order._id,
              amount: totalPrice,
              bankCode: ''
          });
          
          clearCart(); 
          window.location.href = paymentData.paymentUrl;
      } else {
          toast.success('Đặt hàng thành công!');
          clearCart(); 
          navigate(`/order/${order._id}`);
      }

    } catch (error) {
      console.error(error); 
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
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Thanh toán</h2>
                
                {/* NHẬP MÃ GIẢM GIÁ */}
                <div className="mb-6">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Nhập mã giảm giá"
                            className="flex-1 border rounded-lg px-3 py-2 text-sm uppercase focus:border-[var(--color-primary)] outline-none"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            disabled={couponApplied}
                        />
                        <button 
                            onClick={couponApplied ? () => { setCouponApplied(''); setDiscountAmount(0); setCouponCode(''); } : applyCouponHandler}
                            disabled={couponLoading}
                            className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors ${couponApplied ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                        >
                            {couponApplied ? 'Hủy' : 'Áp dụng'}
                        </button>
                    </div>
                    {couponApplied && <p className="text-green-600 text-xs mt-1 flex items-center gap-1"><FaTicketAlt /> Đã áp dụng mã: <b>{couponApplied}</b></p>}
                </div>

                <div className="space-y-3 text-gray-600 text-sm">
                    <div className="flex justify-between">
                        <span>Tiền hàng:</span>
                        <span>{formatPrice(itemsPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Phí vận chuyển:</span>
                        <span>{formatPrice(shippingPrice)}</span>
                    </div>
                    {/* Hiển thị dòng giảm giá nếu có */}
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600 font-medium">
                            <span>Giảm giá:</span>
                            <span>- {formatPrice(discountAmount)}</span>
                        </div>
                    )}
                    <div className="border-t pt-3 mt-3 flex justify-between text-lg font-bold text-gray-900">
                        <span>Tổng cộng:</span>
                        <span className="text-[var(--color-primary)]">{formatPrice(totalPrice)}</span>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="font-bold text-gray-700 mb-3">Phương thức thanh toán</h3>
                    <div className="space-y-3">
                        <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[var(--color-primary)] bg-yellow-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"/>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><FaMoneyBillWave /></div>
                                <div><p className="font-bold text-gray-700 text-sm">Thanh toán khi nhận hàng</p><p className="text-xs text-gray-500">COD (Tiền mặt)</p></div>
                            </div>
                        </label>

                        <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'VNPAY' ? 'border-[var(--color-primary)] bg-yellow-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input type="radio" name="paymentMethod" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"/>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><FaCreditCard /></div>
                                <div><p className="font-bold text-gray-700 text-sm">Thanh toán qua VNPAY</p><p className="text-xs text-gray-500">ATM / QR / Internet Banking</p></div>
                            </div>
                        </label>
                    </div>

                    <button 
                        onClick={placeOrderHandler}
                        disabled={loading}
                        className={`w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold shadow-lg hover:bg-yellow-600 transition-colors uppercase tracking-wide mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Đang xử lý...' : (paymentMethod === 'VNPAY' ? 'Thanh toán ngay' : 'Đặt hàng')}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;