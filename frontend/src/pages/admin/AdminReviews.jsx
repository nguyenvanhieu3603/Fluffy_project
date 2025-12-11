import { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaStar, FaTrash, FaCheckCircle, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get('/admin/reviews');
      setReviews(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
      if(window.confirm('Bạn có chắc muốn xóa đánh giá này? (Hành động này không thể hoàn tác)')) {
          try {
              await api.delete(`/admin/reviews/${id}`);
              toast.success('Đã xóa đánh giá vi phạm');
              fetchReviews();
          } catch (error) {
              toast.error('Lỗi khi xóa');
          }
      }
  };

  const renderStars = (rating) => {
      return [...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"} />
      ));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Đánh giá & Bình luận</h2>
      
      {loading ? <div>Đang tải...</div> : reviews.length === 0 ? (
          <div className="bg-white p-10 rounded-xl text-center text-gray-500 shadow-sm">Chưa có đánh giá nào.</div>
      ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                    <tr>
                        <th className="p-4">Sản phẩm</th>
                        <th className="p-4">Người đánh giá</th>
                        <th className="p-4">Điểm</th>
                        <th className="p-4 w-1/3">Nội dung</th>
                        <th className="p-4">Ngày tạo</th>
                        <th className="p-4">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {reviews.map(review => (
                        <tr key={review._id} className="hover:bg-gray-50">
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <img src={review.pet?.images[0]} className="w-10 h-10 rounded object-cover border"/>
                                    <span className="font-medium max-w-[150px] truncate" title={review.pet?.name}>{review.pet?.name}</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    {review.customer?.avatar ? (
                                        <img src={review.customer.avatar} className="w-6 h-6 rounded-full"/>
                                    ) : <FaUser className="text-gray-400"/>}
                                    {review.customer?.fullName}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex text-xs">{renderStars(review.rating)}</div>
                            </td>
                            <td className="p-4 text-gray-600 italic">"{review.comment}"</td>
                            <td className="p-4 text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td className="p-4">
                                <button 
                                    onClick={() => handleDelete(review._id)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded flex items-center gap-1"
                                    title="Xóa đánh giá vi phạm"
                                >
                                    <FaTrash /> Xóa
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

export default AdminReviews;