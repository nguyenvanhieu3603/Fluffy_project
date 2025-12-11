import { useState, useEffect, useContext } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaUserCircle, FaCheckCircle, FaPen } from 'react-icons/fa';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ReviewSection = ({ productId }) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Fetch Reviews
  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/${productId}`);
      setReviews(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Submit Review
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/${productId}`, { rating, comment });
      toast.success('Đánh giá thành công!');
      setComment('');
      setRating(5);
      setShowForm(false);
      fetchReviews(); // Reload lại list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi gửi đánh giá');
    }
  };

  // Tính toán thống kê
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews).toFixed(1) 
    : 0;

  // Helper render sao
  const renderStars = (value) => {
    return (
      <div className="flex text-yellow-400 text-sm">
        {[1, 2, 3, 4, 5].map((index) => (
          <span key={index}>
             {value >= index ? <FaStar /> : value >= index - 0.5 ? <FaStarHalfAlt /> : <FaRegStar />}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-8" id="reviews">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Đánh giá khách hàng</h2>

      {/* 1. KHU VỰC TỔNG QUAN (SUMMARY) */}
      <div className="flex flex-col md:flex-row gap-8 mb-10 border-b border-gray-100 pb-10">
          <div className="text-center md:w-1/4 flex flex-col justify-center items-center border-r border-gray-100 pr-8">
              <div className="text-5xl font-bold text-gray-800 mb-2">{averageRating}</div>
              <div className="flex text-yellow-400 text-xl mb-2">
                  {[...Array(5)].map((_, i) => (
                      <span key={i}>{i + 1 <= Math.round(averageRating) ? <FaStar /> : <FaRegStar />}</span>
                  ))}
              </div>
              <p className="text-gray-500 text-sm">({totalReviews} nhận xét)</p>
          </div>

          <div className="flex-1">
              <div className="flex flex-col justify-center h-full space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter(r => r.rating === star).length;
                      const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                          <div key={star} className="flex items-center gap-3 text-sm">
                              <span className="w-12 font-bold text-gray-600 flex items-center gap-1">{star} <FaStar className="text-yellow-400 text-xs"/></span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }}></div>
                              </div>
                              <span className="w-8 text-gray-400 text-right">{count}</span>
                          </div>
                      );
                  })}
              </div>
          </div>

          <div className="md:w-1/4 flex flex-col justify-center items-center pl-4">
              <p className="text-gray-600 mb-3 text-center text-sm">Bạn đã dùng sản phẩm này?</p>
              {user ? (
                  <button 
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-full shadow-md hover:bg-yellow-600 transition-colors flex items-center gap-2"
                  >
                      <FaPen /> Viết đánh giá
                  </button>
              ) : (
                  <Link to={`/login?redirect=/product/${productId}`} className="px-6 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] font-bold rounded-full hover:bg-yellow-50 transition-colors">
                      Đăng nhập để viết
                  </Link>
              )}
          </div>
      </div>

      {/* 2. FORM VIẾT ĐÁNH GIÁ */}
      {showForm && (
          <form onSubmit={submitHandler} className="bg-gray-50 p-6 rounded-xl mb-10 border border-gray-200 animate-fade-in">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Gửi nhận xét của bạn</h3>
              
              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá sao</label>
                  <div className="flex gap-2 text-2xl text-gray-300 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                          <span 
                            key={star} 
                            onClick={() => setRating(star)}
                            className={`transition-colors hover:text-yellow-400 ${star <= rating ? 'text-yellow-400' : ''}`}
                          >
                              <FaStar />
                          </span>
                      ))}
                  </div>
              </div>

              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung nhận xét</label>
                  <textarea 
                    rows="4" 
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                  ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Hủy</button>
                  <button type="submit" className="px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-yellow-600 shadow-sm">Gửi đánh giá</button>
              </div>
          </form>
      )}

      {/* 3. DANH SÁCH ĐÁNH GIÁ */}
      <div className="space-y-6">
          {reviews.length === 0 ? (
              <p className="text-center text-gray-500 italic py-8">Chưa có đánh giá nào. Hãy là người đầu tiên nhận xét!</p>
          ) : (
              reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                          <img 
                            src={review.customer?.avatar || 'https://via.placeholder.com/150'} 
                            alt={review.customer?.fullName} 
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                          <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                      {review.customer?.fullName}
                                      {review.isVerified && (
                                          <span className="text-green-600 text-xs font-normal flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                                              <FaCheckCircle /> Đã mua hàng
                                          </span>
                                      )}
                                  </h4>
                                  <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                              </div>
                              
                              {/* PHẦN ĐÃ SỬA: Sao và số cùng 1 dòng */}
                              <div className="mb-2 flex items-center gap-2">
                                  {renderStars(review.rating)}
                                  {/* Nếu muốn hiện số sao bằng chữ bên cạnh, uncomment dòng dưới */}
                                  {/* <span className="text-sm font-semibold text-gray-700">{review.rating}.0</span> */}
                              </div>
                              
                              <p className="text-gray-600 text-sm leading-relaxed">
                                  {review.comment}
                              </p>
                          </div>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};

export default ReviewSection;