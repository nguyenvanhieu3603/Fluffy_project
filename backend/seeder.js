const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify'); // Nếu chưa có hàm này thì dùng hàm helper bên dưới
const bcrypt = require('bcryptjs');

// Import Models
const User = require('./models/userModel');
const Category = require('./models/categoryModel');
const Pet = require('./models/petModel');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

function makeSlug(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           
    .replace(/[^\w\-\u00C0-\u1EF9]+/g, '')       
    .replace(/\-\-+/g, '-')         
    .replace(/^-+/, '')             
    .replace(/-+$/, '');            
}

const importData = async () => {
  try {
    // 1. Xóa dữ liệu cũ
    await Category.deleteMany();
    await Pet.deleteMany();
    console.log('Đã xóa dữ liệu cũ...');

    // 2. Lấy User
    let sellerHCM = await User.findOne({ email: 'seller@gmail.com' });
    let sellerHN = await User.findOne({ email: 'seller_hanoi@gmail.com' });

    // Tạo User mẫu nếu cần (Giữ nguyên logic cũ)
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash('123456', salt);
    const defaultAvatar = '/uploads/default-avatar.jpg';

    if (!sellerHCM) {
        sellerHCM = await User.create({
            fullName: 'Pet Shop Sài Gòn',
            email: 'seller@gmail.com',
            password: hashPassword,
            role: 'seller',
            phone: '0909123456',
            avatar: defaultAvatar,
            sellerInfo: { shopName: 'Pet House Sài Gòn', shopAddress: '123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh', status: 'approved' }
        });
    }
    if (!sellerHN) {
        sellerHN = await User.create({
            fullName: 'Pet Shop Hà Nội',
            email: 'seller_hanoi@gmail.com',
            password: hashPassword,
            role: 'seller',
            phone: '0988888888',
            avatar: defaultAvatar,
            sellerInfo: { shopName: 'Hà Nội Pet Center', shopAddress: '456 Đường Láng, Đống Đa, Hà Nội', status: 'approved' }
        });
    }

    // 3. TẠO DANH MỤC (CATEGORIES)
    const petsRoot = await Category.create({ name: 'Thú Cưng', slug: 'thu-cung' });
    const accRoot = await Category.create({ name: 'Phụ Kiện', slug: 'phu-kien' });

    // --- NHÁNH THÚ CƯNG (Giữ nguyên) ---
    const dogCat = await Category.create({ name: 'Chó Cảnh', parentId: petsRoot._id, slug: 'cho-canh' });
    const catCat = await Category.create({ name: 'Mèo Cảnh', parentId: petsRoot._id, slug: 'meo-canh' });
    const otherCat = await Category.create({ name: 'Thú Cưng Khác', parentId: petsRoot._id, slug: 'thu-khac' });

    // Giống Chó
    const dogBreeds = ['Chó Poodle', 'Chó Corgi', 'Chó Pug', 'Chó Alaska', 'Chó Husky', 'Chó Shiba', 'Chó Golden'];
    for (const name of dogBreeds) await Category.create({ name, parentId: dogCat._id, slug: makeSlug(name) });

    // Giống Mèo
    const catBreeds = ['Mèo Anh Lông Ngắn', 'Mèo Ba Tư', 'Mèo Munchkin', 'Mèo Bengal', 'Mèo Sphynx'];
    for (const name of catBreeds) await Category.create({ name, parentId: catCat._id, slug: makeSlug(name) });

    // Thú Khác
    const otherBreeds = ['Hamster', 'Thỏ Kiểng', 'Nhím Kiểng', 'Rồng Nam Mỹ'];
    for (const name of otherBreeds) await Category.create({ name, parentId: otherCat._id, slug: makeSlug(name) });


    // --- NHÁNH PHỤ KIỆN (CẤU TRÚC MỚI 3 CẤP) ---
    
    // Cấp 2: Nhóm Phụ Kiện
    const accDog = await Category.create({ name: 'Phụ Kiện Cho Chó', parentId: accRoot._id, slug: 'phu-kien-cho' });
    const accCat = await Category.create({ name: 'Phụ Kiện Cho Mèo', parentId: accRoot._id, slug: 'phu-kien-meo' });
    const accOther = await Category.create({ name: 'Phụ Kiện Thú Khác', parentId: accRoot._id, slug: 'phu-kien-khac' });

    // Cấp 3: Chi tiết Phụ Kiện Cho Chó (Theo ảnh)
    const dogAccTypes = [
        'Thức Ăn & Dinh Dưỡng', 'Vệ Sinh & Chăm Sóc', 'Chuồng & Túi Vận Chuyển', 'Đồ Dùng & Đồ Chơi', 'Thuốc & Y Tế'
    ];
    const dogAccCats = [];
    for (const name of dogAccTypes) {
        const c = await Category.create({ name, parentId: accDog._id, slug: makeSlug(name) });
        dogAccCats.push(c);
    }

    // Cấp 3: Chi tiết Phụ Kiện Cho Mèo
    const catAccTypes = [
        'Thức Ăn & Pate', 'Cát Vệ Sinh & Dụng Cụ', 'Chuồng & Balo', 'Đồ Chơi & Cào Móng', 'Thuốc & Vitamin'
    ];
    const catAccCats = [];
    for (const name of catAccTypes) {
        const c = await Category.create({ name, parentId: accCat._id, slug: makeSlug(name) });
        catAccCats.push(c);
    }

    // Cấp 3: Chi tiết Phụ Kiện Khác
    const otherAccTypes = ['Thức Ăn Hạt & Cỏ', 'Lồng & Chuồng Nuôi', 'Vật Dụng Khác'];
    const otherAccCats = [];
    for (const name of otherAccTypes) {
        const c = await Category.create({ name, parentId: accOther._id, slug: makeSlug(name) });
        otherAccCats.push(c);
    }

    console.log('Đã tạo danh mục thành công...');

    // 4. TẠO SẢN PHẨM MẪU (THÚ CƯNG & PHỤ KIỆN)
    const products = [];

    // --- 20 PHỤ KIỆN MẪU ---
    // Phụ kiện Chó
    products.push({
        name: 'Hạt Royal Canin Poodle Adult', description: 'Thức ăn hạt cho chó Poodle trưởng thành.', price: 180000, 
        category: dogAccCats[0]._id, seller: sellerHCM._id, stock: 50, images: ['/uploads/default_accessory.jpg'], location: { city: 'HCM', district: 'Q1' }, healthStatus: 'approved', status: 'available'
    });
    products.push({
        name: 'Sữa Tắm SOS Chó Lông Trắng', description: 'Sữa tắm khử mùi, trắng lông.', price: 120000, 
        category: dogAccCats[1]._id, seller: sellerHN._id, stock: 30, images: ['/uploads/default_accessory.jpg'], location: { city: 'HN', district: 'Đống Đa' }, healthStatus: 'approved', status: 'available'
    });
    products.push({
        name: 'Chuồng Sắt Sơn Tĩnh Điện L', description: 'Chuồng lắp ghép tiện lợi.', price: 650000, 
        category: dogAccCats[2]._id, seller: sellerHCM._id, stock: 10, images: ['/uploads/default_accessory.jpg'], location: { city: 'HCM', district: 'Q3' }, healthStatus: 'approved', status: 'available'
    });
    products.push({
        name: 'Bóng Cao Su Đồ Chơi', description: 'Bóng ném siêu bền.', price: 50000, 
        category: dogAccCats[3]._id, seller: sellerHN._id, stock: 100, images: ['/uploads/default_accessory.jpg'], location: { city: 'HN', district: 'Cầu Giấy' }, healthStatus: 'approved', status: 'available'
    });

    // Phụ kiện Mèo
    products.push({
        name: 'Pate Whiskas Cá Biển', description: 'Pate mèo gói 85g.', price: 15000, 
        category: catAccCats[0]._id, seller: sellerHCM._id, stock: 200, images: ['/uploads/default_accessory.jpg'], location: { city: 'HCM', district: 'Q1' }, healthStatus: 'approved', status: 'available'
    });
    products.push({
        name: 'Cát Vệ Sinh Nhật Bản 8L', description: 'Cát vón cục, khử mùi chanh.', price: 60000, 
        category: catAccCats[1]._id, seller: sellerHN._id, stock: 150, images: ['/uploads/default_accessory.jpg'], location: { city: 'HN', district: 'Ba Đình' }, healthStatus: 'approved', status: 'available'
    });
    products.push({
        name: 'Balo Phi Hành Gia Trong Suốt', description: 'Balo vận chuyển mèo.', price: 250000, 
        category: catAccCats[2]._id, seller: sellerHCM._id, stock: 20, images: ['/uploads/default_accessory.jpg'], location: { city: 'HCM', district: 'Q7' }, healthStatus: 'approved', status: 'available'
    });
    products.push({
        name: 'Bàn Cào Móng Carton', description: 'Giúp mèo giải trí, mài móng.', price: 45000, 
        category: catAccCats[3]._id, seller: sellerHN._id, stock: 60, images: ['/uploads/default_accessory.jpg'], location: { city: 'HN', district: 'Tây Hồ' }, healthStatus: 'approved', status: 'available'
    });

    // Phụ kiện Khác
    products.push({
        name: 'Mùn Cưa Lót Chuồng Hamster', description: 'Mùn cưa thơm, thấm hút.', price: 30000, 
        category: otherAccCats[1]._id, seller: sellerHCM._id, stock: 50, images: ['/uploads/default_accessory.jpg'], location: { city: 'HCM', district: 'Bình Thạnh' }, healthStatus: 'approved', status: 'available'
    });
    products.push({
        name: 'Thức Ăn Hạt Cho Thỏ', description: 'Gói 500g.', price: 50000, 
        category: otherAccCats[0]._id, seller: sellerHN._id, stock: 40, images: ['/uploads/default_accessory.jpg'], location: { city: 'HN', district: 'Hoàn Kiếm' }, healthStatus: 'approved', status: 'available'
    });

    // Thêm các sản phẩm khác để đủ 20...
    for(let i=0; i<10; i++) {
        products.push({
            name: `Phụ kiện Random ${i}`, description: 'Mô tả mẫu.', price: 100000, 
            category: dogAccCats[0]._id, seller: sellerHCM._id, stock: 10, images: ['/uploads/default_accessory.jpg'], location: { city: 'HCM', district: 'Q1' }, healthStatus: 'approved', status: 'available'
        });
    }

    // --- TẠO THÚ CƯNG MẪU (Để tab Thú cưng không bị trống) ---
    // (Lấy đại ID danh mục chó mèo ở trên để tạo vài con)
    // ... Phần này bạn có thể copy lại logic tạo thú cưng từ file seeder cũ nếu muốn đầy đủ 40 con
    // Ở đây tôi tạo nhanh 5 con để demo
    const dogCatId = (await Category.findOne({ name: 'Chó Poodle' }))._id;
    for(let i=0; i<5; i++) {
        products.push({
            name: `Chó Poodle ${i}`, description: 'Chó khỏe.', price: 5000000, 
            category: dogCatId, seller: sellerHN._id, stock: 1, images: ['/uploads/default_dog.jpg'], location: { city: 'HN', district: 'Đống Đa' }, healthStatus: 'approved', status: 'available',
            age: '2 tháng', gender: 'Đực', breed: 'Poodle'
        });
    }

    await Pet.insertMany(products);
    console.log(`✅ Đã tạo thành công ${products.length} sản phẩm!`);
    process.exit();

  } catch (error) {
    console.error(`❌ Lỗi: ${error.message}`);
    process.exit(1);
  }
};

importData();