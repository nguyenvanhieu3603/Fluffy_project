import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaBox, FaImage, FaSearch, FaAngleLeft, FaAngleRight, FaBoxOpen } from 'react-icons/fa';

const SellerAccessories = () => {
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [parentGroup, setParentGroup] = useState(''); 
  const [filteredSubCats, setFilteredSubCats] = useState([]); 
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock: 1, category: '',
    images: [] 
  });
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    fetchMyProducts();
    fetchCategories();
  }, []);

  // Logic lọc danh mục con (Chỉ lấy danh mục Phụ kiện)
  useEffect(() => {
      if (parentGroup) {
          const subs = allCategories.filter(c => c.parentId === parentGroup || c.parentId?._id === parentGroup);
          setFilteredSubCats(subs);
      } else {
          setFilteredSubCats([]);
      }
  }, [parentGroup, allCategories]);

  // --- LOGIC LỌC & SẮP XẾP ---
  useEffect(() => {
      let result = [...products];

      // 1. Chỉ lấy Phụ kiện (những sp không có breed/age)
      result = result.filter(p => !p.breed && !p.age);

      // 2. Tìm kiếm
      if (searchTerm) {
          result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      }

      // 3. Sắp xếp
      switch(sortOption) {
          case 'newest': result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
          case 'oldest': result.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
          case 'price-asc': result.sort((a,b) => a.price - b.price); break;
          case 'price-desc': result.sort((a,b) => b.price - a.price); break;
          case 'stock-asc': result.sort((a,b) => a.stock - b.stock); break;
          case 'stock-desc': result.sort((a,b) => b.stock - a.stock); break;
      }

      setDisplayedProducts(result);
  }, [products, searchTerm, sortOption]);

  const fetchMyProducts = async () => {
    try {
      const { data } = await api.get('/pets/my-pets'); // API dùng chung, lọc ở client
      setProducts(data);
    } catch (error) { toast.error('Lỗi tải danh sách'); } 
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setAllCategories(data);
    } catch (error) { console.error(error); }
  };

  const getAccessoryGroups = () => {
      const root = allCategories.find(c => c.slug === 'phu-kien');
      if (!root) return [];
      return allCategories.filter(c => c.parentId === root._id || c.parentId?._id === root._id);
  };

  // --- Form Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: files });
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return toast.error('Vui lòng chọn danh mục chi tiết');
    if (!isEditMode && formData.images.length === 0) return toast.error('Vui lòng chọn ảnh');

    try {
      if (isEditMode) {
        await api.put(`/pets/${editingId}`, {
            name: formData.name, description: formData.description, price: formData.price, stock: formData.stock, status: 'available'
        });
        toast.success('Cập nhật phụ kiện thành công!');
      } else {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        data.append('category', formData.category);
        
        // Gửi trường rỗng để BE hiểu đây là phụ kiện
        data.append('breed', '');
        data.append('age', '');
        
        formData.images.forEach((file) => data.append('images', file));

        await api.post('/pets', data);
        toast.success('Đăng bán phụ kiện thành công!');
      }

      setShowModal(false);
      resetForm();
      fetchMyProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa sản phẩm này?')) {
        try { await api.delete(`/pets/${id}`); toast.success('Đã xóa'); fetchMyProducts(); } 
        catch (error) { toast.error('Lỗi khi xóa'); }
    }
  };

  const openEditModal = (p) => {
      setIsEditMode(true);
      setEditingId(p._id);
      setFormData({
          name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category._id,
          images: []
      });
      setPreviewImages(p.images || []);
      setShowModal(true);
  };

  const resetForm = () => {
      setFormData({
        name: '', description: '', price: '', stock: 1, category: '',
        images: []
      });
      setPreviewImages([]);
      setIsEditMode(false);
      setEditingId(null);
      setParentGroup('');
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[600px] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaBox className="text-blue-500"/> Quản lý Phụ kiện
            </h2>
            <p className="text-gray-500 text-sm mt-1">Tổng: <b>{displayedProducts.length}</b> sản phẩm</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-grow md:flex-grow-0">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input 
                    type="text" 
                    placeholder="Tìm tên phụ kiện..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] w-full md:w-56"
                />
            </div>
            
            {/* Sort */}
            <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)} 
                className="px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:outline-none"
            >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="stock-asc">Tồn kho thấp</option>
                <option value="stock-desc">Tồn kho cao</option>
            </select>

            <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-600 transition-colors shadow-sm whitespace-nowrap">
                <FaPlus /> Thêm mới
            </button>
        </div>
      </div>

      {loading ? <div className="text-center py-12">Đang tải dữ liệu...</div> : (
          <div className="flex-grow">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider">
                            <th className="p-4 border-b w-[80px]">Ảnh</th>
                            <th className="p-4 border-b">Tên sản phẩm</th>
                            <th className="p-4 border-b">Danh mục</th>
                            <th className="p-4 border-b w-[150px]">Giá & Kho</th>
                            <th className="p-4 border-b w-[100px]">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {currentItems.map(p => (
                            <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4"><img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded object-cover border bg-gray-100"/></td>
                                <td className="p-4">
                                    <div className="font-medium text-gray-800 max-w-xs truncate" title={p.name}>{p.name}</div>
                                </td>
                                <td className="p-4 text-gray-600">
                                    {p.category?.name || '---'}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-[var(--color-primary)]">{formatPrice(p.price)}</div>
                                    <div className={`text-xs mt-1 ${p.stock < 5 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                        Kho: {p.stock}
                                    </div>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => openEditModal(p)} className="text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors"><FaEdit /></button>
                                    <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {currentItems.length === 0 && (
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg mt-4 border border-dashed border-gray-200">
                    <FaBoxOpen className="mx-auto text-4xl text-gray-300 mb-2"/>
                    <p>Chưa có phụ kiện nào.</p>
                </div>
            )}
            
            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"><FaAngleLeft /></button>
                    <span className="text-sm font-medium">Trang {currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"><FaAngleRight /></button>
                </div>
            )}
          </div>
      )}

      {/* --- FORM MODAL PHỤ KIỆN --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-800">{isEditMode ? 'Cập nhật phụ kiện' : 'Đăng bán phụ kiện mới'}</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500"><FaTimes className="text-xl"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                            <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)]" placeholder="VD: Chuồng sắt sơn tĩnh điện..."/>
                        </div>
                        
                        <div>
                            <div className="space-y-2">
                                <select value={parentGroup} onChange={(e) => setParentGroup(e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none bg-gray-50 focus:border-[var(--color-primary)]">
                                    <option value="">-- Loại phụ kiện --</option>
                                    {getAccessoryGroups().map(grp => (
                                        <option key={grp._id} value={grp._id}>{grp.name}</option>
                                    ))}
                                </select>

                                <select name="category" required value={formData.category} onChange={handleInputChange} disabled={!parentGroup} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)] disabled:bg-gray-100">
                                    <option value="">-- Chi tiết --</option>
                                    {filteredSubCats.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                            <input type="number" name="price" required min="0" value={formData.price} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)]"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng kho</label>
                            <input type="number" name="stock" required min="1" value={formData.stock} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)]"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                        <textarea name="description" rows="3" required value={formData.description} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)]" placeholder="Mô tả về sản phẩm..."></textarea>
                    </div>

                    {!isEditMode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh (Tối đa 5 ảnh) <span className="text-red-500">*</span></label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 relative transition-colors">
                                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                                <FaImage className="mx-auto text-gray-400 text-2xl mb-2"/>
                                <span className="text-sm text-gray-500">Kéo thả hoặc click để tải ảnh lên</span>
                            </div>
                        </div>
                    )}

                    {previewImages.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto py-2">
                            {previewImages.map((src, idx) => (
                                <img key={idx} src={src} alt="Preview" className="w-20 h-20 object-cover rounded-lg border"/>
                            ))}
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">Hủy bỏ</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white font-bold hover:bg-yellow-600 shadow-lg transition-transform active:scale-95">
                            {isEditMode ? 'Lưu thay đổi' : 'Đăng bán ngay'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default SellerAccessories;