import { useEffect, useState, useContext } from 'react'; 
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaMapMarkerAlt, FaHeart, FaShoppingCart, FaShieldAlt, FaCheckCircle, FaStore, FaRuler, FaWeightHanging } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { CartContext } from '../context/CartContext'; 
import { AuthContext } from '../context/AuthContext';
import ReviewSection from '../components/ReviewSection'; 
import CustomerChat from '../components/CustomerChat'; // [MỚI] Import Chat Component

const ProductDetail = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  
  const { addToCart } = useContext(CartContext); 
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const { data } = await api.get(`/pets/${id}`);
        setPet(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin:", error);
        toast.error('Không tìm thấy sản phẩm này!');
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  if (loading) return <div className="text-center py-20">Đang tải thông tin chi tiết...</div>;
  if (!pet) return <div className="text-center py-20 text-xl">Sản phẩm không tồn tại.</div>;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleAddToCart = () => {
      addToCart(pet, 1);
  };

  const isPet = pet.breed || pet.age || (pet.gender && pet.gender !== 'Không xác định');
  const parentCategoryName = pet.category?.parentId?.name; 
  const currentCategoryName = pet.category?.name;
  const displayCategory = parentCategoryName || currentCategoryName || 'Khác';
  const isOwner = user && pet.seller && (user._id === pet.seller._id || user._id === pet.seller);

  return (
    <div className="container mx-auto px-4 py-8 relative"> 
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-[var(--color-primary)]">Trang chủ</Link> / 
        <Link to={isPet ? "/pets" : "/accessories"} className="hover:text-[var(--color-primary)] ml-1">
            {isPet ? "Thú cưng" : "Phụ kiện"}
        </Link> / 
        <span className="ml-1 text-gray-800 font-medium">{pet.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 relative group">
            <img 
              src={selectedImage || 'https://via.placeholder.com/500'} 
              alt={pet.name} 
              className="w-full h-96 object-contain bg-gray-50"
            />
            
            {pet.healthStatus === 'approved' && (
               <div className={`absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg ${isPet ? 'bg-green-500' : 'bg-blue-500'}`}>
                 {isPet ? (
                    <> <FaShieldAlt className="mr-1" /> Đã kiểm tra sức khỏe </>
                 ) : (
                    <> <FaCheckCircle className="mr-1" /> Đã kiểm định an toàn </>
                 )}
               </div>
            )}
          </div>
          
          {pet.images && pet.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
                {pet.images.map((img, index) => (
                <img 
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index}`}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 hover:border-[var(--color-primary)] transition-all ${selectedImage === img ? 'border-[var(--color-primary)]' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(img)}
                />
                ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">{pet.name}</h1>
          <div className="flex items-center text-sm text-gray-500 mb-4">
             <span className="mr-4">Mã SP: #{pet._id.slice(-6).toUpperCase()}</span>
             <span className="flex items-center"><FaMapMarkerAlt className="mr-1" /> {pet.location?.city}</span>
          </div>

          <div className="text-3xl font-bold text-[var(--color-primary)] mb-6">
            {formatPrice(pet.price)}
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Thông tin chi tiết</h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
                
                <div className="text-gray-500">Danh mục:</div>
                <div className="font-medium text-gray-900">{displayCategory}</div>

                {isPet && (
                    <>
                        <div className="text-gray-500">Giống loài:</div>
                        <div className="font-medium text-gray-900">{currentCategoryName}</div>
                        
                        <div className="text-gray-500">Tuổi:</div>
                        <div className="font-medium text-gray-900">{pet.age}</div>
                        
                        <div className="text-gray-500">Giới tính:</div>
                        <div className="font-medium text-gray-900">{pet.gender}</div>

                      
                        <div className="text-gray-500">Cân nặng:</div>
                        <div className="font-medium text-gray-900 flex items-center gap-1">{pet.weight || 'Chưa cập nhật'}</div>

                        <div className="text-gray-500">Chiều dài:</div>
                        <div className="font-medium text-gray-900 flex items-center gap-1">{pet.length || 'Chưa cập nhật'}</div>

                        <div className="text-gray-500">Màu sắc:</div>
                        <div className="font-medium text-gray-900">{pet.color}</div>
                    </>
                )}

                <div className="text-gray-500">Tồn kho:</div>
                <div className="font-medium text-gray-900">{pet.stock} sản phẩm</div>

                <div className="text-gray-500">{isPet ? 'Sức khỏe:' : 'Chất lượng:'}</div>
                <div className="font-medium text-green-600 flex items-center">
                    <FaCheckCircle className="mr-1"/> 
                    {isPet ? 'Tốt (Đã tiêm phòng)' : 'Đảm bảo an toàn'}
                </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-2">
                {isPet ? 'Mô tả thú cưng' : 'Mô tả sản phẩm'}
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {pet.description}
            </p>
          </div>

          <div className="flex gap-4 mb-8">
            <button 
                onClick={handleAddToCart}
                disabled={pet.stock === 0 || isOwner}
                className={`flex-1 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors flex items-center justify-center gap-2 
                    ${pet.stock === 0 || isOwner 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[var(--color-primary)] hover:bg-yellow-600'
                    }`}
            >
                <FaShoppingCart /> 
                {isOwner ? 'Sản phẩm của bạn' : (pet.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ')}
            </button>
            <button className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <FaHeart className="text-xl" />
            </button>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-bold text-gray-800 mb-4">Thông tin người bán</h3>
            <div className="flex items-center gap-4">
                <img 
                    src={pet.seller?.avatar || '/uploads/default-avatar.jpg'} 
                    alt="Seller Avatar" 
                    className="w-14 h-14 rounded-full border border-gray-200 object-cover"
                />
                <div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                        {pet.seller?.sellerInfo?.shopName || pet.seller?.fullName}
                        <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full flex items-center">
                            <FaStore className="mr-1" /> Shop
                        </span>
                    </div>
                    <div className="text-sm text-gray-500">Tham gia: {new Date(pet.seller?.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
                <Link to={`/shop/${pet.seller?._id}`} className="ml-auto border border-[var(--color-primary)] text-[var(--color-primary)] px-4 py-1.5 rounded-full text-sm font-medium hover:bg-yellow-50">
                    Xem gian hàng
                </Link>
            </div>
          </div>
        </div>
      </div>

      <ReviewSection productId={id} />
      
      {/* [MỚI] HIỂN THỊ NÚT CHAT VỚI NGƯỜI BÁN */}
      {/* Chỉ hiện khi người xem không phải là chủ shop */}
      {!isOwner && pet.seller && (
          <CustomerChat sellerId={pet.seller._id || pet.seller} />
      )}

    </div>
  );
};

export default ProductDetail;