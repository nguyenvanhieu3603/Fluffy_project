import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { FaTrash, FaArrowLeft, FaShoppingBag } from 'react-icons/fa';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, itemsPrice } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const checkoutHandler = () => {
    if (!user) {
      navigate('/login?redirect=shipping'); // Nếu chưa đăng nhập thì bắt đăng nhập trước
    } else {
      navigate('/shipping'); // Chuyển đến trang nhập địa chỉ giao hàng
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
            <FaShoppingBag className="text-4xl text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-500 mb-6">Có vẻ như bạn chưa chọn được người bạn nhỏ nào.</p>
        <Link to="/pets" className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-full font-bold hover:bg-yellow-600 transition-colors">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
         <FaShoppingBag /> Giỏ hàng ({cartItems.reduce((acc, item) => acc + item.qty, 0)} sản phẩm)
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* DANH SÁCH SẢN PHẨM */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-bold text-gray-600 border-b">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-center">Thành tiền</div>
            </div>

            {cartItems.map((item) => (
              <div key={item._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b last:border-0 items-center">
                
                {/* Cột Sản phẩm */}
                <div className="col-span-6 flex gap-4">
                    <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover rounded-lg border" />
                    <div>
                        <Link to={`/product/${item._id}`} className="font-bold text-gray-800 hover:text-[var(--color-primary)] line-clamp-1">
                            {item.name}
                        </Link>
                        <div className="text-xs text-gray-500 mt-1">
                             Shop: <span className="font-medium text-blue-600">{item.seller?.sellerInfo?.shopName || 'Người bán cá nhân'}</span>
                        </div>
                        <button 
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500 text-xs mt-2 flex items-center hover:underline md:hidden"
                        >
                            <FaTrash className="mr-1" /> Xóa
                        </button>
                    </div>
                </div>

                {/* Cột Giá (Mobile ẩn, hiện trong chi tiết) */}
                <div className="col-span-2 text-center hidden md:block text-gray-600">
                    {formatPrice(item.price)}
                </div>

                {/* Cột Số lượng */}
                <div className="col-span-2 flex justify-center">
                    <select 
                        value={item.qty} 
                        onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[var(--color-primary)]"
                    >
                        {[...Array(item.stock > 10 ? 10 : item.stock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                                {x + 1}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Cột Thành tiền & Nút xóa */}
                <div className="col-span-2 text-center flex flex-col items-center justify-center">
                    <span className="font-bold text-[var(--color-primary)]">{formatPrice(item.price * item.qty)}</span>
                    <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-gray-400 hover:text-red-500 mt-2 hidden md:block"
                        title="Xóa khỏi giỏ"
                    >
                        <FaTrash />
                    </button>
                </div>

              </div>
            ))}
          </div>

          <Link to="/pets" className="inline-flex items-center mt-6 text-gray-600 hover:text-[var(--color-primary)] font-medium">
             <FaArrowLeft className="mr-2" /> Tiếp tục mua sắm
          </Link>
        </div>

        {/* TỔNG TIỀN & THANH TOÁN */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Cộng giỏ hàng</h3>
            
            <div className="flex justify-between mb-4 text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-medium">{formatPrice(itemsPrice)}</span>
            </div>
            <div className="flex justify-between mb-6 text-gray-600">
                <span>Giảm giá:</span>
                <span className="font-medium">0đ</span>
            </div>
            
            <div className="flex justify-between mb-8 text-xl font-bold text-gray-900 border-t pt-4">
                <span>Tổng tiền:</span>
                <span className="text-[var(--color-primary)]">{formatPrice(itemsPrice)}</span>
            </div>

            <button 
                onClick={checkoutHandler}
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold shadow-lg hover:bg-yellow-600 transition-colors uppercase tracking-wide"
            >
                Tiến hành thanh toán
            </button>
            
            <div className="mt-4 text-xs text-center text-gray-500">
                Phí vận chuyển sẽ được tính ở bước tiếp theo.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;