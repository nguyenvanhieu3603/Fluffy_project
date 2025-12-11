import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { FaFilter, FaSearch, FaTimes, FaSortAmountDown, FaPaw, FaMapMarkerAlt, FaVenusMars, FaDog, FaInfoCircle } from 'react-icons/fa';

const Pets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [pets, setPets] = useState([]);
  const [allCategories, setAllCategories] = useState([]); 
  const [displayCategories, setDisplayCategories] = useState([]); 
  const [breeds, setBreeds] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [rootId, setRootId] = useState(null);

  // State bộ lọc
  const [filters, setFilters] = useState({
    keyword: queryParams.get('keyword') || '',
    category: queryParams.get('category') || '', 
    selectedBreeds: [], 
    minPrice: queryParams.get('minPrice') || '',
    maxPrice: queryParams.get('maxPrice') || '',
    gender: queryParams.get('gender') || '',
    city: queryParams.get('city') || '',
    sort: queryParams.get('sort') || 'newest',
    pageNumber: queryParams.get('pageNumber') || 1
  });

  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // --- LOGIC MỚI: Đồng bộ filters khi URL thay đổi (Ví dụ: Tìm kiếm từ Header) ---
  useEffect(() => {
      const keywordFromUrl = queryParams.get('keyword') || '';
      // Nếu từ khóa trên URL khác với state hiện tại, cập nhật state
      if (keywordFromUrl !== filters.keyword) {
          setFilters(prev => ({ 
              ...prev, 
              keyword: keywordFromUrl, 
              pageNumber: 1 
          }));
      }
  }, [location.search]); // Chạy khi URL thay đổi
  // -----------------------------------------------------------------------------

  // 1. Fetch Danh mục và thiết lập ban đầu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setAllCategories(data); 

        const petsRoot = data.find(c => c.slug === 'thu-cung');
        const accRoot = data.find(c => c.slug === 'phu-kien');
        
        let currentRoot = null;

        if (location.pathname === '/accessories') {
             currentRoot = accRoot;
        } else {
             currentRoot = petsRoot;
        }

        if (currentRoot) {
            setRootId(currentRoot._id);
            const subCats = data.filter(c => c.parentId === currentRoot._id || c.parentId?._id === currentRoot._id);
            setDisplayCategories(subCats);

            if (!queryParams.get('category')) {
                setFilters(prev => ({ ...prev, category: currentRoot._id }));
            } else {
                setFilters(prev => ({ ...prev, category: queryParams.get('category') }));
            }
        }
      } catch (error) { console.error(error); }
    };
    fetchCategories();
  }, [location.pathname]);

  // 2. Logic cập nhật danh sách Giống Loài (Breeds) khi chọn Danh mục (Category)
  useEffect(() => {
      if (location.pathname === '/accessories') return;

      const currentCatId = filters.category;

      if (!currentCatId || currentCatId === rootId) {
          setBreeds([]);
          if (filters.selectedBreeds.length > 0) {
              setFilters(prev => ({ ...prev, selectedBreeds: [] }));
          }
          return;
      }

      const subBreeds = allCategories.filter(c => c.parentId === currentCatId || c.parentId?._id === currentCatId);
      setBreeds(subBreeds);
      
  }, [filters.category, allCategories, rootId, location.pathname]); 

  // 3. Fetch Pets
  useEffect(() => {
    if (!rootId && !filters.category) return;

    const fetchPets = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.keyword) params.append('keyword', filters.keyword);
        
        if (filters.selectedBreeds.length > 0) {
            params.append('category', filters.selectedBreeds.join(','));
        } else {
            params.append('category', filters.category || rootId);
        }
        
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sort) params.append('sort', filters.sort);
        params.append('pageNumber', filters.pageNumber);

        if (filters.gender) params.append('gender', filters.gender);
        if (filters.city) params.append('city', filters.city);
        
        // Không navigate ở đây để tránh loop khi tìm kiếm từ Header
        // if (location.pathname !== '/accessories') {
        //      navigate({ search: params.toString() }, { replace: true });
        // }

        const { data } = await api.get(`/pets?${params.toString()}`);
        setPets(data.pets);
        setPagination({ page: data.page, pages: data.pages, total: data.total });
      } catch (error) { console.error("Lỗi tải thú cưng:", error); } 
      finally { setLoading(false); }
    };

    fetchPets();
    window.scrollTo(0, 0);
  }, [filters, rootId, navigate, location.pathname]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
        setFilters(prev => ({ ...prev, [name]: value, selectedBreeds: [], pageNumber: 1 }));
    } else {
        setFilters(prev => ({ ...prev, [name]: value, pageNumber: 1 }));
    }
  };

  const handleBreedCheckboxChange = (breedId) => {
      setFilters(prev => {
          const currentSelected = prev.selectedBreeds;
          if (currentSelected.includes(breedId)) {
              return { ...prev, selectedBreeds: currentSelected.filter(id => id !== breedId), pageNumber: 1 };
          } else {
              return { ...prev, selectedBreeds: [...currentSelected, breedId], pageNumber: 1 };
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
      selectedBreeds: [],
      minPrice: '', maxPrice: '',
      gender: '', city: '',
      sort: 'newest',
      pageNumber: 1
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            {location.pathname === '/accessories' ? <FaPaw className="text-blue-500"/> : <FaPaw className="text-[var(--color-primary)]"/>}
            {location.pathname === '/accessories' ? 'Phụ Kiện' : 'Tìm kiếm Thú Cưng'}
            <span className="text-gray-500 text-lg font-normal">({pagination.total} kết quả)</span>
        </h1>
        
        {/* THANH TÌM KIẾM TRONG TRANG PETS */}
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <input 
                    type="text" 
                    name="keyword" 
                    value={filters.keyword} 
                    onChange={handleFilterChange} 
                    placeholder="Lọc theo tên..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:border-[var(--color-primary)]"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400"/>
            </div>
            <button className="md:hidden bg-gray-100 p-2 rounded-full text-gray-600" onClick={() => setShowMobileFilter(!showMobileFilter)}><FaFilter /></button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className={`md:w-1/4 space-y-6 ${showMobileFilter ? 'block' : 'hidden md:block'}`}>
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaFilter className="text-[var(--color-primary)]"/> Danh mục
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="category" value={rootId || ''} checked={filters.category === rootId} onChange={handleFilterChange} className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"/>
                        <span className="text-gray-600">Tất cả</span>
                    </label>
                    {displayCategories.map(cat => (
                        <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="category" value={cat._id} checked={filters.category === cat._id} onChange={handleFilterChange} className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"/>
                            <span className="text-gray-600">{cat.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {location.pathname !== '/accessories' && (
                <>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaDog className="text-gray-400"/> Giống loài</h3>
                        
                        {breeds.length === 0 ? (
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <FaInfoCircle className="text-gray-400 text-xl mx-auto mb-2"/>
                                <p className="text-sm text-gray-500">Hãy chọn một loại thú nuôi bên trên (Chó, Mèo...) để xem danh sách giống.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {breeds.map(breed => (
                                    <label key={breed._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input 
                                            type="checkbox" 
                                            value={breed._id} 
                                            checked={filters.selectedBreeds.includes(breed._id)}
                                            onChange={() => handleBreedCheckboxChange(breed._id)}
                                            className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                        />
                                        <span className="text-sm text-gray-700">{breed.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaVenusMars className="text-gray-400"/> Giới tính</h3>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="gender" value="" checked={filters.gender === ''} onChange={handleFilterChange}/>
                                <span className="text-sm text-gray-600">Tất cả</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="gender" value="Đực" checked={filters.gender === 'Đực'} onChange={handleFilterChange}/>
                                <span className="text-sm text-gray-600">Đực</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="gender" value="Cái" checked={filters.gender === 'Cái'} onChange={handleFilterChange}/>
                                <span className="text-sm text-gray-600">Cái</span>
                            </label>
                        </div>
                    </div>
                </>
            )}

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaMapMarkerAlt className="text-gray-400"/> Khu vực</h3>
                <select name="city" value={filters.city} onChange={handleFilterChange} className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]">
                    <option value="">Toàn quốc</option>
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                </select>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Khoảng giá</h3>
                <div className="flex items-center gap-2 mb-4">
                    <input type="number" name="minPrice" placeholder="Từ" value={filters.minPrice} onChange={handleFilterChange} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-[var(--color-primary)]"/>
                    <span>-</span>
                    <input type="number" name="maxPrice" placeholder="Đến" value={filters.maxPrice} onChange={handleFilterChange} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-[var(--color-primary)]"/>
                </div>
                <button onClick={() => setFilters({...filters, pageNumber: 1})} className="w-full bg-gray-100 text-gray-700 py-1 rounded text-sm hover:bg-gray-200">Áp dụng</button>
            </div>

            <button onClick={clearFilters} className="w-full flex items-center justify-center gap-2 text-red-500 border border-red-200 py-2 rounded-lg hover:bg-red-50 transition-colors"><FaTimes /> Xóa bộ lọc</button>
        </div>

        <div className="md:w-3/4">
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500"><FaSortAmountDown className="inline"/> Sắp xếp:</span>
                    <select name="sort" value={filters.sort} onChange={handleFilterChange} className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:border-[var(--color-primary)]">
                        <option value="newest">Mới nhất</option>
                        <option value="price-asc">Giá: Thấp đến Cao</option>
                        <option value="price-desc">Giá: Cao đến Thấp</option>
                        <option value="oldest">Cũ nhất</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(n => <div key={n} className="bg-gray-100 rounded-xl h-80 animate-pulse"></div>)}
                </div>
            ) : pets.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg mt-4">Không tìm thấy sản phẩm nào phù hợp.</p>
                    <button onClick={clearFilters} className="text-[var(--color-primary)] font-bold mt-2 hover:underline">Xóa bộ lọc</button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {pets.map((pet) => (
                            <ProductCard key={pet._id} product={pet} />
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

export default Pets;