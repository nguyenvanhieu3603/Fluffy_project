import { Routes, Route, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProductDetail from './pages/ProductDetail'; 
import SellerRegister from './pages/SellerRegister';
import Cart from './pages/Cart';
import Shipping from './pages/Shipping';
import PlaceOrder from './pages/PlaceOrder';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile'; // <-- Import trang mới
import Pets from './pages/Pets';
import Accessories from './pages/Accessories'; // <-- Import component mới
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import ShopProfile from './pages/ShopProfile'; // <-- Import trang Shop mới

// Admin & Seller
import SellerLayout from './layouts/SellerLayout'; 
import SellerOrders from './pages/seller/SellerOrders';
import SellerProducts from './pages/seller/SellerProducts';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductApprove from './pages/admin/AdminProductApprove';
import AdminSellerApprove from './pages/admin/AdminSellerApprove';
import AdminSellers from './pages/admin/AdminSellers'; // <-- Mới
import AdminCustomers from './pages/admin/AdminCustomers'; // <-- Mới
import AdminPets from './pages/admin/AdminPets'; // <-- Mới
import SellerDashboard from './pages/seller/SellerDashboard';
import AdminAccessories from './pages/admin/AdminAccessories';
import AdminReviews from './pages/admin/AdminReviews'; // <-- Mới
import AdminReports from './pages/admin/AdminReports';
import AdminBlogs from './pages/admin/AdminBlogs';

// Component Layout dành cho Khách hàng (Có Header/Footer)
const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Placeholder Seller Dashboard
const SellerDashboardStats = () => <div className="p-6 bg-white rounded-xl shadow-sm">Thống kê doanh thu (Đang phát triển)</div>;

function App() {
  return (
    <>
      <Routes>
        {/* --- NHÓM 1: PUBLIC & CUSTOMER (Dùng MainLayout) --- */}
        <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/seller-register" element={<SellerRegister />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/placeorder" element={<PlaceOrder />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/profile" element={<Profile />} /> 
                        {/* Route danh sách sản phẩm */}
            <Route path="/pets" element={<Pets />} /> 
            
            {/* Route cho trang phụ kiện, trỏ đến component Accessories mới */}
            <Route path="/accessories" element={<Accessories />} /> 

            {/* Các trang mới: Blog, Chi tiết Blog, Liên hệ */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/contact" element={<Contact />} />

            {/* Route cho trang cửa hàng của người bán */}
            <Route path="/shop/:id" element={<ShopProfile />} />

            {/* Seller Layout cũng lồng trong MainLayout để giữ Header, 
                hoặc bạn có thể tách ra nếu muốn Seller không có Header web chính */}
            <Route path="/seller" element={<SellerLayout />}>
                {/* SỬ DỤNG COMPONENT THẬT */}
                <Route path="dashboard" element={<SellerDashboard />} /> 
                <Route path="orders" element={<SellerOrders />} />
                <Route path="products" element={<SellerProducts />} />
            </Route>
        </Route>

        {/* --- NHÓM 2: ADMIN (Layout Riêng - Không Header/Footer Web) --- */}
        <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="approve-products" element={<AdminProductApprove />} />
            <Route path="approve-sellers" element={<AdminSellerApprove />} />
            
            {/* 3 TRANG QUẢN LÝ MỚI */}
            <Route path="sellers" element={<AdminSellers />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="pets" element={<AdminPets />} />
            <Route path="accessories" element={<AdminAccessories />} /> 

                        {/* --- MỚI --- */}
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="blogs" element={<AdminBlogs />} />
        </Route>

      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App;