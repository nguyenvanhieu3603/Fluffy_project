import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPlus } from 'react-icons/fa';

const AccessoryCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
      {/* Phần Ảnh - Không có badge sức khỏe */}
      <Link to={`/product/${product._id}`} className="relative h-48 sm:h-60 overflow-hidden block bg-gray-100">
        <img 
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300'} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Phần Thông tin */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs text-gray-500 mb-1">{product.category?.name || 'Phụ kiện'}</span>
        
        <Link to={`/product/${product._id}`}>
            <h3 className="font-bold text-gray-800 text-lg mb-1 hover:text-[var(--color-primary)] line-clamp-2" title={product.name}>
            {product.name}
            </h3>
        </Link>
        
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <FaMapMarkerAlt className="mr-1 text-gray-400" />
          <span className="truncate">
            {product.location?.district ? `${product.location.district}, ` : ''} 
            {product.location?.city || 'Toàn quốc'}
          </span>
        </div>

        <div className="mt-auto flex justify-between items-center">
          <span className="text-[var(--color-primary)] font-bold text-lg">
            {formatPrice(product.price)}
          </span>
          <Link 
            to={`/product/${product._id}`}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
          >
            <FaPlus />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessoryCard;