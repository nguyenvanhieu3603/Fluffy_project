import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaPaw, FaImage, FaFileMedical, FaSearch } from 'react-icons/fa';

const SellerPets = () => {
  const [pets, setPets] = useState([]);
  const [displayedPets, setDisplayedPets] = useState([]);
  const [allCategories, setAllCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [parentGroup, setParentGroup] = useState(''); 
  const [filteredSubCats, setFilteredSubCats] = useState([]); 
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock: 1, category: '',
    age: '', gender: 'Đực', breed: '', 
    weight: '', length: '', color: '', 
    images: [] 
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [certFile, setCertFile] = useState(null);
  const [certPreview, setCertPreview] = useState(null);

  useEffect(() => {
    fetchMyPets();
    fetchCategories();
  }, []);

  useEffect(() => {
      if (parentGroup) {
          const subs = allCategories.filter(c => c.parentId === parentGroup || c.parentId?._id === parentGroup);
          setFilteredSubCats(subs);
      } else {
          setFilteredSubCats([]);
      }
  }, [parentGroup, allCategories]);

  // --- LOGIC LỌC (CLIENT SIDE) ---
  useEffect(() => {
      let result = [...pets];

      // 1. Chỉ lấy Thú cưng
      result = result.filter(p => p.type === 'pet' || p.breed);

      // 2. Tìm kiếm (Tên hoặc Màu sắc)
      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          result = result.filter(p => 
              p.name.toLowerCase().includes(lowerTerm) || 
              (p.color && p.color.toLowerCase().includes(lowerTerm))
          );
      }

      // 3. Sắp xếp
      switch(sortOption) {
          case 'newest': result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
          case 'oldest': result.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
          case 'price-asc': result.sort((a,b) => a.price - b.price); break;
          case 'price-desc': result.sort((a,b) => b.price - a.price); break;
      }

      setDisplayedPets(result);
  }, [pets, searchTerm, sortOption]);

  const fetchMyPets = async () => {
    try {
      const { data } = await api.get('/pets/my-pets');
      setPets(data);
    } catch (error) { toast.error('Lỗi tải danh sách'); } 
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setAllCategories(data);
    } catch (error) { console.error(error); }
  };

  const getPetGroups = () => {
      const root = allCategories.find(c => c.slug === 'thu-cung');
      if (!root) return [];
      return allCategories.filter(c => c.parentId === root._id || c.parentId?._id === root._id);
  };

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

  const handleCertChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setCertFile(file);
          setCertPreview(URL.createObjectURL(file));
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return toast.error('Vui lòng chọn danh mục chi tiết');
    if (!isEditMode && formData.images.length === 0) return toast.error('Vui lòng chọn ảnh');
    if (!isEditMode && !certFile) return toast.error('Thiếu giấy chứng nhận sức khỏe');

    try {
      let breedName = formData.breed;
      if (formData.category) {
          const selectedCat = allCategories.find(c => c._id === formData.category);
          if (selectedCat) breedName = selectedCat.name;
      }

      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('category', formData.category);
      data.append('status', 'available'); 
      data.append('type', 'pet'); 

      data.append('age', formData.age);
      data.append('gender', formData.gender);
      data.append('breed', breedName);
      data.append('weight', formData.weight);
      data.append('length', formData.length);
      data.append('color', formData.color); 
      
      if (certFile) data.append('certification', certFile);
      
      if (formData.images.length > 0) {
          formData.images.forEach((file) => data.append('images', file));
      }

      if (isEditMode) {
        await api.put(`/pets/${editingId}`, data);
        toast.success('Cập nhật thú cưng thành công!');
      } else {
        await api.post('/pets', data);
        toast.success('Đăng bán thú cưng thành công!');
      }

      setShowModal(false);
      resetForm();
      fetchMyPets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa thú cưng này?')) {
        try { await api.delete(`/pets/${id}`); toast.success('Đã xóa'); fetchMyPets(); } 
        catch (error) { toast.error('Lỗi khi xóa'); }
    }
  };

  const openEditModal = (pet) => {
      setIsEditMode(true);
      setEditingId(pet._id);
      setFormData({
          name: pet.name, description: pet.description, price: pet.price, stock: pet.stock, category: pet.category._id,
          age: pet.age || '', gender: pet.gender || 'Đực', breed: pet.breed || '', 
          weight: pet.weight || '', length: pet.length || '', color: pet.color || '', 
          images: []
      });
      setPreviewImages(pet.images || []);
      setCertFile(null); 
      setCertPreview(pet.healthInfo?.vaccinationCertificate ? `http://localhost:5000${pet.healthInfo.vaccinationCertificate}` : null);
      setShowModal(true);
  };

  const resetForm = () => {
      setFormData({
        name: '', description: '', price: '', stock: 1, category: '',
        age: '', gender: 'Đực', breed: '', weight: '', length: '', color: '',
        images: []
      });
      setPreviewImages([]);
      setCertFile(null); setCertPreview(null);
      setIsEditMode(false);
      setEditingId(null);
      setParentGroup('');
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaPaw className="text-[var(--color-primary)]"/> Quản lý Thú cưng
            </h2>
            <p className="text-gray-500 text-sm mt-1">Tổng: <b>{displayedPets.length}</b> bé thú cưng</p>
        </div>
        
        <div className="flex gap-3 items-center">
            {/* Search Box */}
            <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input 
                    type="text" 
                    placeholder="Tìm tên hoặc màu sắc..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] w-64"
                />
            </div>

            <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-600 transition-colors shadow-sm whitespace-nowrap">
                <FaPlus /> Đăng mới
            </button>
        </div>
      </div>

      {loading ? <div className="text-center py-12">Đang tải dữ liệu...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4 border-b w-[80px]">Ảnh</th>
                        <th className="p-4 border-b">Tên thú cưng</th>
                        <th className="p-4 border-b">Thông tin chi tiết</th>
                        <th className="p-4 border-b w-[150px]">Giá & Kho</th>
                        <th className="p-4 border-b w-[120px]">Sức khỏe</th>
                        <th className="p-4 border-b w-[100px]">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {displayedPets.map(pet => (
                        <tr 
                            key={pet._id} 
                            className={`transition-colors ${
                                pet.stock === 1 
                                ? 'bg-red-50 border-l-4 border-red-500' // Nền đỏ khi còn 1
                                : 'hover:bg-gray-50'
                            }`}
                        >
                            <td className="p-4"><img src={pet.images[0]} alt={pet.name} className="w-12 h-12 rounded object-cover border bg-white"/></td>
                            <td className="p-4">
                                <div className="font-medium text-gray-800 max-w-xs truncate" title={pet.name}>{pet.name}</div>
                                <div className="text-xs text-gray-500 mt-1">{pet.category?.name || 'Chưa phân loại'}</div>
                            </td>
                            <td className="p-4">
                                <div className="space-y-1 text-xs text-gray-600">
                                    <p>Giống: <span className="font-medium">{pet.breed}</span></p>
                                    <p>Tuổi: {pet.age} | {pet.gender}</p>
                                    {/* Hiển thị màu sắc */}
                                    {pet.color && <p>Màu: {pet.color}</p>}
                                    <p>Cân nặng: {pet.weight || '--'} | Dài: {pet.length || '--'}</p>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="font-bold text-[var(--color-primary)]">{formatPrice(pet.price)}</div>
                                
                                <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${pet.stock === 1 ? 'bg-red-600 text-white font-bold' : (pet.stock === 0 ? 'text-gray-400' : 'text-gray-500')}`}>
                                    Kho: {pet.stock} {pet.stock === 1 && '(Sắp hết)'} {pet.stock === 0 && '(Hết hàng)'}
                                </div>
                            </td>
                            <td className="p-4">
                                {pet.healthStatus === 'pending' 
                                    ? <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-[10px] font-bold uppercase">Chờ duyệt</span> 
                                    : <span className="text-green-700 bg-green-100 px-2 py-1 rounded text-[10px] font-bold uppercase">Đã duyệt</span>
                                }
                            </td>
                            <td className="p-4 flex gap-2">
                                <button onClick={() => openEditModal(pet)} className="text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors"><FaEdit /></button>
                                <button onClick={() => handleDelete(pet._id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {displayedPets.length === 0 && (
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg mt-4 border border-dashed border-gray-200">
                    <FaPaw className="mx-auto text-4xl text-gray-300 mb-2"/>
                    <p>Bạn chưa đăng bán thú cưng nào.</p>
                </div>
            )}
          </div>
      )}

      {/* --- FORM MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-800">{isEditMode ? 'Cập nhật thú cưng' : 'Đăng bán thú cưng mới'}</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500"><FaTimes className="text-xl"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên thú cưng <span className="text-red-500">*</span></label>
                            <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)]" placeholder="VD: Bé Corgi chân ngắn..."/>
                        </div>
                        
                        <div>
                            <div className="space-y-2">
                                <select value={parentGroup} onChange={(e) => setParentGroup(e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none bg-gray-50 focus:border-[var(--color-primary)]">
                                    <option value="">-- Chọn loài --</option>
                                    {getPetGroups().map(grp => (
                                        <option key={grp._id} value={grp._id}>{grp.name}</option>
                                    ))}
                                </select>

                                <select name="category" required value={formData.category} onChange={handleInputChange} disabled={!parentGroup} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)] disabled:bg-gray-100">
                                    <option value="">-- Chọn giống --</option>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                            <input type="number" name="stock" required min="1" value={formData.stock} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)]"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tuổi</label>
                            <input type="text" name="age" value={formData.age} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)]" placeholder="VD: 2 tháng"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)]">
                                <option value="Đực">Đực</option>
                                <option value="Cái">Cái</option>
                                <option value="Không xác định">Không xác định</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cân nặng</label>
                            <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)]" placeholder="VD: 3.5 kg"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chiều dài</label>
                            <input type="text" name="length" value={formData.length} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)]" placeholder="VD: 30 cm"/>
                        </div>
                        {/* Input màu sắc */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                            <input type="text" name="color" value={formData.color} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)]" placeholder="VD: Trắng, Nâu vàng, Vện..."/>
                        </div>
                    </div>

                    {!isEditMode && (
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giấy chứng nhận sức khỏe <span className="text-red-500">*</span></label>
                            <div className="border border-gray-300 rounded-lg p-3 flex items-center gap-4 bg-blue-50/50">
                                <input type="file" accept="image/*" onChange={handleCertChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                {certPreview && <img src={certPreview} alt="Cert Preview" className="h-10 w-10 object-cover rounded border"/>}
                                {!certPreview && <FaFileMedical className="text-gray-400 text-xl"/>}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                        <textarea name="description" rows="3" required value={formData.description} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)]" placeholder="Mô tả về tình trạng sức khỏe, tiêm phòng..."></textarea>
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

export default SellerPets;