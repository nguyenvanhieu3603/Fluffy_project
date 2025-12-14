import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaBox, FaCheck, FaTruck, FaCheckDouble, FaBan, FaSearch, FaUser, FaChevronLeft, FaChevronRight, FaSortAmountDown, FaCalendarAlt, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter & Sort States ---
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // 'newest', 'oldest', 'price-desc', 'price-asc'

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 

  // Các tabs lọc trạng thái
  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ duyệt' },
    { id: 'confirmed', label: 'Đã xác nhận' },
    { id: 'shipping', label: 'Đang giao' },
    { id: 'delivered', label: 'Đã giao' }, 
    { id: 'completed', label: 'Hoàn thành' }, 
    { id: 'cancelled', label: 'Đã hủy' },
  ];

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

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, sortOption]);

  // Hàm xử lý đổi trạng thái (Logic riêng của Seller)
  const updateStatusHandler = async (id, newStatus) => {
      if (newStatus === 'cancelled') {
          if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.')) return;
      }

      try {
          await api.put(`/orders/${id}/status`, { status: newStatus });
          toast.success(`Cập nhật trạng thái thành công!`);
          fetchOrders(); // Load lại dữ liệu mới
      } catch (error) {
          toast.error('Cập nhật thất bại');
      }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getStatusBadge = (status) => {
      const baseClass = "px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide border shadow-sm inline-block min-w-[100px] text-center";
      switch(status) {
          case 'pending': return <span className={`${baseClass} bg-yellow-50 text-yellow-700 border-yellow-200`}>Chờ duyệt</span>;
          case 'confirmed': return <span className={`${baseClass} bg-blue-50 text-blue-700 border-blue-200`}>Đã xác nhận</span>;
          case 'shipping': return <span className={`${baseClass} bg-purple-50 text-purple-700 border-purple-200`}>Đang giao</span>;
          case 'delivered': return <span className={`${baseClass} bg-orange-50 text-orange-700 border-orange-200`}>Đã giao</span>;
          case 'completed': return <span className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>Hoàn thành</span>;
          case 'cancelled': return <span className={`${baseClass} bg-red-50 text-red-700 border-red-200`}>Đã hủy</span>;
          default: return <span className={`${baseClass} bg-gray-50 text-gray-600 border-gray-200`}>{status}</span>;
      }
  };

  // --- LOGIC XỬ LÝ DỮ LIỆU ---
  const getProcessedOrders = () => {
      let result = [...orders];

      // 1. Lọc theo Tab
      if (activeTab !== 'all') {
          result = result.filter(order => order.status === activeTab);
      }

      // 2. Tìm kiếm (Mã đơn, Tên KH, SĐT)
      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          result = result.filter(order => 
              order._id.toLowerCase().includes(lowerTerm) ||
              order.shippingInfo.fullName.toLowerCase().includes(lowerTerm) ||
              order.shippingInfo.phone.includes(searchTerm)
          );
      }

      // 3. Sắp xếp
      switch (sortOption) {
          case 'newest':
              result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              break;
          case 'oldest':
              result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
              break;
          case 'price-desc':
              result.sort((a, b) => b.prices.totalPrice - a.prices.totalPrice);
              break;
          case 'price-asc':
              result.sort((a, b) => a.prices.totalPrice - b.prices.totalPrice);
              break;
          default:
              break;
      }

      return result;
  };

  const filteredOrders = getProcessedOrders();

  // --- Logic Phân trang ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu đơn hàng...</div>;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaBox className="text-[var(--color-primary)]"/> Quản lý Đơn hàng
      </h2>

      {/* Toolbar: Search, Sort & Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              
              {/* Ô Tìm kiếm */}
              <div className="relative flex-1 max-w-lg">
                  <input 
                      type="text" 
                      placeholder="Tìm Mã đơn, Tên KH, SĐT..." 
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400"/>
              </div>

              {/* Ô Sắp xếp & Info */}
              <div className="flex items-center gap-3">
                  <div className="relative">
                      <FaSortAmountDown className="absolute left-3 top-3 text-gray-400 z-10"/>
                      <select 
                          value={sortOption}
                          onChange={(e) => setSortOption(e.target.value)}
                          className="pl-9 pr-8 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:border-[var(--color-primary)] appearance-none cursor-pointer hover:bg-white transition-colors"
                      >
                          <option value="newest">Mới nhất</option>
                          <option value="oldest">Cũ nhất</option>
                          <option value="price-desc">Giá cao - thấp</option>
                          <option value="price-asc">Giá thấp - cao</option>
                      </select>
                  </div>
                  
                  <div className="text-sm text-gray-500 hidden md:block border-l pl-3">
                      Hiển thị <b>{currentItems.length}</b> / <b>{filteredOrders.length}</b> đơn
                  </div>
              </div>
          </div>

          {/* Filter Tabs - Có scroll ngang */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-gray-100 pb-1">
              {tabs.map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                          activeTab === tab.id 
                          ? 'bg-yellow-50 text-[var(--color-primary)] border-[var(--color-primary)]' 
                          : 'text-gray-500 hover:bg-gray-50 border-transparent'
                      }`}
                  >
                      {tab.label}
                  </button>
              ))}
          </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-grow">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4 border-b w-[100px]">Mã đơn</th>
                        <th className="p-4 border-b w-[220px]">Khách hàng</th>
                        <th className="p-4 border-b">Sản phẩm</th>
                        <th className="p-4 border-b w-[120px]">Tổng tiền</th>
                        <th className="p-4 border-b w-[140px] text-center">Trạng thái</th>
                        <th className="p-4 border-b w-[160px] text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {currentItems.length === 0 ? (
                         <tr><td colSpan="6" className="p-12 text-center text-gray-400 italic">Không tìm thấy đơn hàng nào phù hợp.</td></tr>
                    ) : (
                        currentItems.map(order => (
                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 align-top">
                                    <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </span>
                                    <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                       <FaCalendarAlt /> {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="font-bold text-gray-800 flex items-center gap-1">
                                        <FaUser className="text-gray-400 text-xs"/> {order.shippingInfo.fullName}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5 ml-4">{order.shippingInfo.phone}</div>
                                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1 ml-4" title={order.shippingInfo.address}>
                                        {order.shippingInfo.address}
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                     <div className="space-y-2">
                                        {order.orderItems.map((item, idx) => (
                                             <div key={idx} className="flex items-start gap-3">
                                                 <img src={item.image} className="w-10 h-10 rounded-md object-cover border border-gray-200 flex-shrink-0"/>
                                                 <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate" title={item.name}>{item.name}</p>
                                                    <p className="text-xs text-gray-500">x{item.quantity} | {formatPrice(item.price)}</p>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="font-bold text-[var(--color-primary)] text-base">
                                        {formatPrice(order.prices.totalPrice)}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {order.paymentMethod === 'COD' ? 'COD' : 'Online'}
                                    </div>
                                </td>
                                <td className="p-4 align-top text-center">
                                    {getStatusBadge(order.status)}
                                </td>
                                <td className="p-4 align-top text-right">
                                    <div className="flex flex-col items-end gap-2">
                                        {/* CÁC NÚT HÀNH ĐỘNG CỦA SELLER */}
                                        {order.status === 'pending' && (
                                            <>
                                                <button onClick={() => updateStatusHandler(order._id, 'confirmed')} className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all"><FaCheck /> DUYỆT</button>
                                                <button onClick={() => updateStatusHandler(order._id, 'cancelled')} className="w-full bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all"><FaBan /> TỪ CHỐI</button>
                                            </>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <>
                                                <button onClick={() => updateStatusHandler(order._id, 'shipping')} className="w-full bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all"><FaTruck /> GIAO</button>
                                                <button onClick={() => updateStatusHandler(order._id, 'cancelled')} className="w-full bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all"><FaBan /> HỦY</button>
                                            </>
                                        )}
                                        {order.status === 'shipping' && (
                                            <button onClick={() => updateStatusHandler(order._id, 'delivered')} className="w-full bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all"><FaCheckDouble /> HOÀN THÀNH</button>
                                        )}
                                        
                                        {/* Trạng thái kết thúc: Chỉ xem chi tiết */}
                                        {(order.status === 'delivered' || order.status === 'completed' || order.status === 'cancelled') && (
                                            <Link 
                                                to={`/order/${order._id}`} 
                                                className="w-full bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
                                                target="_blank"
                                            >
                                                <FaEye /> CHI TIẾT
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* --- Pagination Controls (Giống Admin) --- */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex justify-center items-center gap-2 bg-gray-50 mt-auto">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors border ${
                        currentPage === 1 
                        ? 'text-gray-300 border-gray-200 cursor-not-allowed' 
                        : 'text-gray-600 border-gray-300 hover:bg-white hover:text-[var(--color-primary)]'
                    }`}
                >
                    <FaChevronLeft />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Logic hiển thị thông minh: Hiện trang đầu, trang cuối, và trang hiện tại +/- 1
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all border ${
                                    currentPage === page
                                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md transform scale-105'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                                }`}
                            >
                                {page}
                            </button>
                        );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="text-gray-400">...</span>;
                    }
                    return null;
                })}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors border ${
                        currentPage === totalPages 
                        ? 'text-gray-300 border-gray-200 cursor-not-allowed' 
                        : 'text-gray-600 border-gray-300 hover:bg-white hover:text-[var(--color-primary)]'
                    }`}
                >
                    <FaChevronRight />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;