import { FaFacebook, FaInstagram, FaTiktok, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Cột 1: Giới thiệu */}
        <div>
          <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-4">Fluffy.vn</h3>
          <p className="text-sm leading-relaxed mb-4">
            Nền tảng thương mại điện tử uy tín dành riêng cho thú cưng. 
            Chúng tôi cam kết mang đến những người bạn nhỏ khỏe mạnh và phụ kiện chất lượng nhất.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[var(--color-primary)] text-xl"><FaFacebook /></a>
            <a href="#" className="hover:text-[var(--color-primary)] text-xl"><FaInstagram /></a>
            <a href="#" className="hover:text-[var(--color-primary)] text-xl"><FaTiktok /></a>
          </div>
        </div>

        {/* Cột 2: Liên kết nhanh */}
        <div>
          <h4 className="text-white font-bold text-lg mb-4">Liên kết nhanh</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-[var(--color-primary)]">Về chúng tôi</a></li>
            <li><a href="#" className="hover:text-[var(--color-primary)]">Quy định & Chính sách</a></li>
            <li><a href="#" className="hover:text-[var(--color-primary)]">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-[var(--color-primary)]">Điều khoản sử dụng</a></li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ khách hàng */}
        <div>
          <h4 className="text-white font-bold text-lg mb-4">Hỗ trợ</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-[var(--color-primary)]">Hướng dẫn mua hàng</a></li>
            <li><a href="#" className="hover:text-[var(--color-primary)]">Chính sách đổi trả</a></li>
            <li><a href="#" className="hover:text-[var(--color-primary)]">Giao hàng & Thanh toán</a></li>
            <li><a href="#" className="hover:text-[var(--color-primary)]">Liên hệ CSKH</a></li>
          </ul>
        </div>

        {/* Cột 4: Thông tin liên hệ */}
        <div>
          <h4 className="text-white font-bold text-lg mb-4">Liên hệ</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="mt-1 text-[var(--color-primary)]" />
              <span>Tầng 5, Tòa nhà Fluffy Tower, Hà Đông, Hà Nội</span>
            </li>
            <li className="flex items-center gap-3">
              <FaPhone className="text-[var(--color-primary)]" />
              <span>1900 1234</span>
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-[var(--color-primary)]" />
              <span>hotro@fluffy.vn</span>
            </li>
          </ul>
        </div>

      </div>
      <div className="text-center text-xs text-gray-500 mt-12 pt-8 border-t border-gray-700">
        &copy; {new Date().getFullYear()} Fluffy.vn. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;