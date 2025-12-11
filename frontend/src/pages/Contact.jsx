import { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Vì chưa có API contact, ta chỉ giả lập gửi thành công
    console.log("Contact Data:", formData);
    toast.success("Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Liên hệ với Fluffy</h1>
        <p className="text-gray-600">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ */}
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-full">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Thông tin liên lạc</h3>
                
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-yellow-50 text-[var(--color-primary)] rounded-full flex items-center justify-center text-xl flex-shrink-0">
                            <FaMapMarkerAlt />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-700">Địa chỉ</h4>
                            <p className="text-gray-600 mt-1">Tầng 5, Tòa nhà Fluffy Tower, Hà Đông, Hà Nội</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                            <FaPhone />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-700">Hotline</h4>
                            <p className="text-gray-600 mt-1">1900 1234 (8:00 - 22:00)</p>
                            <p className="text-gray-600">0909 123 456 (Zalo)</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                            <FaEnvelope />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-700">Email</h4>
                            <p className="text-gray-600 mt-1">hotro@fluffy.vn</p>
                            <p className="text-gray-600">contact@fluffy.vn</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                            <FaClock />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-700">Giờ làm việc</h4>
                            <p className="text-gray-600 mt-1">Thứ 2 - Chủ Nhật</p>
                            <p className="text-gray-600">8:00 sáng - 10:00 tối</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* CỘT PHẢI: FORM GỬI TIN NHẮN */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Gửi thắc mắc cho chúng tôi</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                        <input 
                            type="text" 
                            name="name" 
                            required 
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)]"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            required 
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)]"
                            placeholder="email@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                    <input 
                        type="text" 
                        name="subject" 
                        required 
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)]"
                        placeholder="Vấn đề cần hỗ trợ..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                    <textarea 
                        name="message" 
                        rows="5" 
                        required 
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)]"
                        placeholder="Nhập nội dung tin nhắn..."
                    ></textarea>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
                >
                    Gửi tin nhắn
                </button>
            </form>
        </div>
      </div>

      {/* MAP (Optional - Ảnh minh họa bản đồ) */}
      <div className="mt-12 rounded-xl overflow-hidden shadow-sm border border-gray-100 h-80 relative bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500 font-medium">[Khu vực hiển thị Bản đồ Google Map]</p>
          {/* Bạn có thể nhúng iframe Google Map thật vào đây */}
      </div>
    </div>
  );
};

export default Contact;