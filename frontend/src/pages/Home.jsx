import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { FaDog, FaCat, FaPaw, FaShieldAlt, FaTruck, FaHeadset, FaBoxOpen } from 'react-icons/fa';

const Home = () => {
  const [latestPets, setLatestPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE LƯU ID CÁC DANH MỤC NỔI BẬT (MỚI) ---
  const [featuredIds, setFeaturedIds] = useState({
      dog: '',
      cat: '',
      other: ''
  });

  // --- LOGIC SLIDESHOW ẢNH HERO ---
  const heroImages = [
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1049&q=80", // Chó
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80", // Mèo
    "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?ixlib=rb-1.2.1&auto=format&fit=crop&w=1049&q=80", // Chim
    "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80", // Hamster
    "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1049&q=80", // Nhím
    "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"  // Rùa
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  const nextImage = () => {
    setIsRotating(true);
    setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        setIsRotating(false); 
    }, 500); 
  };

  useEffect(() => {
    const interval = setInterval(() => {
        nextImage();
    }, 3000); 
    return () => clearInterval(interval); 
  }, []); 

  // --------------------------

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const { data: categories } = await api.get('/categories');
        const petsRoot = categories.find(c => c.slug === 'thu-cung');

        // --- LẤY ID CHO DANH MỤC NỔI BẬT (MỚI) ---
        const dogCat = categories.find(c => c.slug === 'cho-canh');
        const catCat = categories.find(c => c.slug === 'meo-canh');
        const otherCat = categories.find(c => c.slug === 'thu-khac'); // Slug trong seeder là 'thu-khac'

        setFeaturedIds({
            dog: dogCat?._id || '',
            cat: catCat?._id || '',
            other: otherCat?._id || ''
        });
        // -----------------------------------------

        if (petsRoot) {
            const { data } = await api.get(`/pets?pageNumber=1&category=${petsRoot._id}`);
            setLatestPets(data.pets);
        } else {
            const { data } = await api.get('/pets?pageNumber=1');
            setLatestPets(data.pets);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="pb-10">
      {/* 1. HERO SECTION */}
      <section className="bg-yellow-50 relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 z-10 text-center md:text-left">
                <span className="text-[var(--color-primary)] font-bold tracking-wider uppercase mb-2 block">Chào mừng đến với Fluffy</span>
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-6 leading-tight">
                    Tìm người bạn nhỏ <br/>
                    <span className="text-[var(--color-primary)]">cho cuộc sống vui hơn</span>
                </h1>
                <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto md:mx-0">
                    Hàng ngàn thú cưng đáng yêu đã được kiểm tra sức khỏe và sẵn sàng về nhà mới. Khám phá ngay!
                </p>
                <div className="flex gap-4 justify-center md:justify-start">
                    <Link to="/pets" className="px-8 py-3 bg-[var(--color-primary)] text-white font-bold rounded-full shadow-lg hover:bg-yellow-600 transition-transform transform hover:-translate-y-1">
                        Xem Thú Cưng
                    </Link>
                    <Link to="/seller-register" className="px-8 py-3 bg-white text-gray-800 font-bold rounded-full shadow-md border border-gray-200 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">
                        Đăng Bán
                    </Link>
                </div>
            </div>
            
            <div className="md:w-1/2 mt-10 md:mt-0 relative flex justify-center perspective-1000">
                <div className="absolute top-0 right-0 bg-yellow-200 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -left-4 bg-purple-200 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                
                <div className="relative z-10 w-full h-64 md:h-96 cursor-pointer" onClick={nextImage}>
                    <img 
                        src={heroImages[currentIndex]} 
                        alt="Happy Pet" 
                        style={{
                            transform: isRotating ? 'rotateY(90deg) scale(0.8)' : 'rotateY(0deg) scale(1)',
                            opacity: isRotating ? 0.5 : 1,
                            transition: 'all 0.5s ease-in-out',
                            backfaceVisibility: 'hidden'
                        }}
                        className="w-full h-full object-cover rounded-2xl shadow-2xl"
                        title="Click để đổi thú cưng ngay!"
                    />
                </div>
            </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">Danh mục nổi bật</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                
                {/* --- SỬA CÁC LINK DƯỚI ĐÂY DÙNG ID ĐỘNG --- */}
                
                <Link to={featuredIds.dog ? `/pets?category=${featuredIds.dog}` : '/pets'} className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-yellow-50 hover:shadow-md transition-all group">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:bg-[var(--color-primary)] transition-colors">
                        <FaDog className="text-3xl text-[var(--color-primary)] group-hover:text-white" />
                    </div>
                    <span className="font-semibold text-gray-700">Chó Cảnh</span>
                </Link>

                <Link to={featuredIds.cat ? `/pets?category=${featuredIds.cat}` : '/pets'} className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-yellow-50 hover:shadow-md transition-all group">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:bg-[var(--color-primary)] transition-colors">
                        <FaCat className="text-3xl text-[var(--color-primary)] group-hover:text-white" />
                    </div>
                    <span className="font-semibold text-gray-700">Mèo Cảnh</span>
                </Link>

                <Link to={featuredIds.other ? `/pets?category=${featuredIds.other}` : '/pets'} className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-yellow-50 hover:shadow-md transition-all group">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:bg-[var(--color-primary)] transition-colors">
                        <FaPaw className="text-3xl text-[var(--color-primary)] group-hover:text-white" />
                    </div>
                    <span className="font-semibold text-gray-700">Thú Khác</span>
                </Link>

                <Link to="/accessories" className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-yellow-50 hover:shadow-md transition-all group">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:bg-[var(--color-primary)] transition-colors">
                        <FaBoxOpen className="text-3xl text-[var(--color-primary)] group-hover:text-white" />
                    </div>
                    <span className="font-semibold text-gray-700">Phụ Kiện</span>
                </Link>
            </div>
        </div>
      </section>

      {/* 3. LATEST PETS SECTION */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Thú cưng mới về</h2>
                    <p className="text-gray-500 mt-2">Những người bạn nhỏ vừa gia nhập đại gia đình Fluffy</p>
                </div>
                <Link to="/pets" className="hidden md:block text-[var(--color-primary)] font-semibold hover:underline">
                    Xem tất cả &rarr;
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Đang tải danh sách...</div>
            ) : latestPets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {latestPets.map((pet) => (
                        <ProductCard key={pet._id} product={pet} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                    <p className="text-gray-500 text-lg">Chưa có thú cưng nào được đăng bán.</p>
                </div>
            )}
            
            <div className="mt-8 text-center md:hidden">
                 <Link to="/pets" className="text-[var(--color-primary)] font-semibold hover:underline">
                    Xem tất cả &rarr;
                </Link>
            </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn Fluffy?</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        <FaShieldAlt />
                    </div>
                    <h3 className="text-xl font-bold mb-2">An toàn tuyệt đối</h3>
                    <p className="text-gray-500">Mọi thú cưng đều được kiểm tra sức khỏe và xác minh giấy tờ trước khi đăng bán.</p>
                </div>
                <div className="text-center p-6">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        <FaTruck />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Vận chuyển an toàn</h3>
                    <p className="text-gray-500">Hỗ trợ kết nối với các đơn vị vận chuyển thú cưng chuyên nghiệp toàn quốc.</p>
                </div>
                <div className="text-center p-6">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        <FaHeadset />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Hỗ trợ 24/7</h3>
                    <p className="text-gray-500">Đội ngũ CSKH luôn sẵn sàng giải đáp mọi thắc mắc của bạn về chăm sóc thú cưng.</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;