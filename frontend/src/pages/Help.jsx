
import { useState } from 'react';
import { FaSearch, FaChevronDown, FaChevronUp, FaPhoneAlt, FaEnvelope, FaBoxOpen, FaShippingFast, FaUndo, FaUserShield } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Help = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [openQuestion, setOpenQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Dữ liệu câu hỏi mẫu
  const faqs = [
    {
      id: 1,
      category: 'general',
      question: 'Làm thế nào để tạo tài khoản tại Fluffy?',
      answer: 'Bạn có thể nhấn vào nút "Đăng ký" ở góc trên bên phải màn hình. Điền đầy đủ thông tin Họ tên, Email, và Mật khẩu để tạo tài khoản thành viên.'
    },
    {
      id: 2,
      category: 'general',
      question: 'Tôi quên mật khẩu thì phải làm sao?',
      answer: 'Tại màn hình Đăng nhập, hãy chọn "Quên mật khẩu". Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu qua email bạn đã đăng ký.'
    },
    {
      id: 3,
      category: 'order',
      question: 'Làm sao để kiểm tra tình trạng đơn hàng?',
      answer: 'Bạn hãy đăng nhập, vào mục "Hồ sơ cá nhân" -> "Đơn mua". Tại đó bạn sẽ thấy danh sách đơn hàng và trạng thái hiện tại (Đang xử lý, Đang giao, v.v.).'
    },
    {
      id: 4,
      category: 'order',
      question: 'Tôi có thể hủy đơn hàng đã đặt không?',
      answer: 'Bạn chỉ có thể hủy đơn hàng khi trạng thái là "Chờ xác nhận" (Pending). Nếu đơn hàng đã chuyển sang "Đang giao", vui lòng liên hệ hotline để được hỗ trợ.'
    },
    {
      id: 5,
      category: 'shipping',
      question: 'Phí vận chuyển được tính như thế nào?',
      answer: 'Phí vận chuyển phụ thuộc vào khoảng cách địa lý và khối lượng đơn hàng. Phí chính xác sẽ được hiển thị tại bước Thanh toán trước khi bạn xác nhận đặt hàng.'
    },
    {
      id: 6,
      category: 'shipping',
      question: 'Thời gian giao hàng là bao lâu?',
      answer: 'Thông thường từ 2-4 ngày làm việc đối với nội thành và 3-7 ngày đối với ngoại thành/tỉnh xa.'
    },
    {
      id: 7,
      category: 'return',
      question: 'Chính sách đổi trả sản phẩm?',
      answer: 'Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất hoặc hư hỏng do vận chuyển. Vui lòng quay video khi mở hàng để làm bằng chứng.'
    }
  ];

  // Lọc câu hỏi theo Tab và Từ khóa tìm kiếm
  const filteredFaqs = faqs.filter(faq => {
    const matchesTab = activeTab === 'all' || faq.category === activeTab;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleQuestion = (id) => {
    setOpenQuestion(openQuestion === id ? null : id);
  };

  const categories = [
    { id: 'general', label: 'Chung', icon: <FaUserShield /> },
    { id: 'order', label: 'Đơn hàng', icon: <FaBoxOpen /> },
    { id: 'shipping', label: 'Vận chuyển', icon: <FaShippingFast /> },
    { id: 'return', label: 'Đổi trả', icon: <FaUndo /> },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* 1. HERO BANNER & SEARCH */}
      <div className="bg-[var(--color-primary)] py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Xin chào, chúng tôi có thể giúp gì cho bạn?</h1>
        <div className="max-w-2xl mx-auto relative">
          <input 
            type="text" 
            placeholder="Tìm kiếm câu hỏi (ví dụ: hủy đơn, ship...)" 
            className="w-full py-4 pl-12 pr-4 rounded-full shadow-lg outline-none text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-10 max-w-5xl mx-auto">
          
          {/* 2. CATEGORY TABS */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 border-b pb-6">
            {categories.map(cat => (
               <button 
                  key={cat.id}
                  onClick={() => { setActiveTab(cat.id); setSearchTerm(''); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                    activeTab === cat.id 
                    ? 'bg-yellow-100 text-[var(--color-primary)] border border-[var(--color-primary)]' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
               >
                 {cat.icon} {cat.label}
               </button>
            ))}
          </div>

          {/* 3. FAQ LIST (Accordion) */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-yellow-400">
                  <button 
                    className="w-full flex justify-between items-center p-5 text-left bg-white hover:bg-gray-50 focus:outline-none"
                    onClick={() => toggleQuestion(faq.id)}
                  >
                    <span className="font-bold text-gray-800 text-lg">{faq.question}</span>
                    {openQuestion === faq.id ? <FaChevronUp className="text-[var(--color-primary)]"/> : <FaChevronDown className="text-gray-400"/>}
                  </button>
                  
                  <div 
                    className={`bg-gray-50 px-5 text-gray-600 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${
                      openQuestion === faq.id ? 'max-h-96 py-5 opacity-100 border-t' : 'max-h-0 py-0 opacity-0'
                    }`}
                  >
                    {faq.answer}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                Không tìm thấy câu hỏi nào phù hợp với từ khóa "{searchTerm}".
              </div>
            )}
          </div>

        </div>

        {/* 4. CONTACT SUPPORT */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Vẫn chưa tìm thấy câu trả lời?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4">
                        <FaPhoneAlt />
                    </div>
                    <h4 className="font-bold text-xl mb-2">Gọi hotline</h4>
                    <p className="text-gray-500 mb-4">Hỗ trợ 24/7 cho các vấn đề khẩn cấp</p>
                    <a href="tel:0901234567" className="text-blue-600 font-bold text-lg hover:underline">090 123 4567</a>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl mb-4">
                        <FaEnvelope />
                    </div>
                    <h4 className="font-bold text-xl mb-2">Gửi email hỗ trợ</h4>
                    <p className="text-gray-500 mb-4">Chúng tôi sẽ phản hồi trong vòng 24h</p>
                    <a href="mailto:support@fluffy.com" className="text-orange-600 font-bold text-lg hover:underline">support@fluffy.com</a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Help;