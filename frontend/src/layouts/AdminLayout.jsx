import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaChartPie, FaUserShield, FaClipboardCheck, FaStore, FaSignOutAlt, FaPaw, FaUsers, FaBoxOpen, FaStar, FaFlag, FaShoppingCart } from 'react-icons/fa'; 
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaNewspaper } from 'react-icons/fa';

const AdminLayout = () => {
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaChartPie />, label: 'Tổng quan' },
    
    // --- QUẢN LÝ GIAO DỊCH (MỚI) ---
    { path: '/admin/orders', icon: <FaShoppingCart />, label: 'Quản lý Đơn hàng' },

    { path: '/admin/approve-products', icon: <FaClipboardCheck />, label: 'Duyệt Sản phẩm' },
    { path: '/admin/approve-sellers', icon: <FaStore />, label: 'Duyệt Đăng ký Shop' },
    
    // --- QUẢN LÝ DỮ LIỆU ---
    { path: '/admin/sellers', icon: <FaStore />, label: 'Danh sách Người bán' },
    { path: '/admin/customers', icon: <FaUsers />, label: 'Danh sách Khách hàng' },
    { path: '/admin/pets', icon: <FaPaw />, label: 'Tất cả Thú cưng' },
    { path: '/admin/accessories', icon: <FaBoxOpen />, label: 'Tất cả Phụ kiện' },
    
    // --- QUẢN LÝ TƯƠNG TÁC ---
    { path: '/admin/reviews', icon: <FaStar />, label: 'Đánh giá & Bình luận' },
    { path: '/admin/reports', icon: <FaFlag />, label: 'Khiếu nại & Báo cáo' },
    { path: '/admin/blogs', icon: <FaNewspaper />, label: 'Quản lý Tin tức' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col fixed h-full transition-all duration-300 overflow-y-auto z-10 custom-scrollbar">
        <div className="p-6 text-center border-b border-gray-800 sticky top-0 bg-gray-900">
            <h1 className="text-2xl font-bold text-white">Fluffy<span className="text-[var(--color-primary)]">.Admin</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                        location.pathname === item.path
                        ? 'bg-[var(--color-primary)] text-white shadow-lg'
                        : 'hover:bg-gray-800 hover:text-white'
                    }`}
                >
                    {item.icon}
                    {item.label}
                </Link>
            ))}
        </nav>

        <div className="p-4 border-t border-gray-800 mt-auto">
            <button 
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
            >
                <FaSignOutAlt /> Đăng xuất
            </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
          <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;