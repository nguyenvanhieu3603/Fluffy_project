import { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Lấy dữ liệu từ LocalStorage khi khởi động
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Tự động lưu vào LocalStorage mỗi khi cartItems thay đổi
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Hàm thêm vào giỏ
  const addToCart = (product, quantity = 1) => {
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existItem = cartItems.find((x) => x._id === product._id);

    if (existItem) {
      // Nếu có rồi thì tăng số lượng
      setCartItems(
        cartItems.map((x) =>
          x._id === existItem._id ? { ...x, qty: x.qty + quantity } : x
        )
      );
      toast.success(`Đã cập nhật số lượng cho ${product.name}`);
    } else {
      // Nếu chưa thì thêm mới
      setCartItems([...cartItems, { ...product, qty: quantity }]);
      toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
    }
  };

  // Hàm xóa khỏi giỏ
  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x._id !== id));
    toast.info('Đã xóa sản phẩm khỏi giỏ');
  };

  // Hàm cập nhật số lượng (dùng trong trang giỏ hàng)
  const updateQuantity = (id, qty) => {
    setCartItems(
        cartItems.map((item) => 
            item._id === id ? { ...item, qty: Number(qty) } : item
        )
    );
  };

  // Hàm xóa sạch giỏ hàng (dùng khi thanh toán xong)
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  // Tính tổng tiền
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemsPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};