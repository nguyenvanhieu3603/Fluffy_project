// frontend/src/pages/admin/AdminBlogs.jsx
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaImage, FaEye } from 'react-icons/fa';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '', excerpt: '', content: '', isVisible: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      // Thêm param isAdmin=true để lấy cả bài ẩn
      const { data } = await api.get('/blogs?isAdmin=true');
      setBlogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setImageFile(file);
        setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('excerpt', formData.excerpt);
        data.append('content', formData.content); // Nếu dùng editor thì đây là HTML string
        data.append('isVisible', formData.isVisible);
        if (imageFile) data.append('image', imageFile);

        if (isEditMode) {
            await api.put(`/blogs/${editingId}`, data);
            toast.success('Cập nhật bài viết thành công');
        } else {
            if (!imageFile) return toast.error('Vui lòng chọn ảnh đại diện');
            await api.post('/blogs', data);
            toast.success('Đăng bài viết thành công');
        }
        
        setShowModal(false);
        resetForm();
        fetchBlogs();
    } catch (error) {
        toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
      if(window.confirm('Xóa bài viết này?')) {
          try {
              await api.delete(`/blogs/${id}`);
              toast.success('Đã xóa');
              fetchBlogs();
          } catch (error) {
              toast.error('Lỗi khi xóa');
          }
      }
  };

  const openEdit = (blog) => {
      setIsEditMode(true);
      setEditingId(blog._id);
      setFormData({
          title: blog.title,
          excerpt: blog.excerpt,
          content: blog.content,
          isVisible: blog.isVisible
      });
      setPreviewImage(blog.image);
      setShowModal(true);
  };

  const resetForm = () => {
      setFormData({ title: '', excerpt: '', content: '', isVisible: true });
      setImageFile(null);
      setPreviewImage(null);
      setIsEditMode(false);
      setEditingId(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Tin tức</h2>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-600">
            <FaPlus /> Viết bài mới
        </button>
      </div>

      {loading ? <div>Đang tải...</div> : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                    <tr>
                        <th className="p-4">Ảnh</th>
                        <th className="p-4 w-1/3">Tiêu đề</th>
                        <th className="p-4">Tác giả</th>
                        <th className="p-4">Ngày đăng</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {blogs.map(blog => (
                        <tr key={blog._id} className="hover:bg-gray-50">
                            <td className="p-4"><img src={blog.image} className="w-16 h-12 object-cover rounded border"/></td>
                            <td className="p-4 font-bold text-gray-800 line-clamp-2" title={blog.title}>{blog.title}</td>
                            <td className="p-4 text-sm">{blog.author}</td>
                            <td className="p-4 text-sm text-gray-500">{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td className="p-4">
                                {blog.isVisible ? <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">Hiển thị</span> : <span className="text-gray-500 text-xs font-bold bg-gray-100 px-2 py-1 rounded">Ẩn</span>}
                            </td>
                            <td className="p-4 flex gap-2">
                                <button onClick={() => openEdit(blog)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><FaEdit /></button>
                                <button onClick={() => handleDelete(blog._id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {blogs.length === 0 && <div className="p-8 text-center text-gray-500">Chưa có bài viết nào.</div>}
          </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold">{isEditMode ? 'Sửa bài viết' : 'Viết bài mới'}</h3>
                    <button onClick={() => setShowModal(false)}><FaTimes className="text-xl text-gray-400"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Tiêu đề</label>
                        <input type="text" required className="w-full border rounded p-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}/>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold mb-1">Tóm tắt (Excerpt)</label>
                            <textarea rows="3" required className="w-full border rounded p-2" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})}></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Ảnh đại diện</label>
                            <div className="border-2 border-dashed rounded-lg p-2 text-center h-28 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative">
                                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer"/>
                                {previewImage ? (
                                    <img src={previewImage} className="h-full object-contain"/>
                                ) : (
                                    <div className="text-gray-400"><FaImage className="text-2xl mx-auto"/> <span className="text-xs">Chọn ảnh</span></div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Nội dung chi tiết (HTML)</label>
                        <textarea rows="10" required className="w-full border rounded p-2 font-mono text-sm" 
                            placeholder="Nhập nội dung bài viết (Hỗ trợ thẻ HTML cơ bản như <p>, <b>, <img>...)"
                            value={formData.content} 
                            onChange={e => setFormData({...formData, content: e.target.value})}
                        ></textarea>
                        <p className="text-xs text-gray-500 mt-1">* Mẹo: Bạn có thể nhập mã HTML để định dạng bài viết.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.isVisible} onChange={e => setFormData({...formData, isVisible: e.target.checked})} />
                        <label>Hiển thị bài viết ngay</label>
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-3">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Hủy</button>
                        <button type="submit" className="px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded">Lưu bài viết</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;