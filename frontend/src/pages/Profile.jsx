import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaUser, FaMapMarkerAlt, FaLock, FaCamera, FaTrash, FaPlus } from 'react-icons/fa';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('info'); 
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); 


  const DEFAULT_AVATAR = "/uploads/default-avatar.jpg"; 


  const [infoForm, setInfoForm] = useState({
    fullName: '',
    phone: '',
    avatar: '' 
  });
  const [avatarFile, setAvatarFile] = useState(null); 

  const [passForm, setPassForm] = useState({ password: '', confirmPassword: '' });
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', address: '' });
  const [showAddAddr, setShowAddAddr] = useState(false);

  useEffect(() => {
    if (user) {
      setInfoForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        // Logic kiểm tra ảnh: Nếu rỗng, null hoặc là object rỗng thì dùng Default
        avatar: (user.avatar && user.avatar !== "{}" && user.avatar !== "undefined") ? user.avatar : DEFAULT_AVATAR
      });
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
      try {
          const { data } = await api.get('/users/address');
          setAddresses(data);
      } catch (error) {
          console.error(error);
      }
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setAvatarFile(file);
          setInfoForm({ ...infoForm, avatar: URL.createObjectURL(file) });
      }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', infoForm.fullName);
      formData.append('phone', infoForm.phone);
      
      if (avatarFile) {
          formData.append('avatar', avatarFile);
      }

      // Backend (Multer) cần đọc formData, Axios tự động set Content-Type
      const { data } = await api.put('/users/profile', formData);
      
      localStorage.setItem('token', data.token);
      
      // Force reload để xóa cache ảnh cũ nếu có và cập nhật UI
      window.location.reload();
      
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  // ... (Các hàm khác giữ nguyên: handleChangePassword, handleAddAddress, handleDeleteAddress)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.password !== passForm.confirmPassword) {
        return toast.error('Mật khẩu xác nhận không khớp');
    }
    setLoading(true);
    try {
        await api.put('/users/profile', { password: passForm.password });
        toast.success('Đổi mật khẩu thành công!');
        setPassForm({ password: '', confirmPassword: '' });
    } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi đổi mật khẩu');
    } finally {
        setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
      e.preventDefault();
      try {
          await api.post('/users/address', { ...newAddress, isDefault: false });
          toast.success('Thêm địa chỉ mới thành công');
          setShowAddAddr(false);
          setNewAddress({ fullName: '', phone: '', address: '' });
          fetchAddresses();
      } catch (error) {
          toast.error('Lỗi thêm địa chỉ');
      }
  };

  const handleDeleteAddress = async (id) => {
      if(window.confirm('Bạn muốn xóa địa chỉ này?')) {
          try {
              await api.delete(`/users/address/${id}`);
              toast.success('Đã xóa địa chỉ');
              fetchAddresses();
          } catch (error) {
              toast.error('Lỗi xóa địa chỉ');
          }
      }
  }

  const handleImageError = (e) => {
      e.target.src = DEFAULT_AVATAR; // Fallback về ảnh mặc định local nếu ảnh user bị lỗi
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR */}
        <div className="w-full md:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center mb-6">
                <div className="relative inline-block group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                    <img 
                        src={infoForm.avatar} 
                        onError={handleImageError}
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 mx-auto mb-3 group-hover:opacity-80 transition-opacity"
                        alt="Avatar"
                    />
                    <button type="button" className="absolute bottom-3 right-0 bg-[var(--color-primary)] text-white p-2 rounded-full text-xs hover:bg-yellow-600 border-2 border-white shadow-md">
                        <FaCamera />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <h3 className="font-bold text-lg text-gray-800">{user?.fullName}</h3>
                <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button onClick={() => setActiveTab('info')} className={`w-full text-left px-6 py-4 flex items-center gap-3 font-medium transition-colors ${activeTab === 'info' ? 'bg-yellow-50 text-[var(--color-primary)] border-l-4 border-[var(--color-primary)]' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <FaUser /> Thông tin tài khoản
                </button>
                <button onClick={() => setActiveTab('address')} className={`w-full text-left px-6 py-4 flex items-center gap-3 font-medium transition-colors ${activeTab === 'address' ? 'bg-yellow-50 text-[var(--color-primary)] border-l-4 border-[var(--color-primary)]' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <FaMapMarkerAlt /> Sổ địa chỉ
                </button>
                <button onClick={() => setActiveTab('password')} className={`w-full text-left px-6 py-4 flex items-center gap-3 font-medium transition-colors ${activeTab === 'password' ? 'bg-yellow-50 text-[var(--color-primary)] border-l-4 border-[var(--color-primary)]' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <FaLock /> Đổi mật khẩu
                </button>
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="w-full md:w-3/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
                
                {/* FORM THÔNG TIN */}
                {activeTab === 'info' && (
                    <form onSubmit={handleUpdateInfo}>
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Hồ sơ của tôi</h2>
                        <div className="grid grid-cols-1 gap-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <input type="text" value={infoForm.fullName} onChange={(e) => setInfoForm({...infoForm, fullName: e.target.value})} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)]"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Không thể thay đổi)</label>
                                <input type="email" value={user?.email} disabled className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input type="text" value={infoForm.phone} onChange={(e) => setInfoForm({...infoForm, phone: e.target.value})} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)]"/>
                            </div>
                            
                            <button type="submit" disabled={loading} className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-600 transition-colors w-fit">
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                )}

                {/* FORM ĐỊA CHỈ */}
                {activeTab === 'address' && (
                    <div>
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800">Địa chỉ của tôi</h2>
                            <button onClick={() => setShowAddAddr(!showAddAddr)} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                <FaPlus /> Thêm địa chỉ mới
                            </button>
                        </div>

                        {showAddAddr && (
                            <form onSubmit={handleAddAddress} className="bg-gray-50 p-4 rounded-lg mb-6 animate-fade-in border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input type="text" placeholder="Họ tên người nhận" required className="border p-2 rounded" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})}/>
                                    <input type="text" placeholder="Số điện thoại" required className="border p-2 rounded" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})}/>
                                </div>
                                <textarea placeholder="Địa chỉ chi tiết (Số nhà, Đường, Quận, TP)" required className="border p-2 rounded w-full mb-4" value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})}></textarea>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowAddAddr(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Hủy</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu</button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {addresses.length === 0 ? <p className="text-gray-500">Chưa có địa chỉ nào.</p> : addresses.map(addr => (
                                <div key={addr._id} className="border rounded-lg p-4 flex justify-between items-start hover:shadow-sm transition-shadow">
                                    <div>
                                        <div className="font-bold text-gray-800 flex items-center gap-2">
                                            {addr.fullName} 
                                            <span className="font-normal text-gray-500 text-sm">| {addr.phone}</span>
                                            {addr.isDefault && <span className="bg-[var(--color-primary)] text-white text-[10px] px-2 py-0.5 rounded">Mặc định</span>}
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1">{addr.address}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><FaTrash /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FORM MẬT KHẨU */}
                {activeTab === 'password' && (
                    <form onSubmit={handleChangePassword}>
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Đổi mật khẩu</h2>
                        <div className="grid grid-cols-1 gap-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                <input type="password" required value={passForm.password} onChange={(e) => setPassForm({...passForm, password: e.target.value})} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)]"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                                <input type="password" required value={passForm.confirmPassword} onChange={(e) => setPassForm({...passForm, confirmPassword: e.target.value})} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)]"/>
                            </div>
                            <button type="submit" disabled={loading} className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-600 transition-colors w-fit">
                                {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;