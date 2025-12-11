import { useParams, Link } from 'react-router-dom';
import { blogPosts } from './Blog'; // Import dữ liệu từ file Blog
import { FaCalendarAlt, FaUser, FaArrowLeft, FaFacebook, FaTwitter, FaLink } from 'react-icons/fa';

const BlogDetail = () => {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === parseInt(id));

  if (!post) {
    return <div className="text-center py-20 text-gray-500">Bài viết không tồn tại.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/blog" className="inline-flex items-center text-gray-500 hover:text-[var(--color-primary)] mb-6">
          <FaArrowLeft className="mr-2" /> Quay lại danh sách
      </Link>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Bài viết */}
          <div className="relative h-64 md:h-80">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                  <div className="p-6 md:p-10 text-white w-full">
                      <div className="flex items-center gap-4 text-sm mb-2 opacity-90">
                          <span className="flex items-center gap-1"><FaCalendarAlt /> {post.date}</span>
                          <span className="flex items-center gap-1"><FaUser /> {post.author}</span>
                      </div>
                      <h1 className="text-2xl md:text-4xl font-bold leading-tight">{post.title}</h1>
                  </div>
              </div>
          </div>

          <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8">
              {/* Nội dung chính */}
              <div className="md:w-3/4">
                  <div 
                    className="prose max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                  />
                  {post.content === "Nội dung đang cập nhật..." && (
                      <p className="italic text-gray-400 mt-4">Nội dung chi tiết của bài viết này đang được biên tập viên cập nhật. Vui lòng quay lại sau.</p>
                  )}
              </div>

              {/* Sidebar (Chia sẻ & Bài khác) */}
              <div className="md:w-1/4 space-y-8">
                  <div>
                      <h4 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-wide">Chia sẻ bài viết</h4>
                      <div className="flex gap-3">
                          <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90"><FaFacebook /></button>
                          <button className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:opacity-90"><FaTwitter /></button>
                          <button className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300"><FaLink /></button>
                      </div>
                  </div>

                  <div>
                      <h4 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-wide">Bài viết khác</h4>
                      <div className="space-y-4">
                          {blogPosts.filter(p => p.id !== post.id).slice(0, 3).map(other => (
                              <Link key={other.id} to={`/blog/${other.id}`} className="block group">
                                  <h5 className="text-sm font-medium text-gray-700 group-hover:text-[var(--color-primary)] transition-colors mb-1">
                                      {other.title}
                                  </h5>
                                  <span className="text-xs text-gray-400">{other.date}</span>
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