import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaUser, FaMapMarkerAlt, FaLock, FaCamera, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info'); 
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); 

  const DEFAULT_AVATAR = "/uploads/default-avatar.jpg"; 

  // --- STATE PROFILE ---
  const [infoForm, setInfoForm] = useState({
    fullName: '',
    phone: '',
    avatar: '' 
  });
  const [avatarFile, setAvatarFile] = useState(null); 

  // --- STATE PASSWORD ---
  const [passForm, setPassForm] = useState({ password: '', confirmPassword: '' });

  // --- STATE ADDRESS (MỚI) ---
  const [addresses, setAddresses] = useState([]);
  const [showAddAddr, setShowAddAddr] = useState(false);

  // State cho Dropdown Địa chính
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Form thêm địa chỉ mới (Cấu trúc mới)
  const [addressForm, setAddressForm] = useState({
      provinceCode: '', provinceName: '',
      districtCode: '', districtName: '',
      wardCode: '', wardName: '',
      specificAddress: '',
      isDefault: false
  });

  useEffect(() => {
    if (!user) {
        navigate('/login');
    } else {
      setInfoForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        avatar: (user.avatar && user.avatar !== "{}" && user.avatar !== "undefined") ? user.avatar : DEFAULT_AVATAR
      });
      fetchAddresses();
    }
  }, [user, navigate]);

  // --- LOGIC LẤY DỮ LIỆU ĐỊA CHÍNH (API PUBLIC) ---
  useEffect(() => {
      const fetchProvinces = async () => {
          try {
              const res = await axios.get('https://provinces.open-api.vn/api/?depth=1');
              setProvinces(res.data);
          } catch (error) {
              console.error("Lỗi lấy tỉnh thành:", error);
          }
      };
      fetchProvinces();
  }, []);

  const fetchDistricts = async (provinceCode) => {
      try {
          const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
          setDistricts(res.data.districts);
          setWards([]); 
      } catch (error) { console.error(error); }
  };

  const fetchWards = async (districtCode) => {
      try {
          const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
          setWards(res.data.wards);
      } catch (error) { console.error(error); }
  };

  // --- HANDLERS DROPDOWN ---
  const handleProvinceChange = (e) => {
      const code = e.target.value;
      const index = e.target.selectedIndex;
      const name = e.target.options[index].text;
      setAddressForm({ ...addressForm, provinceCode: code, provinceName: name, districtCode: '', districtName: '', wardCode: '', wardName: '' });
      fetchDistricts(code);
  };

  const handleDistrictChange = (e) => {
      const code = e.target.value;
      const index = e.target.selectedIndex;
      const name = e.target.options[index].text;
      setAddressForm({ ...addressForm, districtCode: code, districtName: name, wardCode: '', wardName: '' });
      fetchWards(code);
  };

  const handleWardChange = (e) => {
      const code = e.target.value;
      const index = e.target.selectedIndex;
      const name = e.target.options[index].text;
      setAddressForm({ ...addressForm, wardCode: code, wardName: name });
  };

  // --- HANDLERS FETCH DATA ---
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

  // --- UPDATE PROFILE ---
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

      const { data } = await api.put('/users/profile', formData);
      
      // Cập nhật token mới nếu có thay đổi thông tin quan trọng
      if(data.token) {
          localStorage.setItem('token', data.token);
      }
      
      window.location.reload();
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  // --- CHANGE PASSWORD ---
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

  // --- ADD ADDRESS (LOGIC MỚI) ---
  const handleAddAddress = async (e) => {
      e.preventDefault();
      if(!addressForm.provinceName || !addressForm.districtName || !addressForm.wardName || !addressForm.specificAddress) {
          return toast.error('Vui lòng chọn đầy đủ thông tin địa chỉ');
      }

      try {
          await api.post('/users/address', { 
              province: addressForm.provinceName,
              district: addressForm.districtName,
              ward: addressForm.wardName,
              specificAddress: addressForm.specificAddress,
              isDefault: addressForm.isDefault
          });
          toast.success('Thêm địa chỉ mới thành công');
          setShowAddAddr(false);
          // Reset form
          setAddressForm({ 
              provinceCode: '', provinceName: '', 
              districtCode: '', districtName: '', 
              wardCode: '', wardName: '', 
              specificAddress: '', 
              isDefault: false 
          });
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
      e.target.src = DEFAULT_AVATAR; 
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

                {/* FORM ĐỊA CHỈ (ĐÃ SỬA) */}
                {activeTab === 'address' && (
                    <div>
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800">Địa chỉ nhận hàng</h2>
                            <button onClick={() => setShowAddAddr(!showAddAddr)} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                <FaPlus /> Thêm địa chỉ mới
                            </button>
                        </div>

                        {showAddAddr && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                                <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                        <h3 className="font-bold text-lg text-gray-800">Thêm địa chỉ mới</h3>
                                        <button onClick={() => setShowAddAddr(false)} className="text-gray-400 hover:text-red-500"><FaTimes /></button>
                                    </div>
                                    <form onSubmit={handleAddAddress} className="p-6 space-y-4">
                                        {/* DROPDOWN TỈNH/THÀNH */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố</label>
                                            <select 
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--color-primary)]"
                                                value={addressForm.provinceCode}
                                                onChange={handleProvinceChange}
                                                required
                                            >
                                                <option value="">-- Chọn Tỉnh / Thành phố --</option>
                                                {provinces.map(p => (
                                                    <option key={p.code} value={p.code}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* DROPDOWN QUẬN/HUYỆN */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Quận / Huyện</label>
                                            <select 
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--color-primary)] disabled:bg-gray-100"
                                                value={addressForm.districtCode}
                                                onChange={handleDistrictChange}
                                                disabled={!addressForm.provinceCode}
                                                required
                                            >
                                                <option value="">-- Chọn Quận / Huyện --</option>
                                                {districts.map(d => (
                                                    <option key={d.code} value={d.code}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* DROPDOWN PHƯỜNG/XÃ */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phường / Xã</label>
                                            <select 
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--color-primary)] disabled:bg-gray-100"
                                                value={addressForm.wardCode}
                                                onChange={handleWardChange}
                                                disabled={!addressForm.districtCode}
                                                required
                                            >
                                                <option value="">-- Chọn Phường / Xã --</option>
                                                {wards.map(w => (
                                                    <option key={w.code} value={w.code}>{w.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* ĐỊA CHỈ CỤ THỂ */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể</label>
                                            <textarea 
                                                rows="2"
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--color-primary)]"
                                                placeholder="Số nhà, tên đường, tòa nhà..."
                                                value={addressForm.specificAddress}
                                                onChange={(e) => setAddressForm({...addressForm, specificAddress: e.target.value})}
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                id="isDefault" 
                                                checked={addressForm.isDefault}
                                                onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                                                className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                            />
                                            <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">Đặt làm địa chỉ mặc định</label>
                                        </div>

                                        <div className="pt-2 flex justify-end gap-3">
                                            <button type="button" onClick={() => setShowAddAddr(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Hủy</button>
                                            <button type="submit" className="px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-yellow-600 shadow-sm">Lưu địa chỉ</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {addresses.length === 0 ? <p className="text-gray-500 text-center py-8">Bạn chưa lưu địa chỉ nào.</p> : addresses.map(addr => (
                                <div key={addr._id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start hover:shadow-sm transition-shadow">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800 text-lg">Địa chỉ giao hàng</span>
                                            {addr.isDefault && <span className="text-xs bg-[var(--color-primary)] text-white px-2 py-0.5 rounded">Mặc định</span>}
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1">{addr.specificAddress}</p>
                                        <p className="text-gray-600 text-sm">{addr.ward}, {addr.district}, {addr.province}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"><FaTrash /></button>
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