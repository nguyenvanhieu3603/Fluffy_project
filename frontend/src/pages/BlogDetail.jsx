
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaCalendarAlt, FaUser, FaArrowLeft, FaFacebook, FaTwitter, FaLink, FaEye } from 'react-icons/fa';

const BlogDetail = () => {
  const { id } = useParams(); 
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Lấy chi tiết bài viết
            const { data: blogData } = await api.get(`/blogs/${id}`);
            setPost(blogData);

            // 2. Lấy bài viết khác (cho sidebar)
            const { data: allBlogs } = await api.get(`/blogs`);
            setRecentPosts(allBlogs.filter(b => b._id !== blogData._id).slice(0, 3));
        } catch (error) {
            console.error("Lỗi tải bài viết", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="text-center py-20">Đang tải nội dung...</div>;
  if (!post) return <div className="text-center py-20 text-gray-500">Bài viết không tồn tại.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/blog" className="inline-flex items-center text-gray-500 hover:text-[var(--color-primary)] mb-6">
          <FaArrowLeft className="mr-2" /> Quay lại danh sách
      </Link>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Bài viết */}
          <div className="relative h-64 md:h-96">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <div className="p-6 md:p-10 text-white w-full">
                      <div className="flex items-center gap-4 text-sm mb-2 opacity-90">
                          <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                          <span className="flex items-center gap-1"><FaUser /> {post.author}</span>
                          <span className="flex items-center gap-1"><FaEye /> {post.views} lượt xem</span>
                      </div>
                      <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-2">{post.title}</h1>
                      <p className="text-gray-300 italic text-sm md:text-base line-clamp-2">{post.excerpt}</p>
                  </div>
              </div>
          </div>

          <div className="p-6 md:p-10 flex flex-col md:flex-row gap-10">
              {/* Nội dung chính */}
              <div className="md:w-3/4">
                  <div 
                    className="prose max-w-none text-gray-800 leading-relaxed text-justify blog-content"
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                  />
              </div>

              {/* Sidebar */}
              <div className="md:w-1/4 space-y-8">
                  <div>
                      <h4 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-wide border-b pb-2">Chia sẻ bài viết</h4>
                      <div className="flex gap-3">
                          <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90"><FaFacebook /></button>
                          <button className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:opacity-90"><FaTwitter /></button>
                          <button className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300"><FaLink /></button>
                      </div>
                  </div>

                  <div>
                      <h4 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-wide border-b pb-2">Bài viết khác</h4>
                      <div className="space-y-4">
                          {recentPosts.map(other => (
                              <Link key={other._id} to={`/blog/${other.slug}`} className="block group">
                                  <div className="h-24 overflow-hidden rounded-lg mb-2">
                                      <img src={other.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                                  </div>
                                  <h5 className="text-sm font-bold text-gray-700 group-hover:text-[var(--color-primary)] transition-colors mb-1 line-clamp-2">
                                      {other.title}
                                  </h5>
                                  <span className="text-xs text-gray-400">{new Date(other.createdAt).toLocaleDateString('vi-VN')}</span>
                              </Link>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default BlogDetail;