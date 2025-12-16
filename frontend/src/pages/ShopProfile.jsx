import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { FaStore, FaMapMarkerAlt, FaCheckCircle, FaPhone, FaSearch, FaFilter, FaPaw, FaBoxOpen, FaThLarge, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ShopProfile = () => {
  const { id } = useParams(); // ID của Seller
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Danh sách danh mục để lọc
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  // --- STATE CHO FILTER & SORT & PAGINATION ---
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pet', 'accessory'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest'); 
  const [selectedCategory, setSelectedCategory] = useState(''); // State cho danh mục được chọn
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // 1. Lấy thông tin Shop và Danh mục (Chỉ chạy 1 lần)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userRes, categoriesRes] = await Promise.all([
            api.get(`/users/seller/${id}`),
            api.get('/categories')
        ]);
        setShop(userRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Lỗi tải thông tin ban đầu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

  // 2. Lấy danh sách sản phẩm (Chạy lại khi Filter/Sort/Page thay đổi)
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        // Xây dựng query params
        let query = `/pets?seller=${id}&pageNumber=${page}`;
        
        // Filter theo Tab (Type)
        if (activeTab === 'pet') query += '&type=pet';
        if (activeTab === 'accessory') query += '&type=accessory';
        
        // Filter theo Category (Nếu có)
        if (selectedCategory) query += `&category=${selectedCategory}`;

        // Search
        if (searchTerm.trim()) query += `&keyword=${encodeURIComponent(searchTerm)}`;
        
        // Sort
        if (sortOption) query += `&sort=${sortOption}`;

        const { data } = await api.get(query);
        setProducts(data.pets);
        setTotalPages(data.pages);
        setTotalProducts(data.total);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [id, activeTab, searchTerm, sortOption, page, selectedCategory]);

  // Reset trang về 1 khi đổi Tab hoặc Search hoặc Sort
  const handleFilterChange = (setter, value) => {
      setter(value);
      setPage(1);
      // Nếu đổi tab chính (Pet/Accessory) thì nên reset category filter con để tránh conflict logic (tuỳ chọn)
      if (setter === setActiveTab) setSelectedCategory('');
  };

  // Helper để lọc danh mục hiển thị trong dropdown dựa theo Tab đang chọn
  const getFilteredCategories = () => {
      if (activeTab === 'all') return categories;
      // Giả sử backend hoặc logic danh mục có slug hoặc parentId để phân biệt
      // Ở đây ta lọc đơn giản theo slug cha nếu có, hoặc hiển thị hết nếu ko phân biệt được ở client
      // Cách tốt nhất: Lọc theo slug cha 'thu-cung' hoặc 'phu-kien'
      if (activeTab === 'pet') {
          const petRoot = categories.find(c => c.slug === 'thu-cung');
          return categories.filter(c => c.parentId === petRoot?._id || c.parentId?._id === petRoot?._id);
      }
      if (activeTab === 'accessory') {
          const accRoot = categories.find(c => c.slug === 'phu-kien');
          return categories.filter(c => c.parentId === accRoot?._id || c.parentId?._id === accRoot?._id);
      }
      return categories;
  };

  const DEFAULT_AVATAR = "/uploads/default-avatar.jpg";

  if (loading) return <div className="text-center py-20">Đang tải gian hàng...</div>;
  if (!shop) return <div className="text-center py-20">Gian hàng không tồn tại.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* --- 1. SHOP HEADER INFO --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="h-40 bg-gradient-to-r from-[var(--color-primary)] to-orange-400 relative">
              <div className="absolute inset-0 bg-black opacity-10"></div>
          </div>
          
          <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end -mt-16 gap-6">
              <div className="relative group">
                  <img 
                    src={shop.avatar || DEFAULT_AVATAR} 
                    alt={shop.sellerInfo?.shopName} 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                  />
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full text-xs border-2 border-white" title="Đã xác thực">
                      <FaCheckCircle />
                  </div>
              </div>

              <div className="flex-1 text-center md:text-left mb-2">
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center md:justify-start gap-2">
                      {shop.sellerInfo?.shopName || shop.fullName}
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full border border-yellow-200 font-medium">Official Shop</span>
                  </h1>
                  
                  <div className="text-sm text-gray-600 mt-3 space-y-1">
                      <p className="flex items-center justify-center md:justify-start gap-2">
                          <FaMapMarkerAlt className="text-red-500"/> {shop.sellerInfo?.shopAddress || 'Địa chỉ đang cập nhật'}
                      </p>
                      {shop.phone && (
                          <p className="flex items-center justify-center md:justify-start gap-2">
                              <FaPhone className="text-blue-500"/> {shop.phone}
                          </p>
                      )}
                  </div>
              </div>

              {/* Stats Box */}
              <div className="flex gap-4 md:gap-8 bg-gray-50 p-4 rounded-lg border border-gray-100 min-w-[200px] justify-center">
                  <div className="text-center">
                      <div className="font-bold text-gray-800 text-xl">{totalProducts}</div>
                      <div className="text-xs text-gray-500 uppercase font-medium">Kết quả</div>
                  </div>
                  <div className="w-[1px] bg-gray-300 h-10 self-center"></div>
                  <div className="text-center">
                      <div className="font-bold text-gray-800 text-xl">{new Date(shop.createdAt).getFullYear()}</div>
                      <div className="text-xs text-gray-500 uppercase font-medium">Tham gia</div>
                  </div>
              </div>
          </div>
          
          <div className="px-8 pb-6 text-center md:text-left">
               <p className="text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200 inline-block">
                   "{shop.sellerInfo?.shopDescription || 'Chào mừng đến với cửa hàng của chúng tôi!'}"
               </p>
          </div>
      </div>

      {/* --- 2. TOOLBAR (TABS, SEARCH, SORT, CATEGORY) --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 sticky top-20 z-10">
          <div className="flex flex-col space-y-4">
              
              {/* Row 1: Tabs & Search */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  {/* Tabs */}
                  <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                      <button 
                        onClick={() => handleFilterChange(setActiveTab, 'all')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all flex-1 md:flex-none justify-center ${activeTab === 'all' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          <FaThLarge /> Tất cả
                      </button>
                      <button 
                        onClick={() => handleFilterChange(setActiveTab, 'pet')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all flex-1 md:flex-none justify-center ${activeTab === 'pet' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          <FaPaw /> Thú cưng
                      </button>
                      <button 
                        onClick={() => handleFilterChange(setActiveTab, 'accessory')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all flex-1 md:flex-none justify-center ${activeTab === 'accessory' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          <FaBoxOpen /> Phụ kiện
                      </button>
                  </div>

                  {/* Search */}
                  <div className="relative w-full md:w-auto md:flex-grow md:max-w-md">
                      <FaSearch className="absolute left-3 top-3 text-gray-400"/>
                      <input 
                        type="text" 
                        placeholder="Tìm tại shop..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleFilterChange(setPage, 1)} 
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]"
                      />
                  </div>
              </div>

              {/* Row 2: Category & Sort */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2 border-t border-gray-50">
                  {/* Category Filter */}
                  <div className="w-full md:w-auto flex items-center gap-2">
                      <FaFilter className="text-gray-400"/>
                      <select 
                          value={selectedCategory}
                          onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}
                          className="w-full md:w-64 pl-2 pr-8 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                      >
                          <option value="">-- Tất cả danh mục --</option>
                          {getFilteredCategories().map(cat => (
                              <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                      </select>
                  </div>

                  {/* Sort */}
                  <div className="w-full md:w-auto flex items-center gap-2">
                      <span className="text-sm text-gray-500 whitespace-nowrap">Sắp xếp:</span>
                      <select 
                        value={sortOption}
                        onChange={(e) => handleFilterChange(setSortOption, e.target.value)}
                        className="w-full md:w-auto pl-2 pr-8 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                      >
                          <option value="newest">Mới nhất</option>
                          <option value="price-asc">Giá: Thấp - Cao</option>
                          <option value="price-desc">Giá: Cao - Thấp</option>
                      </select>
                  </div>
              </div>
          </div>
      </div>

      {/* --- 3. PRODUCT LIST --- */}
      <div className="min-h-[400px]">
          {productsLoading ? (
              <div className="text-center py-20 text-gray-500">Đang tải sản phẩm...</div>
          ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100 flex flex-col items-center">
                  <FaStore className="text-6xl text-gray-200 mb-4"/>
                  <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm phù hợp.</p>
              </div>
          ) : (
              <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {products.map((product) => (
                          <ProductCard key={product._id} product={product} />
                      ))}
                  </div>

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-4 mt-8">
                          <button 
                            onClick={() => setPage(old => Math.max(old - 1, 1))}
                            disabled={page === 1}
                            className="p-2 bg-white border rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50"
                          >
                              <FaChevronLeft />
                          </button>
                          <span className="text-gray-600 font-medium">
                              Trang {page} / {totalPages}
                          </span>
                          <button 
                            onClick={() => setPage(old => Math.min(old + 1, totalPages))}
                            disabled={page === totalPages}
                            className="p-2 bg-white border rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50"
                          >
                              <FaChevronRight />
                          </button>
                      </div>
                  )}
              </div>
          )}
      </div>
    </div>
  );
};

export default ShopProfile;