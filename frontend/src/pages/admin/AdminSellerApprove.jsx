import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaCheck, FaStore } from 'react-icons/fa';

const AdminSellerApprove = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/users/seller-requests');
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id, name) => {
      if(window.confirm(`Xác nhận duyệt shop ${name}?`)) {
          try {
              await api.put(`/users/${id}/approve-seller`);
              toast.success(`Đã duyệt shop ${name} thành công!`);
              fetchRequests();
          } catch (error) {
              toast.error('Lỗi khi duyệt');
          }
      }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Duyệt yêu cầu Người bán</h2>

      {loading ? <div>Đang tải...</div> : requests.length === 0 ? (
          <div className="bg-white p-10 rounded-xl text-center text-gray-500 shadow-sm">
              Không có yêu cầu đăng ký mới.
          </div>
      ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                    <tr>
                        <th className="p-4">Tên Shop</th>
                        <th className="p-4">Chủ sở hữu</th>
                        <th className="p-4">Địa chỉ</th>
                        <th className="p-4">Ngày đăng ký</th>
                        <th className="p-4">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {requests.map(req => (
                        <tr key={req._id} className="hover:bg-gray-50">
                            <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                                <FaStore className="text-gray-400"/>
                                {req.sellerInfo?.shopName}
                            </td>
                            <td className="p-4">
                                <div>{req.fullName}</div>
                                <div className="text-xs text-gray-500">{req.email}</div>
                            </td>
                            <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{req.sellerInfo?.shopAddress}</td>
                            <td className="p-4 text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td className="p-4">
                                <button 
                                    onClick={() => handleApprove(req._id, req.sellerInfo?.shopName)}
                                    className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold hover:bg-yellow-600 text-sm flex items-center gap-2"
                                >
                                    <FaCheck /> Duyệt ngay
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      )}
    </div>
  );
};

export default AdminSellerApprove;