import { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaUser, FaEye, FaTimes, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/admin/users?role=customer');
      setCustomers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
      if(window.confirm('CẢNH BÁO: Bạn có chắc muốn xóa vĩnh viễn người dùng này?')) {
          try {
              await api.delete(`/admin/users/${id}`);
              toast.success('Đã xóa người dùng');
              fetchCustomers();
              setSelectedUser(null);
          } catch (error) {
              toast.error('Lỗi khi xóa');
          }
      }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh sách Khách hàng</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                <tr>
                    <th className="p-4">Họ và tên</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Số điện thoại</th>
                    <th className="p-4">Ngày đăng ký</th>
                    <th className="p-4">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {customers.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                             <img src={user.avatar} className="w-8 h-8 rounded-full border object-cover"/>
                             {user.fullName}
                        </td>
                        <td className="p-4 text-sm">{user.email}</td>
                        <td className="p-4 text-sm">{user.phone || '---'}</td>
                        <td className="p-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4 flex gap-2">
                            <button onClick={() => setSelectedUser(user)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><FaEye /></button>
                            <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><FaTrash /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

       {/* MODAL CHI TIẾT */}
       {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                 <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><FaTimes className="text-xl"/></button>
                 
                 <div className="text-center mb-6">
                     <img src={selectedUser.avatar} className="w-24 h-24 rounded-full mx-auto border-4 border-gray-100 mb-3 object-cover"/>
                     <h3 className="text-xl font-bold text-gray-800">{selectedUser.fullName}</h3>
                     <p className="text-gray-500 uppercase text-xs font-bold tracking-wide mt-1">Khách hàng thân thiết</p>
                 </div>

                 <div className="space-y-3 bg-gray-50 p-4 rounded-lg text-sm">
                     <div className="flex justify-between">
                         <span className="text-gray-600">ID:</span>
                         <span className="font-mono">{selectedUser._id}</span>
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
                         <span className="text-gray-600">Địa chỉ:</span>
                         <span className="font-medium text-right max-w-[200px]">{selectedUser.address || 'Chưa cập nhật'}</span>
                     </div>
                 </div>
                 
                 <div className="mt-6">
                    <h4 className="font-bold text-gray-700 mb-2">Sổ địa chỉ giao hàng:</h4>
                    {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                        <ul className="text-xs text-gray-600 space-y-2">
                            {selectedUser.addresses.map((addr, idx) => (
                                <li key={idx} className="bg-gray-100 p-2 rounded border border-gray-200">
                                    <span className="font-bold">{addr.fullName}</span> - {addr.phone} <br/>
                                    {addr.address}
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-xs text-gray-400 italic">Chưa lưu địa chỉ nào</p>}
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;