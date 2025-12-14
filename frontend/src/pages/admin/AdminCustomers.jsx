import { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaUser, FaEye, FaTimes, FaLock, FaUnlock, FaCheckCircle, FaBan } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/admin/users?role=customer');
      setCustomers(data);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
      const action = currentStatus ? 'KHÓA' : 'MỞ KHÓA';
      if(window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) {
          try {
              // Gọi API cập nhật trạng thái (PUT) thay vì DELETE
              await api.put(`/admin/users/${id}/status`);
              toast.success(`Đã ${action.toLowerCase()} tài khoản thành công`);
              fetchCustomers(); // Refresh lại list
              setSelectedUser(null);
          } catch (error) {
              toast.error(error.response?.data?.message || 'Lỗi xử lý');
          }
      }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh sách Khách hàng</h2>
      
      {loading ? <div className="text-center py-10">Đang tải dữ liệu...</div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                    <tr>
                        <th className="p-4">Khách hàng</th>
                        <th className="p-4">Liên hệ</th>
                        <th className="p-4">Ngày tham gia</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {customers.map(user => (
                        <tr key={user._id} className={`hover:bg-gray-50 transition-colors ${!user.isActive ? 'bg-red-50' : ''}`}>
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={user.avatar || '/uploads/default-avatar.jpg'} 
                                        className={`w-10 h-10 rounded-full border object-cover ${!user.isActive ? 'grayscale' : ''}`}
                                        alt="Avatar"
                                    />
                                    <div>
                                        <div className="font-bold text-gray-800">{user.fullName}</div>
                                        <div className="text-xs text-gray-500">ID: {user._id.slice(-6).toUpperCase()}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-sm">
                                <div className="text-gray-700">{user.email}</div>
                                <div className="text-gray-500">{user.phone || '---'}</div>
                            </td>
                            <td className="p-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td className="p-4">
                                {user.isActive ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">
                                        <FaCheckCircle /> Hoạt động
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">
                                        <FaBan /> Đã khóa
                                    </span>
                                )}
                            </td>
                            <td className="p-4">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setSelectedUser(user)} 
                                        className="text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors"
                                        title="Xem chi tiết"
                                    >
                                        <FaEye />
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleToggleStatus(user._id, user.isActive)} 
                                        className={`p-2 rounded transition-colors flex items-center gap-1 ${
                                            user.isActive 
                                            ? 'text-red-500 hover:bg-red-50' 
                                            : 'text-green-500 hover:bg-green-50'
                                        }`}
                                        title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                    >
                                        {user.isActive ? <FaLock /> : <FaUnlock />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {customers.length === 0 && <div className="p-8 text-center text-gray-500">Chưa có khách hàng nào.</div>}
        </div>
      )}

       {/* MODAL CHI TIẾT */}
       {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative animate-fade-in">
                 <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><FaTimes className="text-xl"/></button>
                 
                 <div className="text-center mb-6">
                     <div className="relative inline-block">
                        <img src={selectedUser.avatar || '/uploads/default-avatar.jpg'} className="w-24 h-24 rounded-full mx-auto border-4 border-gray-100 mb-3 object-cover"/>
                        {!selectedUser.isActive && (
                            <div className="absolute bottom-2 right-2 bg-red-600 text-white rounded-full p-1 text-xs border-2 border-white">
                                <FaBan />
                            </div>
                        )}
                     </div>
                     <h3 className="text-xl font-bold text-gray-800">{selectedUser.fullName}</h3>
                     <p className="text-gray-500 uppercase text-xs font-bold tracking-wide mt-1">Khách hàng</p>
                 </div>

                 <div className="space-y-3 bg-gray-50 p-4 rounded-lg text-sm border border-gray-200">
                     <div className="flex justify-between">
                         <span className="text-gray-600">ID Hệ thống:</span>
                         <span className="font-mono font-medium">{selectedUser._id}</span>
                     </div>
                     <div className="flex justify-between">
                         <span className="text-gray-600">Email:</span>
                         <span className="font-medium">{selectedUser.email}</span>
                     </div>
                     <div className="flex justify-between">
                         <span className="text-gray-600">Số điện thoại:</span>
                         <span className="font-medium">{selectedUser.phone || 'Chưa cập nhật'}</span>
                     </div>
                      <div className="flex justify-between">
                         <span className="text-gray-600">Địa chỉ chính:</span>
                         <span className="font-medium text-right max-w-[200px]">{selectedUser.address || 'Chưa cập nhật'}</span>
                     </div>
                     <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                         <span className="text-gray-600">Trạng thái:</span>
                         <span className={`font-bold ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                             {selectedUser.isActive ? 'Đang hoạt động' : 'Đang bị khóa'}
                         </span>
                     </div>
                 </div>
                 
                 <div className="mt-6">
                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FaCheckCircle className="text-[var(--color-primary)]"/> Sổ địa chỉ ({selectedUser.addresses?.length || 0})</h4>
                    {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                        <div className="max-h-32 overflow-y-auto custom-scrollbar pr-1">
                            <ul className="text-xs text-gray-600 space-y-2">
                                {selectedUser.addresses.map((addr, idx) => (
                                    <li key={idx} className="bg-gray-100 p-2 rounded border border-gray-200">
                                        <span className="font-bold text-gray-800">{addr.fullName}</span> - {addr.phone} <br/>
                                        {addr.address}
                                        {addr.isDefault && <span className="ml-2 text-[10px] bg-[var(--color-primary)] text-white px-1 rounded">Mặc định</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : <p className="text-xs text-gray-400 italic p-2 bg-gray-50 rounded text-center">Chưa lưu địa chỉ nào</p>}
                 </div>

                 {/* Action Bar trong Modal */}
                 <div className="mt-6 flex justify-end">
                    <button 
                        onClick={() => { handleToggleStatus(selectedUser._id, selectedUser.isActive); }}
                        className={`w-full py-2 rounded font-bold transition-colors shadow-sm flex items-center justify-center gap-2 ${
                            selectedUser.isActive 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                    >
                        {selectedUser.isActive ? <><FaLock /> Khóa tài khoản này</> : <><FaUnlock /> Mở khóa tài khoản</>}
                    </button>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;