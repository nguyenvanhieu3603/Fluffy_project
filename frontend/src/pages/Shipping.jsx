import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShippingFast, FaPlus, FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';

const Shipping = () => {
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1); // -1 là chọn nhập mới
  const [showForm, setShowForm] = useState(false);
  
  // Form state cho địa chỉ mới
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // 1. Load danh sách địa chỉ từ Backend khi vào trang
  useEffect(() => {
    const fetchAddresses = async () => {
        try {
            const { data } = await api.get('/users/address');
            setAddresses(data);
            // Nếu có địa chỉ, mặc định chọn cái đầu tiên hoặc cái default
            if (data.length > 0) {
                const defaultIdx = data.findIndex(a => a.isDefault);
                setSelectedAddressIndex(defaultIdx >= 0 ? defaultIdx : 0);
            } else {
                setShowForm(true); // Chưa có địa chỉ thì hiện form
            }
        } catch (error) {
            console.error(error);
        }
    };
    fetchAddresses();
  }, []);

  // 2. Xử lý khi bấm "Tiếp tục"
  const submitHandler = (e) => {
    e.preventDefault();
    
    let finalShippingInfo = {};

    if (selectedAddressIndex !== -1 && !showForm) {
        // Trường hợp chọn địa chỉ có sẵn
        const selected = addresses[selectedAddressIndex];
        finalShippingInfo = {
            fullName: selected.fullName,
            phone: selected.phone,
            address: selected.address
        };
    } else {
        // Trường hợp nhập form mới
        if(!fullName || !phone || !address) {
            toast.error("Vui lòng nhập đầy đủ thông tin giao hàng");
            return;
        }
        finalShippingInfo = { fullName, phone, address };
        
        // Tùy chọn: Tự động lưu địa chỉ mới này vào DB cho lần sau
        saveNewAddressToDB(finalShippingInfo);
    }

    // Lưu vào LocalStorage cho bước PlaceOrder
    localStorage.setItem('shippingInfo', JSON.stringify(finalShippingInfo));
    navigate('/placeorder');
  };

  const saveNewAddressToDB = async (info) => {
      try {
          await api.post('/users/address', { ...info, isDefault: addresses.length === 0 });
      } catch (e) {
          console.error("Không thể lưu địa chỉ mới", e);
      }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8 text-[var(--color-primary)]">
            <FaShippingFast className="text-4xl" />
            <h2 className="text-2xl font-bold text-gray-800">Thông tin giao hàng</h2>
        </div>
        
        <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CỘT TRÁI: DANH SÁCH ĐỊA CHỈ */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-700 mb-2">Sổ địa chỉ của bạn</h3>
                
                {addresses.map((addr, index) => (
                    <div 
                        key={index}
                        onClick={() => { setSelectedAddressIndex(index); setShowForm(false); }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${selectedAddressIndex === index && !showForm ? 'border-[var(--color-primary)] bg-yellow-50' : 'border-gray-200 bg-white hover:border-yellow-200'}`}
                    >
                        <div className="mt-1 text-[var(--color-primary)]">
                            {selectedAddressIndex === index && !showForm ? <FaCheckCircle /> : <FaRegCircle className="text-gray-300"/>}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">{addr.fullName} <span className="font-normal text-gray-500 text-sm">| {addr.phone}</span></p>
                            <p className="text-gray-600 text-sm mt-1">{addr.address}</p>
                            {addr.isDefault && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600 mt-2 inline-block">Mặc định</span>}
                        </div>
                    </div>
                ))}

                {/* Nút Thêm địa chỉ mới */}
                <div 
                    onClick={() => { setShowForm(true); setSelectedAddressIndex(-1); }}
                    className={`p-4 rounded-xl border-2 border-dashed cursor-pointer flex items-center justify-center gap-2 transition-all ${showForm ? 'border-[var(--color-primary)] bg-yellow-50 text-[var(--color-primary)]' : 'border-gray-300 text-gray-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'}`}
                >
                    <FaPlus /> Thêm địa chỉ mới
                </div>
            </div>

            {/* CỘT PHẢI: FORM NHẬP LIỆU (Chỉ hiện khi chọn Thêm mới hoặc chưa có địa chỉ) */}
            <div>
                {showForm ? (
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 animate-fade-in">
                        <h3 className="font-bold text-gray-800 mb-4">Nhập địa chỉ mới</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Người nhận</label>
                                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-[var(--color-primary)]"
                                    value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tên người nhận"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-[var(--color-primary)]"
                                    value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxx"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Địa chỉ chi tiết</label>
                                <textarea rows={3} required className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-[var(--color-primary)]"
                                    value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, đường, phường/xã..."
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center text-gray-500">
                        <FaShippingFast className="text-4xl mb-2 text-gray-300"/>
                        <p>Bạn đang chọn giao hàng đến:</p>
                        <p className="font-bold text-gray-800 text-lg mt-2">{addresses[selectedAddressIndex]?.address}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full mt-6 bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold hover:bg-yellow-600 transition-colors shadow-lg"
                >
                    Tiếp tục đến thanh toán
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Shipping;