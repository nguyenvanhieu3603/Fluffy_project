import { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaStore, FaEye, FaTimes } from 'react-icons/fa';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null); // Để hiện Modal chi tiết

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const { data } = await api.get('/admin/users?role=seller');
        setSellers(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSellers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh sách Người bán</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                <tr>
                    <th className="p-4">Tên Shop</th>
                    <th className="p-4">Chủ sở hữu</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Ngày tham gia</th>
                    <th className="p-4">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {sellers.map(seller => (
                    <tr key={seller._id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                             <img src={seller.sellerInfo?.shopLogo || seller.avatar} className="w-8 h-8 rounded-full border"/>
                             {seller.sellerInfo?.shopName || 'Chưa đặt tên'}
                        </td>
                        <td className="p-4">{seller.fullName}</td>
                        <td className="p-4 text-sm text-gray-600">{seller.email}</td>
                        <td className="p-4 text-sm text-gray-500">{new Date(seller.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4">
                            <button 
                                onClick={() => setSelectedSeller(seller)}
                                className="text-blue-500 hover:bg-blue-50 p-2 rounded flex items-center gap-1"
                            >
                                <FaEye /> Chi tiết
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
                 <button onClick={() => setSelectedSeller(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><FaTimes className="text-xl"/></button>
                 
                 <div className="text-center mb-6">
                     <img src={selectedSeller.avatar} className="w-20 h-20 rounded-full mx-auto border-2 border-[var(--color-primary)] mb-3 object-cover"/>
                     <h3 className="text-xl font-bold text-gray-800">{selectedSeller.sellerInfo?.shopName}</h3>
                     <p className="text-gray-500">Chủ shop: {selectedSeller.fullName}</p>
                 </div>

                 <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                     <div className="flex justify-between border-b pb-2">
                         <span className="text-gray-600">Email:</span>
                         <span className="font-medium">{selectedSeller.email}</span>
                     </div>
                     <div className="flex justify-between border-b pb-2">
                         <span className="text-gray-600">Số điện thoại:</span>
                         <span className="font-medium">{selectedSeller.phone || 'Chưa cập nhật'}</span>
                     </div>
                     <div className="flex justify-between border-b pb-2">
                         <span className="text-gray-600">Địa chỉ Shop:</span>
                         <span className="font-medium text-right max-w-[200px]">{selectedSeller.sellerInfo?.shopAddress}</span>
                     </div>
                      <div className="flex justify-between border-b pb-2">
                         <span className="text-gray-600">Mô tả:</span>
                         <span className="font-medium text-right max-w-[200px] text-xs italic">{selectedSeller.sellerInfo?.shopDescription}</span>
                     </div>
                     <div className="flex justify-between">
                         <span className="text-gray-600">Trạng thái:</span>
                         <span className="text-green-600 font-bold uppercase">{selectedSeller.sellerInfo?.status}</span>
                     </div>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellers;