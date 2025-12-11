import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { FaStore, FaMapMarkerAlt, FaCheckCircle, FaPhone } from 'react-icons/fa';

const ShopProfile = () => {
  const { id } = useParams(); // ID của Seller
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Lấy thông tin Shop
        const userRes = await api.get(`/users/seller/${id}`);
        setShop(userRes.data);

        // 2. Lấy danh sách sản phẩm của Shop này
        const productsRes = await api.get(`/pets?seller=${id}`);
        setProducts(productsRes.data.pets);
      } catch (error) {
        console.error("Lỗi tải thông tin shop:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const DEFAULT_AVATAR = "/uploads/default-avatar.jpg";

  if (loading) return <div className="text-center py-20">Đang tải gian hàng...</div>;
  if (!shop) return <div className="text-center py-20">Gian hàng không tồn tại.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* SHOP HEADER INFO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Cover Image (Giả lập bằng màu gradient nếu không có ảnh bìa) */}
          <div className="h-32 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
          
          <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end -mt-12 gap-6">
              {/* Logo Shop */}
              <div className="relative">
                  <img 
                    src={shop.avatar || DEFAULT_AVATAR} 
                    alt={shop.sellerInfo?.shopName} 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                  />
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full text-xs border-2 border-white" title="Đã xác thực">
                      <FaCheckCircle />
                  </div>
              </div>

              {/* Thông tin Shop */}
              <div className="flex-1 text-center md:text-left mb-2">
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center md:justify-start gap-2">
                      {shop.sellerInfo?.shopName || shop.fullName}
                      <span className="bg-[var(--color-primary)] text-white text-xs px-2 py-0.5 rounded-full font-normal">Official Shop</span>
                  </h1>
                  
                  <div className="text-sm text-gray-500 mt-2 space-y-1">
                      <p className="flex items-center justify-center md:justify-start gap-2">
                          <FaMapMarkerAlt className="text-red-500"/> {shop.sellerInfo?.shopAddress || 'Địa chỉ đang cập nhật'}
                      </p>
                      {shop.phone && (
                          <p className="flex items-center justify-center md:justify-start gap-2">
                              <FaPhone className="text-blue-500"/> {shop.phone}
                          </p>
                      )}
                      <p className="mt-2 text-gray-600 italic">"{shop.sellerInfo?.shopDescription || 'Chào mừng đến với cửa hàng của chúng tôi!'}"</p>
                  </div>
              </div>

              {/* Stats nhỏ (Optional) */}
              <div className="flex gap-6 text-center text-sm border-l border-gray-100 pl-6 hidden md:flex">
                  <div>
                      <div className="font-bold text-gray-800 text-lg">{products.length}</div>
                      <div className="text-gray-500">Sản phẩm</div>
                  </div>
                  <div>
                      <div className="font-bold text-gray-800 text-lg">{new Date(shop.createdAt).toLocaleDateString('vi-VN')}</div>
                      <div className="text-gray-500">Tham gia</div>
                  </div>
              </div>
          </div>
      </div>

      {/* PRODUCT LIST */}
      <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaStore className="text-[var(--color-primary)]"/> Sản phẩm của Shop
          </h2>

          {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-500">
                  Shop chưa đăng bán sản phẩm nào.
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};

export default ShopProfile;