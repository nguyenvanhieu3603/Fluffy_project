import { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaPaw, FaEye, FaTimes } from 'react-icons/fa';

const AdminPets = () => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const { data } = await api.get('/admin/pets');
        setPets(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPets();
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tất cả Thú cưng trên sàn</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                <tr>
                    <th className="p-4">Ảnh</th>
                    <th className="p-4">Tên thú cưng</th>
                    <th className="p-4">Người bán (Shop)</th>
                    <th className="p-4">Giá</th>
                    <th className="p-4">Trạng thái SK</th>
                    <th className="p-4">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {pets.map(pet => (
                    <tr key={pet._id} className="hover:bg-gray-50">
                        <td className="p-4">
                             <img src={pet.images[0]} className="w-12 h-12 rounded object-cover border"/>
                        </td>
                        <td className="p-4 font-medium text-gray-800 max-w-xs truncate">{pet.name}</td>
                        <td className="p-4 text-sm text-blue-600 font-medium">{pet.seller?.sellerInfo?.shopName || pet.seller?.fullName}</td>
                        <td className="p-4 font-bold text-[var(--color-primary)]">{formatPrice(pet.price)}</td>
                        <td className="p-4">
                            {pet.healthStatus === 'approved' 
                                ? <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold uppercase">Đã duyệt</span>
                                : <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs font-bold uppercase">Pending</span>
                            }
                        </td>
                        <td className="p-4">
                            <button 
                                onClick={() => setSelectedPet(pet)}
                                className="text-gray-500 hover:text-[var(--color-primary)] p-2"
                            >
                                <FaEye />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

       {/* MODAL CHI TIẾT */}
       {selectedPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative flex flex-col md:flex-row gap-6">
                 <button onClick={() => setSelectedPet(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 z-10"><FaTimes className="text-xl"/></button>
                 
                 <div className="w-full md:w-1/2">
                     <img src={selectedPet.images[0]} className="w-full h-64 object-cover rounded-lg bg-gray-100"/>
                     <div className="flex gap-2 mt-2 overflow-x-auto">
                         {selectedPet.images.map((img, idx) => (
                             <img key={idx} src={img} className="w-16 h-16 rounded object-cover border"/>
                         ))}
                     </div>
                 </div>

                 <div className="w-full md:w-1/2 space-y-3">
                     <h3 className="text-2xl font-bold text-gray-800">{selectedPet.name}</h3>
                     <p className="text-2xl font-bold text-[var(--color-primary)]">{formatPrice(selectedPet.price)}</p>
                     
                     <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                         <p><strong>Người bán:</strong> {selectedPet.seller?.sellerInfo?.shopName}</p>
                         <p><strong>Giống:</strong> {selectedPet.breed}</p>
                         <p><strong>Tuổi:</strong> {selectedPet.age}</p>
                         <p><strong>Giới tính:</strong> {selectedPet.gender}</p>
                         <p><strong>Kho:</strong> {selectedPet.stock}</p>
                         <p><strong>Vị trí:</strong> {selectedPet.location?.city}</p>
                     </div>

                     <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                         <strong>Mô tả:</strong> <br/>
                         {selectedPet.description}
                     </div>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default AdminPets;