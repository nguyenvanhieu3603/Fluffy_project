import { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  // --- LOGIC MỚI: Key lưu trữ dựa trên User ID ---
  // Nếu chưa đăng nhập (khách vãng lai), dùng key chung 'cart_guest'
  const getCartKey = () => user ? `cart_${user._id}` : 'cart_guest';

  const [cartItems, setCartItems] = useState([]);

  // 1. Khi User thay đổi (Đăng nhập/Đăng xuất/F5), load lại giỏ hàng tương ứng
  useEffect(() => {
    const key = getCartKey();
    const storedCart = localStorage.getItem(key);
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    } else {
      setCartItems([]);
    }
  }, [user]); // Chạy lại mỗi khi user thay đổi

  // 2. Khi cartItems thay đổi, lưu vào LocalStorage theo key của user hiện tại
  useEffect(() => {
    const key = getCartKey();
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, user]); // Thêm user vào dependency để đảm bảo key luôn đúng

  // --- LOGIC HỢP NHẤT GIỎ HÀNG (TÙY CHỌN NÂNG CAO) ---
  // Nếu bạn muốn khi khách vãng lai đăng nhập, giỏ hàng guest được gộp vào giỏ hàng user
  // Bạn có thể thêm logic đó ở đây. Hiện tại code này giữ riêng biệt để đơn giản.

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const addToCart = (product, qty = 1) => {
    const existItem = cartItems.find((x) => x._id === product._id);

    if (existItem) {
      setCartItems(
        cartItems.map((x) =>
          x._id === existItem._id ? { ...x, qty: x.qty + qty } : x
        )
      );
      toast.success(`Đã cập nhật số lượng: ${product.name}`);
    } else {
      setCartItems([...cartItems, { ...product, qty }]);
      toast.success(`Đã thêm vào giỏ: ${product.name}`);
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x._id !== id));
    toast.info('Đã xóa sản phẩm khỏi giỏ');
  };

  const updateQuantity = (id, qty) => {
      setCartItems(cartItems.map(item => item._id === id ? {...item, qty: Math.max(1, qty)} : item));
  };

  const clearCart = () => {
    setCartItems([]);
    const key = getCartKey();
    localStorage.removeItem(key);
  };

  return (
    <CartContext.Provider value={{ cartItems, itemsPrice, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};