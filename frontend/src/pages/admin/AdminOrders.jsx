import { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaBoxOpen, FaEye, FaSearch, FaUser, FaStore, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Số đơn hàng mỗi trang

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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/admin/orders');
        setOrders(data);
      } catch (error) {
        toast.error('Lỗi tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Reset về trang 1 khi filter thay đổi để tránh lỗi đang ở trang 2 mà filter chỉ có 1 trang
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getStatusBadge = (status) => {
      switch(status) {
          case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold uppercase">Chờ duyệt</span>;
          case 'confirmed': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold uppercase">Đã xác nhận</span>;
          case 'shipping': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold uppercase">Đang giao</span>;
          case 'delivered': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold uppercase">Chờ khách nhận</span>;
          case 'completed': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold uppercase">Hoàn thành</span>;
          case 'cancelled': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold uppercase">Đã hủy</span>;
          default: return status;
      }
  };

  // Logic lọc dữ liệu
  const filteredOrders = orders.filter(order => {
      const matchTab = activeTab === 'all' || order.status === activeTab;
      const matchSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.seller?.sellerInfo?.shopName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTab && matchSearch;
  });

  // --- Logic Tính toán Phân trang ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
      // Cuộn lên đầu bảng khi chuyển trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaBoxOpen className="text-[var(--color-primary)]"/> Quản lý Đơn hàng Toàn hệ thống
      </h2>

      {/* Toolbar: Search & Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                  <input 
                      type="text" 
                      placeholder="Tìm theo Mã đơn, Tên khách, Tên shop..." 
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400"/>
              </div>
              <div className="text-sm text-gray-500 self-center">
                  Hiển thị <b>{currentItems.length}</b> / <b>{filteredOrders.length}</b> đơn hàng
              </div>
          </div>

          <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-gray-100 pb-1">
              {tabs.map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                          activeTab === tab.id 
                          ? 'bg-yellow-50 text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                      {tab.label}
                  </button>
              ))}
          </div>
      </div>

      {loading ? <div>Đang tải dữ liệu...</div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                            <th className="p-4">Mã đơn</th>
                            <th className="p-4">Khách hàng</th>
                            <th className="p-4">Shop bán</th>
                            <th className="p-4">Tổng tiền</th>
                            <th className="p-4">Ngày đặt</th>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {currentItems.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">Không tìm thấy đơn hàng nào.</td></tr>
                        ) : (
                            currentItems.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-700 font-mono">#{order._id.slice(-6).toUpperCase()}</td>
                                    <td className="p-4">
                                        <div className="font-semibold flex items-center gap-1"><FaUser className="text-gray-400 text-xs"/> {order.customer?.fullName || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{order.customer?.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-blue-600 flex items-center gap-1"><FaStore className="text-xs"/> {order.seller?.sellerInfo?.shopName || 'Shop N/A'}</div>
                                    </td>
                                    <td className="p-4 font-bold text-[var(--color-primary)]">{formatPrice(order.prices.totalPrice)}</td>
                                    <td className="p-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-4">{getStatusBadge(order.status)}</td>
                                    <td className="p-4">
                                        <Link 
                                            to={`/order/${order._id}`} 
                                            target="_blank"
                                            className="text-gray-500 hover:text-[var(--color-primary)] p-2 bg-gray-100 hover:bg-yellow-50 rounded inline-flex items-center gap-1 transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <FaEye /> Chi tiết
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Pagination Controls --- */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex justify-center items-center gap-2 bg-gray-50 mt-auto">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg transition-colors ${
                            currentPage === 1 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-[var(--color-primary)]'
                        }`}
                    >
                        <FaChevronLeft />
                    </button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        // Logic rút gọn số trang nếu quá nhiều (tùy chọn đơn giản: hiện tất cả nếu < 10 trang)
                        // Ở đây mình hiển thị tất cả để đơn giản
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                    currentPage === page
                                    ? 'bg-[var(--color-primary)] text-white shadow-md transform scale-105'
                                    : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-[var(--color-primary)]'
                                }`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg transition-colors ${
                            currentPage === totalPages 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-[var(--color-primary)]'
                        }`}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;