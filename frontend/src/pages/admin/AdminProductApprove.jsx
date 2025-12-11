import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

const AdminProductApprove = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingPets = async () => {
    try {
      const { data } = await api.get('/pets/admin/pending');
      setPets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPets();
  }, []);

  const handleApprove = async (id) => {
      if(window.confirm('Xác nhận duyệt sản phẩm này?')) {
          try {
              await api.put(`/pets/${id}/health-check`, { status: 'approved' });
              toast.success('Đã duyệt sản phẩm!');
              fetchPendingPets();
          } catch (error) {
              toast.error('Lỗi khi duyệt');
          }
      }
  };

  const handleReject = async (id) => {
      if(window.confirm('Từ chối sản phẩm này?')) {
          try {
              await api.put(`/pets/${id}/health-check`, { status: 'rejected' });
              toast.success('Đã từ chối sản phẩm!');
              fetchPendingPets();
          } catch (error) {
              toast.error('Lỗi khi từ chối');
          }
      }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Duyệt sản phẩm (Health Check)</h2>

      {loading ? <div>Đang tải...</div> : pets.length === 0 ? (
          <div className="bg-white p-10 rounded-xl text-center text-gray-500 shadow-sm">
              Hiện không có sản phẩm nào cần duyệt.
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pets.map(pet => (
                  <div key={pet._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                      <div className="w-full md:w-48 h-48 bg-gray-100 relative">
                           <img src={pet.images[0]} alt={pet.name} className="w-full h-full object-cover"/>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                              <div className="flex justify-between items-start">
                                  <h3 className="font-bold text-lg text-gray-800 mb-1">{pet.name}</h3>
                                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold uppercase">Pending</span>
                              </div>
                              <p className="text-sm text-gray-500 mb-2">Người bán: <span className="font-medium text-blue-600">{pet.seller?.sellerInfo?.shopName || pet.seller?.fullName}</span></p>
                              
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                                  <p>Giá: <span className="font-bold text-[var(--color-primary)]">{formatPrice(pet.price)}</span></p>
                                  <p>Giống: {pet.breed}</p>
                                  <p>Tuổi: {pet.age}</p>
                                  <p>Vị trí: {pet.location?.city}</p>
                              </div>
                          </div>
                          
                          <div className="flex gap-3 mt-2">
                              <button 
                                onClick={() => handleApprove(pet._id)}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                              >
                                  <FaCheck /> Duyệt
                              </button>
                              <button 
                                onClick={() => handleReject(pet._id)}
                                className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                              >
                                  <FaTimes /> Từ chối
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default AdminProductApprove;