// frontend/src/pages/Blog.jsx (Cập nhật toàn bộ)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaCalendarAlt, FaUser, FaArrowRight } from 'react-icons/fa';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await api.get('/blogs');
        setPosts(data);
      } catch (error) {
        console.error("Lỗi tải bài viết", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Kinh nghiệm chăm sóc thú cưng</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Nơi chia sẻ kiến thức, bí quyết nuôi dạy và chăm sóc những người bạn nhỏ.
        </p>
      </div>

      {loading ? <div className="text-center">Đang tải bài viết...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
              <Link to={`/blog/${post.slug}`} className="block h-48 overflow-hidden">
                  <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
              </Link>
              
              <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center text-xs text-gray-500 mb-3 gap-4">
                      <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="flex items-center gap-1"><FaUser /> {post.author}</span>
                  </div>
                  
                  <Link to={`/blog/${post.slug}`} className="block mb-3">
                      <h3 className="text-xl font-bold text-gray-800 hover:text-[var(--color-primary)] line-clamp-2">
                          {post.title}
                      </h3>
                  </Link>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {post.excerpt}
                  </p>
                  
                  <Link 
                      to={`/blog/${post.slug}`} 
                      className="inline-flex items-center text-[var(--color-primary)] font-semibold hover:underline mt-auto"
                  >
                      Đọc tiếp <FaArrowRight className="ml-2 text-xs" />
                  </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && posts.length === 0 && <div className="text-center text-gray-500">Chưa có bài viết nào.</div>}
    </div>
  );
};

export default Blog;