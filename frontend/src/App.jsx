import { Routes, Route, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

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
import Profile from './pages/Profile'; 
import Pets from './pages/Pets';
import Accessories from './pages/Accessories'; 
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import ShopProfile from './pages/ShopProfile'; 
import Help from './pages/Help';

// Admin & Seller
import SellerLayout from './layouts/SellerLayout'; 
import SellerOrders from './pages/seller/SellerOrders';
import SellerPets from './pages/seller/SellerPets'; // IMPORT MỚI
import SellerAccessories from './pages/seller/SellerAccessories'; // IMPORT MỚI

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductApprove from './pages/admin/AdminProductApprove';
import AdminSellerApprove from './pages/admin/AdminSellerApprove';
import AdminSellers from './pages/admin/AdminSellers'; 
import AdminCustomers from './pages/admin/AdminCustomers'; 
import AdminPets from './pages/admin/AdminPets'; 
import SellerDashboard from './pages/seller/SellerDashboard';
import AdminAccessories from './pages/admin/AdminAccessories';
import AdminReviews from './pages/admin/AdminReviews'; 
import AdminReports from './pages/admin/AdminReports';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCoupons from './pages/admin/AdminCoupons';

// Component Layout dành cho Khách hàng (Có Header/Footer)
const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <ScrollToTop />
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

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
            <Route path="/pets" element={<Pets />} /> 
            <Route path="/help" element={<Help />} />
            
            <Route path="/accessories" element={<Accessories />} /> 

            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/shop/:id" element={<ShopProfile />} />

            <Route path="/seller" element={<SellerLayout />}>
                <Route path="dashboard" element={<SellerDashboard />} /> 
                <Route path="orders" element={<SellerOrders />} />
                {/* Thay thế route cũ "products" bằng 2 route mới */}
                <Route path="pets" element={<SellerPets />} />
                <Route path="accessories" element={<SellerAccessories />} />
            </Route>
        </Route>

        {/* --- NHÓM 2: ADMIN (Layout Riêng - Không Header/Footer Web) --- */}
        <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="approve-products" element={<AdminProductApprove />} />
            <Route path="approve-sellers" element={<AdminSellerApprove />} />
            
            <Route path="categories" element={<AdminCategories />} />
            <Route path="coupons" element={<AdminCoupons />} />

            <Route path="sellers" element={<AdminSellers />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="pets" element={<AdminPets />} />
            <Route path="accessories" element={<AdminAccessories />} /> 

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