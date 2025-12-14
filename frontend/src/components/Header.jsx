import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaSignOutAlt, FaBoxOpen, FaCaretDown, FaPaw } from 'react-icons/fa';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import NotificationMenu from './NotificationMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  
  // --- STATE TÌM KIẾM ---
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const DEFAULT_AVATAR = "/uploads/default-avatar.jpg";
  const handleImageError = (e) => { e.target.src = DEFAULT_AVATAR; };

  // --- XỬ LÝ TÌM KIẾM ---
  const handleSearch = (e) => {
    e.preventDefault(); // Ngăn reload trang
    if (keyword.trim()) {
      // Chuyển hướng sang trang Pets kèm từ khóa
      navigate(`/pets?keyword=${encodeURIComponent(keyword.trim())}`);
      setIsMenuOpen(false); // Đóng menu mobile nếu đang mở
    } else {
      navigate('/pets');
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="bg-[var(--color-primary)] text-white text-xs py-1">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span>Hotline: 1900 1234 - Email: hotro@fluffy.vn</span>
          <div className="flex gap-4">
            <Link to="/help" className="hover:underline">Trợ giúp</Link>
            {user?.role === 'customer' && <Link to="/seller-register" className="hover:underline">Đăng ký bán hàng</Link>}
            {user?.role === 'seller' && <Link to="/seller/dashboard" className="hover:underline font-bold">Kênh người bán</Link>}
            {user?.role === 'admin' && <Link to="/admin/dashboard" className="hover:underline font-bold text-yellow-200">Quản trị viên</Link>}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          <Link to="/" className="text-3xl font-extrabold text-[var(--color-primary)] flex items-center gap-2">
            <FaPaw /> Fluffy<span className="text-[var(--color-secondary)]">.vn</span>
          </Link>

          {/* THANH TÌM KIẾM (DESKTOP) */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearch} className="w-full relative">
                <input 
                  type="text" 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm kiếm thú cưng, phụ kiện..." 
                  className="w-full pl-4 pr-10 py-2 border-2 border-gray-200 rounded-full focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
                <button type="submit" className="absolute right-0 top-0 h-full px-4 text-gray-500 hover:text-[var(--color-primary)]">
                  <FaSearch />
                </button>
            </form>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/cart" className="relative group">
              <FaShoppingCart className="text-2xl text-gray-600 group-hover:text-[var(--color-primary)] transition-colors" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>}
            </Link>

            {user && <NotificationMenu />}

            <div className="hidden md:flex items-center gap-2">
               {user ? (
                 <div className="relative group z-50">
                    <button className="flex items-center gap-2 focus:outline-none">
                        <img src={user.avatar ? user.avatar : DEFAULT_AVATAR} onError={handleImageError} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-300 object-cover"/>
                        <div className="text-sm text-left">
                            <p className="font-semibold text-gray-700 flex items-center gap-1">{user.fullName} <FaCaretDown className="text-xs text-gray-400"/></p>
                        </div>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right border border-gray-100">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-[var(--color-primary)] flex items-center gap-2"><FaUser /> Tài khoản của tôi</Link>
                        <Link to="/my-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-[var(--color-primary)] flex items-center gap-2"><FaBoxOpen /> Đơn mua</Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><FaSignOutAlt /> Đăng xuất</button>
                    </div>
                 </div>
               ) : (
                 /* --- CẬP NHẬT PHẦN NÀY: Dùng NavLink để active style --- */
                 <>
                    <NavLink 
                        to="/login" 
                        className={({ isActive }) => 
                            `px-4 py-2 rounded-full font-medium transition-colors ${
                                isActive 
                                ? 'bg-yellow-100 text-[var(--color-primary)] shadow-inner' // Active: Nền vàng nhạt, chữ đậm
                                : 'text-gray-600 hover:text-[var(--color-primary)] hover:bg-gray-50'
                            }`
                        }
                    >
                        Đăng nhập
                    </NavLink>
                    <NavLink 
                        to="/register" 
                        className={({ isActive }) => 
                            `px-4 py-2 rounded-full font-medium transition-colors ${
                                isActive 
                                ? 'bg-yellow-100 text-[var(--color-primary)] shadow-inner' // Active: Nền vàng nhạt, chữ đậm
                                : 'text-gray-600 hover:text-[var(--color-primary)] hover:bg-gray-50'
                            }`
                        }
                    >
                        Đăng ký
                    </NavLink>
                 </>
               )}
            </div>
            <button className="md:hidden text-2xl text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}><FaBars /></button>
          </div>
        </div>
        
        {/* Navbar - Cập nhật NavLink cho các menu chính luôn để đồng bộ */}
        <nav className="hidden md:flex items-center gap-8 mt-4 border-t border-gray-100 pt-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
          <NavLink to="/" end className={({isActive}) => isActive ? "text-[var(--color-primary)]" : "hover:text-[var(--color-primary)] transition-colors"}>Trang chủ</NavLink>
          <NavLink to="/pets" className={({isActive}) => isActive ? "text-[var(--color-primary)]" : "hover:text-[var(--color-primary)] transition-colors"}>Thú cưng</NavLink>
          <NavLink to="/accessories" className={({isActive}) => isActive ? "text-[var(--color-primary)]" : "hover:text-[var(--color-primary)] transition-colors"}>Phụ kiện</NavLink>
          <NavLink to="/blog" className={({isActive}) => isActive ? "text-[var(--color-primary)]" : "hover:text-[var(--color-primary)] transition-colors"}>Kinh nghiệm nuôi</NavLink>
          <NavLink to="/contact" className={({isActive}) => isActive ? "text-[var(--color-primary)]" : "hover:text-[var(--color-primary)] transition-colors"}>Liên hệ</NavLink>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 flex flex-col gap-4 shadow-lg absolute w-full left-0 z-50">
          {/* THANH TÌM KIẾM (MOBILE) */}
          <form onSubmit={handleSearch}>
             <input 
                type="text" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm..." 
                className="w-full px-4 py-2 border rounded-lg focus:border-[var(--color-primary)] outline-none" 
             />
          </form>
          
          <Link to="/" className="font-medium hover:text-[var(--color-primary)]">Trang chủ</Link>
          <Link to="/pets" className="font-medium hover:text-[var(--color-primary)]">Thú cưng</Link>
          <Link to="/cart" className="font-medium hover:text-[var(--color-primary)]">Giỏ hàng ({cartCount})</Link>
          <hr />
          {user ? (
              <>
                <Link to="/profile" className="font-medium hover:text-[var(--color-primary)]">Tài khoản của tôi</Link>
                <Link to="/my-orders" className="font-medium hover:text-[var(--color-primary)]">Đơn mua</Link>
                <button onClick={logout} className="text-left font-medium text-red-500 mt-2">Đăng xuất</button>
              </>
          ) : (
              <>
                <Link to="/login" className="font-medium text-[var(--color-primary)]">Đăng nhập</Link>
                <Link to="/register" className="font-medium text-[var(--color-primary)]">Đăng ký</Link>
              </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;