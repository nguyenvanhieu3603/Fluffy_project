import { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaPlus, FaEdit, FaTrash, FaTimes, 
  FaFolder, FaFolderOpen, FaSearch, FaLayerGroup, FaLevelUpAlt 
} from 'react-icons/fa';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.warning('Vui lòng nhập tên danh mục');

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        parentId: formData.parentId || null
      };

      if (isEditMode) {
        await api.put(`/categories/${editingId}`, payload);
        toast.success('Cập nhật thành công!');
      } else {
        await api.post('/categories', payload);
        toast.success('Thêm danh mục thành công!');
      }
      
      closeModal();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"?\nLưu ý: Không thể xóa nếu danh mục này đang chứa danh mục con.`)) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Đã xóa thành công');
        fetchCategories();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa');
      }
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setIsEditMode(true);
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      parentId: cat.parentId?._id || cat.parentId || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', parentId: '' });
    setIsEditMode(false);
    setEditingId(null);
  };

  // --- Xử lý Logic hiển thị cây danh mục ---

  // 1. Chuyển danh sách phẳng thành cấu trúc có level để hiển thị
  const processedCategories = useMemo(() => {
    const roots = categories.filter(c => !c.parentId);
    let result = [];

    const traverse = (nodes, level) => {
      nodes.forEach(node => {
        result.push({ ...node, level });
        const children = categories.filter(c => 
          c.parentId && (c.parentId === node._id || c.parentId._id === node._id)
        );
        traverse(children, level + 1);
      });
    };

    traverse(roots, 0);
    return result;
  }, [categories]);

  // 2. Lọc theo từ khóa tìm kiếm
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return processedCategories;
    return processedCategories.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, processedCategories]);

  return (
    <div className="p-2 sm:p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaLayerGroup className="text-[var(--color-primary)]" />
            Quản lý Danh mục
          </h2>
          <p className="text-gray-500 text-sm mt-1">Quản lý phân loại sản phẩm và cấu trúc hiển thị</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Tìm kiếm danh mục..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={openAddModal} 
            className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:brightness-110 shadow-md transition-all whitespace-nowrap"
          >
            <FaPlus /> <span className="hidden sm:inline">Thêm mới</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <FaFolderOpen className="text-4xl mb-3 opacity-30" />
            <p>Không tìm thấy danh mục nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider border-b border-gray-100">
                  <th className="p-4 w-2/5 font-semibold">Tên danh mục</th>
                  <th className="p-4 w-1/5 font-semibold">Đường dẫn (Slug)</th>
                  <th className="p-4 w-1/5 font-semibold">Mô tả</th>
                  <th className="p-4 w-1/5 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCategories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-blue-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center" style={{ paddingLeft: `${cat.level * 32}px` }}>
                        {cat.level > 0 && (
                          <span className="text-gray-300 mr-2 select-none border-l-2 border-b-2 border-gray-200 w-4 h-4 rounded-bl-sm inline-block -translate-y-1"></span>
                        )}
                        <span className={`flex items-center gap-2 px-2 py-1 rounded ${cat.level === 0 ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                          {cat.level === 0 ? <FaFolder className="text-[var(--color-primary)]" /> : <FaFolderOpen className="text-gray-400" />}
                          {cat.name}
                        </span>
                        {cat.level === 0 && (
                          <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">Gốc</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-sm font-mono">{cat.slug}</td>
                    <td className="p-4 text-gray-500 text-sm truncate max-w-[200px]">{cat.description}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(cat)} 
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg tooltip"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat._id, cat.name)} 
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Được thiết kế lại đẹp hơn */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden transform transition-all scale-100 animate-fade-in-up">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {isEditMode ? <FaEdit className="text-blue-500"/> : <FaPlus className="text-green-500"/>}
                {isEditMode ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên danh mục <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                  placeholder="Ví dụ: Thức ăn cho mèo"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Danh mục cha</label>
                <div className="relative">
                  <select 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none appearance-none bg-white"
                    value={formData.parentId} 
                    onChange={e => setFormData({...formData, parentId: e.target.value})}
                  >
                    <option value="">-- Là danh mục gốc (Không có cha) --</option>
                    {processedCategories.map(c => (
                      // Không cho phép chọn chính nó làm cha hoặc chọn con của nó làm cha (logic đơn giản: ẩn chính nó)
                      c._id !== editingId && (
                        <option key={c._id} value={c._id} className="text-gray-700">
                          {Array(c.level).fill('— ').join('')} {c.name}
                        </option>
                      )
                    ))}
                  </select>
                  <FaLevelUpAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Để trống nếu đây là danh mục lớn nhất (cấp 1).</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả (Tùy chọn)</label>
                <textarea 
                  rows="3" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Mô tả ngắn về danh mục này..."
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white font-bold hover:bg-yellow-600 shadow-lg shadow-yellow-500/30 transition-all transform active:scale-95"
                >
                  {isEditMode ? 'Lưu thay đổi' : 'Tạo danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;