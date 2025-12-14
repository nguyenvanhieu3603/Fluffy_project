import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaTimes, FaTicketAlt } from 'react-icons/fa';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percent', // 'percent' or 'fixed'
    discountValue: '',
    expiryDate: '',
    usageLimit: 100,
    minOrderValue: 0,
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons'); // API Admin get all
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', formData);
      toast.success('Tạo mã giảm giá thành công');
      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa mã giảm giá này?')) {
      try {
        await api.delete(`/coupons/${id}`);
        toast.success('Đã xóa');
        fetchCoupons();
      } catch (error) {
        toast.error('Lỗi khi xóa');
      }
    }
  };

  const handleToggleActive = async (coupon) => {
      try {
          await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
          fetchCoupons();
      } catch (error) {
          toast.error('Lỗi cập nhật');
      }
  };

  const resetForm = () => {
    setFormData({
        code: '', discountType: 'percent', discountValue: '',
        expiryDate: '', usageLimit: 100, minOrderValue: 0, isActive: true
    });
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Mã giảm giá</h2>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-600">
            <FaPlus /> Tạo mã mới
        </button>
      </div>

      {loading ? <div>Đang tải...</div> : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                    <tr>
                        <th className="p-4">Mã Code</th>
                        <th className="p-4">Giảm giá</th>
                        <th className="p-4">Điều kiện</th>
                        <th className="p-4">Lượt dùng</th>
                        <th className="p-4">Hết hạn</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {coupons.map(coupon => (
                        <tr key={coupon._id} className="hover:bg-gray-50">
                            <td className="p-4 font-bold text-[var(--color-primary)] font-mono text-lg flex items-center gap-2">
                                <FaTicketAlt className="text-gray-400 text-sm"/> {coupon.code}
                            </td>
                            <td className="p-4 font-bold">
                                {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : formatPrice(coupon.discountValue)}
                            </td>
                            <td className="p-4 text-gray-600">
                                Đơn tối thiểu: {formatPrice(coupon.minOrderValue)}
                            </td>
                            <td className="p-4">
                                {coupon.usageCount} / {coupon.usageLimit}
                            </td>
                            <td className="p-4 text-gray-500">
                                {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="p-4">
                                <button 
                                    onClick={() => handleToggleActive(coupon)}
                                    className={`px-2 py-1 rounded text-xs font-bold uppercase ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                >
                                    {coupon.isActive ? 'Hoạt động' : 'Đã khóa'}
                                </button>
                            </td>
                            <td className="p-4">
                                <button onClick={() => handleDelete(coupon._id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {coupons.length === 0 && <div className="p-8 text-center text-gray-500">Chưa có mã giảm giá nào.</div>}
          </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold">Tạo Coupon Mới</h3>
                    <button onClick={() => setShowModal(false)}><FaTimes className="text-xl text-gray-400"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Mã Code (Viết liền, không dấu)</label>
                        <input type="text" required className="w-full border rounded p-2 uppercase font-mono" placeholder="VD: SALE50" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\s/g, '')})}/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Loại giảm</label>
                            <select className="w-full border rounded p-2" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                                <option value="percent">Theo %</option>
                                <option value="fixed">Số tiền cố định</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Giá trị giảm</label>
                            <input type="number" required className="w-full border rounded p-2" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Đơn tối thiểu</label>
                            <input type="number" required className="w-full border rounded p-2" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Giới hạn số lượt</label>
                            <input type="number" required className="w-full border rounded p-2" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Ngày hết hạn</label>
                        <input type="date" required className="w-full border rounded p-2" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})}/>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Hủy</button>
                        <button type="submit" className="px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded">Tạo Coupon</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;