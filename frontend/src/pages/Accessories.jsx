import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AccessoryCard from '../components/AccessoryCard';
import { FaFilter, FaSearch, FaTimes, FaSortAmountDown, FaBoxOpen, FaInfoCircle } from 'react-icons/fa';

const Accessories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // Toàn bộ danh mục
  const [parentCats, setParentCats] = useState([]); // Danh mục cấp 2 (PK Chó, PK Mèo...)
  const [subCats, setSubCats] = useState([]); // Danh mục cấp 3 (Chi tiết)
  
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [rootId, setRootId] = useState(null); // ID gốc "Phụ Kiện"

  // State bộ lọc
  const [filters, setFilters] = useState({
    keyword: queryParams.get('keyword') || '',
    category: queryParams.get('category') || '', // ID Danh mục cấp 2
    selectedTypes: [], // Mảng ID Chi tiết (Cấp 3)
    minPrice: queryParams.get('minPrice') || '',
    maxPrice: queryParams.get('maxPrice') || '',
    sort: queryParams.get('sort') || 'newest',
    pageNumber: queryParams.get('pageNumber') || 1
  });

  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // 1. Fetch Danh mục & Setup ban đầu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setAllCategories(data);
        
        const accRoot = data.find(c => c.slug === 'phu-kien');
        if (accRoot) {
            setRootId(accRoot._id);
            // Lấy danh mục cấp 2 (PK Chó, Mèo, Khác)
            const parents = data.filter(c => c.parentId === accRoot._id || c.parentId?._id === accRoot._id);
            setParentCats(parents);

            // Mặc định chọn root nếu chưa có
            if (!filters.category) {
                setFilters(prev => ({ ...prev, category: accRoot._id }));
            }
        }
      } catch (error) { console.error(error); }
    };
    fetchCategories();
  }, []);

  // 2. Logic cập nhật "Chi tiết" khi chọn "Danh mục"
  useEffect(() => {
      const currentCatId = filters.category;

      // Nếu đang chọn Root (Tất cả) hoặc rỗng -> Xóa list chi tiết
      if (!currentCatId || currentCatId === rootId) {
          setSubCats([]);
          setFilters(prev => ({ ...prev, selectedTypes: [] })); // Reset lựa chọn con
          return;
      }

      // Tìm các danh mục con của danh mục đang chọn
      const children = allCategories.filter(c => c.parentId === currentCatId || c.parentId?._id === currentCatId);
      setSubCats(children);
      
  }, [filters.category, allCategories, rootId]);

  // 3. Fetch Sản phẩm
  useEffect(() => {
    if (!rootId && !filters.category) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.keyword) params.append('keyword', filters.keyword);
        
        // Logic gửi category:
        // - Nếu có chọn Chi tiết (selectedTypes) -> Gửi list ID chi tiết
        // - Nếu không -> Gửi ID danh mục cha (Backend sẽ tự tìm con cháu)
        if (filters.selectedTypes.length > 0) {
            params.append('category', filters.selectedTypes.join(','));
        } else {
            params.append('category', filters.category || rootId);
        }
        
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sort) params.append('sort', filters.sort);
        params.append('pageNumber', filters.pageNumber);

        navigate({ search: params.toString() }, { replace: true });

        const { data } = await api.get(`/pets?${params.toString()}`);
        setProducts(data.pets);
        setPagination({ page: data.page, pages: data.pages, total: data.total });
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };

    fetchProducts();
    window.scrollTo(0, 0);
  }, [filters, rootId, navigate]);

  // Handlers
  const handleCategoryChange = (e) => {
      // Khi đổi danh mục cha -> Reset chi tiết và về trang 1
      setFilters(prev => ({ 
          ...prev, 
          category: e.target.value, 
          selectedTypes: [], 
          pageNumber: 1 
      }));
  };

  const handleTypeCheckboxChange = (id) => {
      setFilters(prev => {
          const current = prev.selectedTypes;
          if (current.includes(id)) {
              return { ...prev, selectedTypes: current.filter(x => x !== id), pageNumber: 1 };
          } else {
              return { ...prev, selectedTypes: [...current, id], pageNumber: 1 };
          }
      });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, pageNumber: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      category: rootId,
      selectedTypes: [],
      minPrice: '', maxPrice: '',
      sort: 'newest',
      pageNumber: 1
    });
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaBoxOpen className="text-[var(--color-primary)]"/>
            Phụ Kiện & Đồ Dùng
            <span className="text-gray-500 text-lg font-normal">({pagination.total} sản phẩm)</span>
        </h1>
        
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <input type="text" value={filters.keyword} onChange={(e) => setFilters({...filters, keyword: e.target.value})} placeholder="Tìm phụ kiện..." className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:border-[var(--color-primary)]"/>
                <FaSearch className="absolute left-3 top-3 text-gray-400"/>
            </div>
            <button className="md:hidden bg-gray-100 p-2 rounded-full text-gray-600" onClick={() => setShowMobileFilter(!showMobileFilter)}><FaFilter /></button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* SIDEBAR */}
        <div className={`md:w-1/4 space-y-6 ${showMobileFilter ? 'block' : 'hidden md:block'}`}>
            
            {/* 1. DANH MỤC (Radio: PK Chó, PK Mèo...) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaFilter className="text-[var(--color-primary)]"/> Danh mục</h3>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="category" value={rootId || ''} checked={filters.category === rootId} onChange={handleCategoryChange} className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"/>
                        <span className="text-gray-600 font-medium">Tất cả các phụ kiện</span>
                    </label>
                    {parentCats.map(cat => (
                        <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="category" value={cat._id} checked={filters.category === cat._id} onChange={handleCategoryChange} className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"/>
                            <span className="text-gray-600">{cat.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* 2. CHI TIẾT (Checkbox: Thức ăn, Đồ chơi...) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Chi tiết</h3>
                
                {subCats.length === 0 ? (
                    // Nếu chưa chọn danh mục hoặc chọn Tất cả -> Hiện dòng chữ
                    <div className="text-center text-gray-400 py-4 border-2 border-dashed border-gray-100 rounded-lg">
                        <FaInfoCircle className="mx-auto mb-2 text-xl"/>
                        <p className="text-sm">------</p>
                        <p className="text-xs mt-1">Chọn danh mục cụ thể để xem chi tiết</p>
                    </div>
                ) : (
                    // Nếu đã chọn -> Hiện list checkbox
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {subCats.map(sub => (
                            <label key={sub._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input 
                                    type="checkbox" 
                                    checked={filters.selectedTypes.includes(sub._id)} 
                                    onChange={() => handleTypeCheckboxChange(sub._id)}
                                    className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                />
                                <span className="text-sm text-gray-700">{sub.name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Giá & Reset */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Khoảng giá</h3>
                <div className="flex items-center gap-2 mb-4">
                    <input type="number" name="minPrice" placeholder="Từ" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-[var(--color-primary)]"/>
                    <span>-</span>
                    <input type="number" name="maxPrice" placeholder="Đến" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
                <button onClick={() => setFilters({...filters, pageNumber: 1})} className="w-full bg-gray-100 text-gray-700 py-1 rounded text-sm hover:bg-gray-200">Áp dụng</button>
            </div>
            
            <button onClick={clearFilters} className="w-full flex items-center justify-center gap-2 text-red-500 border border-red-200 py-2 rounded-lg hover:bg-red-50 transition-colors"><FaTimes /> Xóa bộ lọc</button>
        </div>

        {/* MAIN LIST */}
        <div className="md:w-3/4">
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500"><FaSortAmountDown className="inline"/> Sắp xếp:</span>
                    <select value={filters.sort} onChange={e => setFilters({...filters, sort: e.target.value})} className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:border-[var(--color-primary)]">
                        <option value="newest">Mới nhất</option>
                        <option value="price-asc">Giá: Thấp đến Cao</option>
                        <option value="price-desc">Giá: Cao đến Thấp</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(n => <div key={n} className="bg-gray-100 rounded-xl h-80 animate-pulse"></div>)}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg mt-4">Không tìm thấy phụ kiện nào.</p>
                    <button onClick={clearFilters} className="text-[var(--color-primary)] font-bold mt-2 hover:underline">Xóa bộ lọc</button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {products.map((p) => (
                            <AccessoryCard key={p._id} product={p} />
                        ))}
                    </div>
                    {pagination.pages > 1 && (
                        <div className="flex justify-center mt-10 gap-2">
                            {[...Array(pagination.pages).keys()].map(x => (
                                <button key={x + 1} onClick={() => handlePageChange(x + 1)} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${pagination.page === x + 1 ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                                    {x + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default Accessories;