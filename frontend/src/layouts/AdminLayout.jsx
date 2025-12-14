import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaBoxOpen, FaClipboardList, FaStore, FaChartLine, FaPaw } from 'react-icons/fa';

const SellerLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname + location.search;

  const menuItems = [
    { 
        path: '/seller/dashboard', 
        icon: <FaChartLine />, 
        label: 'Thống kê' 
    },
    { 
        path: '/seller/orders', 
        icon: <FaClipboardList />, 
        label: 'Quản lý Đơn hàng' 
    },
    { 
        path: '/seller/products?type=pet', 
        icon: <FaPaw />, 
        label: 'Quản lý Thú cưng' 
    },
    { 
        path: '/seller/products?type=accessory', 
        icon: <FaBoxOpen />, 
        label: 'Quản lý Phụ kiện' 
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 min-h-[80vh]">
      {/* SIDEBAR */}
      <div className="w-full md:w-1/4 lg:w-1/5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-4 bg-[var(--color-primary)] text-white font-bold flex items-center gap-2">
                <FaStore /> Kênh Người Bán
            </div>
            <nav className="flex flex-col p-2">
                {menuItems.map((item) => {
                    // Logic kiểm tra active bao gồm cả query param
                    const isActive = item.path.includes('?') 
                        ? currentPath === item.path 
                        : location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                                isActive
                                ? 'bg-yellow-50 text-[var(--color-primary)] font-bold'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full md:w-3/4 lg:w-4/5">
          <Outlet />
      </div>
    </div>
  );
};

export default SellerLayout;