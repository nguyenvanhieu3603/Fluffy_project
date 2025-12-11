import { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaBoxOpen, FaEye, FaTimes } from 'react-icons/fa';

const AdminAccessories = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        const { data } = await api.get('/admin/accessories');
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccessories();
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tất cả Phụ kiện</h2>
      
      {loading ? <div>Đang tải...</div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                    <tr>
                        <th className="p-4">Ảnh</th>
                        <th className="p-4">Tên phụ kiện</th>
                        <th className="p-4">Shop bán</th>
                        <th className="p-4">Giá</th>
                        <th className="p-4">Tồn kho</th>
                        <th className="p-4">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {products.map(p => (
                        <tr key={p._id} className="hover:bg-gray-50">
                            <td className="p-4">
                                <img src={p.images[0]} className="w-12 h-12 rounded object-cover border"/>
                            </td>
                            <td className="p-4 font-medium text-gray-800 max-w-xs truncate">{p.name}</td>
                            <td className="p-4 text-blue-600 font-medium">{p.seller?.sellerInfo?.shopName || '---'}</td>
                            <td className="p-4 font-bold text-[var(--color-primary)]">{formatPrice(p.price)}</td>
                            <td className="p-4">{p.stock}</td>
                            <td className="p-4">
                                <button onClick={() => setSelectedProduct(p)} className="text-gray-500 hover:text-[var(--color-primary)] p-2">
                                    <FaEye />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {products.length === 0 && <div className="p-8 text-center text-gray-500">Chưa có phụ kiện nào.</div>}
        </div>
      )}

      {/* MODAL CHI TIẾT */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 relative flex gap-6">
                 <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><FaTimes className="text-xl"/></button>
                 <div className="w-1/3">
                     <img src={selectedProduct.images[0]} className="w-full h-40 object-cover rounded-lg border"/>
                 </div>
                 <div className="w-2/3 space-y-2">
                     <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
                     <p className="text-[var(--color-primary)] font-bold text-xl">{formatPrice(selectedProduct.price)}</p>
                     <p className="text-sm text-gray-600">Danh mục: {selectedProduct.category?.name}</p>
                     <p className="text-sm text-gray-600">Vị trí: {selectedProduct.location?.city}</p>
                     <div className="bg-gray-50 p-2 rounded text-xs text-gray-500 mt-2">
                         {selectedProduct.description}
                     </div>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccessories;