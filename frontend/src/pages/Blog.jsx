import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaArrowRight } from 'react-icons/fa';

// Dữ liệu mẫu cho Blog
export const blogPosts = [
  {
    id: 1,
    title: "Hướng dẫn chăm sóc chó Corgi cho người mới bắt đầu",
    slug: "huong-dan-cham-soc-corgi",
    image: "https://images.unsplash.com/photo-1597633425046-08f5110420b5?q=80&w=1000&auto=format&fit=crop",
    author: "Bs. Thú y Minh Anh",
    date: "06/12/2025",
    excerpt: "Corgi là giống chó chân ngắn đáng yêu nhưng cũng cần chế độ chăm sóc đặc biệt để tránh các bệnh về xương khớp và béo phì...",
    content: `
      <p>Corgi là giống chó chân ngắn đáng yêu nhưng cũng cần chế độ chăm sóc đặc biệt để tránh các bệnh về xương khớp và béo phì.</p>
      <h3>1. Chế độ dinh dưỡng</h3>
      <p>Corgi rất ham ăn nên dễ bị béo phì. Bạn cần kiểm soát lượng thức ăn hàng ngày, hạn chế tinh bột và chất béo. Nên cho ăn các loại hạt chuyên dụng hoặc thức ăn tươi như ức gà, bò, rau củ.</p>
      <h3>2. Vận động</h3>
      <p>Dù chân ngắn nhưng Corgi rất năng động. Hãy dắt chúng đi dạo 20-30 phút mỗi ngày. Tuy nhiên, hạn chế cho Corgi leo cầu thang quá nhiều hoặc nhảy từ trên cao xuống để bảo vệ cột sống.</p>
      <h3>3. Chăm sóc lông</h3>
      <p>Corgi rụng lông khá nhiều, đặc biệt là vào mùa thay lông. Bạn nên chải lông cho bé 2-3 lần/tuần để loại bỏ lông chết và kích thích mọc lông mới.</p>
    `
  },
  {
    id: 2,
    title: "Lịch tiêm phòng và tẩy giun định kỳ cho Mèo",
    slug: "lich-tiem-phong-meo",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    author: "Admin Fluffy",
    date: "05/12/2025",
    excerpt: "Để mèo cưng luôn khỏe mạnh, việc tuân thủ lịch tiêm phòng và tẩy giun là vô cùng quan trọng. Cùng tìm hiểu chi tiết nhé...",
    content: `
      <p>Để mèo cưng luôn khỏe mạnh, việc tuân thủ lịch tiêm phòng và tẩy giun là vô cùng quan trọng.</p>
      <h3>1. Lịch tiêm phòng</h3>
      <ul>
        <li><strong>6-8 tuần tuổi:</strong> Mũi 1 (3 bệnh: Giảm bạch cầu, Viêm mũi khí quản, Calicivirus).</li>
        <li><strong>9-11 tuần tuổi:</strong> Mũi 2 (Nhắc lại 3 bệnh trên).</li>
        <li><strong>12-14 tuần tuổi:</strong> Mũi 3 + Dại.</li>
        <li><strong>Hàng năm:</strong> Tiêm nhắc lại 1 lần.</li>
      </ul>
      <h3>2. Lịch tẩy giun</h3>
      <p>Tẩy giun định kỳ mỗi tháng 1 lần cho đến khi mèo được 6 tháng tuổi. Sau đó cứ 3-6 tháng tẩy lại một lần tùy vào môi trường sống (trong nhà hay hay đi chơi).</p>
    `
  },
  {
    id: 3,
    title: "Top 5 loại thức ăn hạt tốt nhất cho Poodle",
    slug: "thuc-an-hat-cho-poodle",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    author: "Reviewer Pet",
    date: "01/12/2025",
    excerpt: "Poodle là giống chó kén ăn. Bài viết này sẽ review 5 loại hạt được đánh giá cao nhất hiện nay giúp lông mượt, giảm vệt ố mắt...",
    content: "Nội dung đang cập nhật..."
  },
  {
    id: 4,
    title: "Dấu hiệu nhận biết thú cưng bị Stress",
    slug: "dau-hieu-thu-cung-stress",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    author: "Bs. Thú y Minh Anh",
    date: "28/11/2025",
    excerpt: "Thú cưng cũng có thể bị trầm cảm hoặc stress. Hãy quan sát các biểu hiện như biếng ăn, trốn vào góc tối, hay kêu la bất thường...",
    content: "Nội dung đang cập nhật..."
  }
];

const Blog = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Kinh nghiệm chăm sóc thú cưng</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Nơi chia sẻ kiến thức, bí quyết nuôi dạy và chăm sóc những người bạn nhỏ. 
          Kiến thức được tham vấn bởi các bác sĩ thú y uy tín.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
            <Link to={`/blog/${post.id}`} className="block h-48 overflow-hidden">
                <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
            </Link>
            
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center text-xs text-gray-500 mb-3 gap-4">
                    <span className="flex items-center gap-1"><FaCalendarAlt /> {post.date}</span>
                    <span className="flex items-center gap-1"><FaUser /> {post.author}</span>
                </div>
                
                <Link to={`/blog/${post.id}`} className="block mb-3">
                    <h3 className="text-xl font-bold text-gray-800 hover:text-[var(--color-primary)] line-clamp-2">
                        {post.title}
                    </h3>
                </Link>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {post.excerpt}
                </p>
                
                <Link 
                    to={`/blog/${post.id}`} 
                    className="inline-flex items-center text-[var(--color-primary)] font-semibold hover:underline mt-auto"
                >
                    Đọc tiếp <FaArrowRight className="ml-2 text-xs" />
                </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;