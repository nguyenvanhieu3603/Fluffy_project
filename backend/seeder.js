const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');
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

// Hàm sinh số ngẫu nhiên trong khoảng (min, max)
function getRandomRange(min, max, isFloat = false) {
    const val = Math.random() * (max - min) + min;
    return isFloat ? val.toFixed(1) : Math.floor(val);
}

const importData = async () => {
  try {
    // 1. Xóa dữ liệu cũ
    await Category.deleteMany();
    await Pet.deleteMany();
    // Không xóa User để tránh mất dữ liệu đăng nhập nếu bạn đang dùng
    console.log('--- Đã dọn dẹp dữ liệu cũ ---');

    // 2. Tạo/Lấy User (Shop Hà Nội)
    let sellerHN = await User.findOne({ email: 'seller_hanoi@gmail.com' });
    
    // Nếu chưa có thì tạo mới
    if (!sellerHN) {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash('123456', salt);
        sellerHN = await User.create({
            fullName: 'Pet Shop Hà Nội',
            email: 'seller_hanoi@gmail.com',
            password: hashPassword,
            role: 'seller',
            phone: '0988888888',
            avatar: '/uploads/default-avatar.jpg',
            sellerInfo: { 
                shopName: 'Hà Nội Pet Center', 
                shopAddress: '456 Đường Láng, Đống Đa, Hà Nội', 
                status: 'approved' 
            }
        });
        console.log('Đã tạo Seller Hà Nội...');
    }

    // 3. TẠO DANH MỤC (CATEGORIES)
    const petsRoot = await Category.create({ name: 'Thú Cưng', slug: 'thu-cung' });
    const accRoot = await Category.create({ name: 'Phụ Kiện', slug: 'phu-kien' });

    // --- DANH MỤC THÚ CƯNG ---
    const dogCat = await Category.create({ name: 'Chó Cảnh', parentId: petsRoot._id, slug: 'cho-canh' });
    const catCat = await Category.create({ name: 'Mèo Cảnh', parentId: petsRoot._id, slug: 'meo-canh' });
    const otherCat = await Category.create({ name: 'Thú Cưng Khác', parentId: petsRoot._id, slug: 'thu-khac' });

    // --- DANH MỤC PHỤ KIỆN ---
    const accDog = await Category.create({ name: 'Phụ Kiện Cho Chó', parentId: accRoot._id, slug: 'phu-kien-cho' });
    const accCat = await Category.create({ name: 'Phụ Kiện Cho Mèo', parentId: accRoot._id, slug: 'phu-kien-meo' });
    const accOther = await Category.create({ name: 'Phụ Kiện Thú Khác', parentId: accRoot._id, slug: 'phu-kien-khac' });

    // --- CẤU HÌNH DỮ LIỆU ĐỂ LOOP (Đã thêm minW, maxW, minL, maxL) ---
    
    // 1. Dữ liệu Giống Chó & Ảnh (Cân nặng: kg, Chiều dài: cm)
    const dogBreedsData = [
        { name: 'Chó Poodle', img: '/uploads/default_poodle.jpg', minW: 3, maxW: 8, minL: 25, maxL: 35 },
        { name: 'Chó Corgi', img: '/uploads/default_corgi.jpg', minW: 10, maxW: 14, minL: 50, maxL: 60 },
        { name: 'Chó Pug', img: '/uploads/default_pug.jpg', minW: 6, maxW: 9, minL: 35, maxL: 45 },
        { name: 'Chó Alaska', img: '/uploads/default_alaska.jpg', minW: 30, maxW: 45, minL: 80, maxL: 100 },
        { name: 'Chó Husky', img: '/uploads/default_husky.jpg', minW: 20, maxW: 28, minL: 75, maxL: 90 },
        { name: 'Chó Shiba', img: '/uploads/default_shiba.jpg', minW: 8, maxW: 12, minL: 55, maxL: 65 },
        { name: 'Chó Golden', img: '/uploads/default_golden.jpg', minW: 25, maxW: 35, minL: 85, maxL: 95 }
    ];

    // 2. Dữ liệu Giống Mèo & Ảnh
    const catBreedsData = [
        { name: 'Mèo Anh Lông Ngắn', img: '/uploads/default_meoanhlongngan.jpg', minW: 4, maxW: 7, minL: 40, maxL: 50 },
        { name: 'Mèo Ba Tư', img: '/uploads/default_meobatu.jpg', minW: 3, maxW: 5, minL: 35, maxL: 45 },
        { name: 'Mèo Munchkin', img: '/uploads/default_munchkin.jpg', minW: 2.5, maxW: 4, minL: 40, maxL: 50 },
        { name: 'Mèo Bengal', img: '/uploads/default_meobengal.jpg', minW: 4, maxW: 7, minL: 45, maxL: 55 },
        { name: 'Mèo Sphynx', img: '/uploads/default_sphynx.jpg', minW: 3, maxW: 5, minL: 40, maxL: 50 }
    ];

    // 3. Dữ liệu Thú Khác & Ảnh
    const otherBreedsData = [
        { name: 'Hamster', img: '/uploads/default_hamster.jpg', minW: 0.1, maxW: 0.2, minL: 10, maxL: 15 },
        { name: 'Thỏ Kiểng', img: '/uploads/default_tho.jpg', minW: 1.5, maxW: 3, minL: 30, maxL: 40 },
        { name: 'Nhím Kiểng', img: '/uploads/default_nhim.jpg', minW: 0.3, maxW: 0.6, minL: 15, maxL: 25 },
        { name: 'Rồng Nam Mỹ', img: '/uploads/default_rongnammy.jpg', minW: 0.5, maxW: 2, minL: 40, maxL: 80 }
    ];

    const products = [];

    // --- HÀM HELPER TẠO 4 CON (2 ĐỰC, 2 CÁI) ---
    const createPetBatch = async (breedData, parentCatId) => {
        // Tạo category cho giống này trước
        const category = await Category.create({ 
            name: breedData.name, 
            parentId: parentCatId, 
            slug: makeSlug(breedData.name) 
        });

        // Tạo 2 Đực
        for (let i = 1; i <= 2; i++) {
            products.push({
                type: 'pet', // QUAN TRỌNG
                name: `${breedData.name} Thuần Chủng Mã Đ${i}`,
                description: `Bé ${breedData.name} đực, ${2 + i} tháng tuổi. Ăn uống khỏe, đã tiêm phòng mũi 1. Bảo hành sức khỏe 7 ngày.`,
                price: 3000000 + (i * 500000), 
                category: category._id,
                seller: sellerHN._id,
                stock: 1,
                images: [breedData.img],
                location: { city: 'Hà Nội', district: 'Đống Đa' },
                status: 'available',
                
                // Pet Info - Random chỉ số
                age: `${2 + i} tháng`,
                gender: 'Đực',
                breed: breedData.name,
                weight: `${getRandomRange(breedData.minW, breedData.maxW, true)} kg`,
                length: `${getRandomRange(breedData.minL, breedData.maxL)} cm`,
                healthStatus: 'approved', // Đã duyệt
                healthInfo: { vaccinationCertificate: breedData.img } 
            });
        }

        // Tạo 2 Cái
        for (let i = 1; i <= 2; i++) {
            products.push({
                type: 'pet',
                name: `${breedData.name} Siêu Xinh Mã C${i}`,
                description: `Bé ${breedData.name} cái, ${2 + i} tháng tuổi, mặt xinh, dáng chuẩn. Đã sổ giun và tiêm phòng.`,
                price: 3500000 + (i * 500000),
                category: category._id,
                seller: sellerHN._id,
                stock: 1,
                images: [breedData.img],
                location: { city: 'Hà Nội', district: 'Hoàn Kiếm' },
                status: 'available',
                
                // Pet Info - Random chỉ số
                age: `${2 + i} tháng`,
                gender: 'Cái',
                breed: breedData.name,
                weight: `${getRandomRange(breedData.minW, breedData.maxW, true)} kg`,
                length: `${getRandomRange(breedData.minL, breedData.maxL)} cm`,
                healthStatus: 'approved',
                healthInfo: { vaccinationCertificate: breedData.img }
            });
        }
    };

    // --- THỰC HIỆN TẠO THÚ CƯNG ---
    console.log('Đang tạo dữ liệu thú cưng...');
    for (const breed of dogBreedsData) await createPetBatch(breed, dogCat._id);
    for (const breed of catBreedsData) await createPetBatch(breed, catCat._id);
    for (const breed of otherBreedsData) await createPetBatch(breed, otherCat._id);


    // --- TẠO PHỤ KIỆN (Dùng ảnh tương ứng) ---
    console.log('Đang tạo dữ liệu phụ kiện...');

    // 1. Phụ kiện Chó
    const dogAccList = [
        { name: 'Thức Ăn & Dinh Dưỡng', img: '/uploads/default_thucanchocho.jpg', items: ['Hạt Royal Canin', 'Pate Gan Ngỗng'] },
        { name: 'Chuồng & Vận Chuyển', img: '/uploads/default_chuongchomeo.jpg', items: ['Chuồng Inox', 'Túi Vận Chuyển'] },
        { name: 'Đồ Chơi & Huấn Luyện', img: '/uploads/default_dochoichomeo.jpg', items: ['Bóng Gai', 'Xương Gặm'] },
        { name: 'Thuốc & Y Tế', img: '/uploads/default_thuocchochomeo.jpg', items: ['Thuốc Trị Ve', 'Canxi Nano'] },
        { name: 'Vệ Sinh', img: '/uploads/default_khayvesinh.jpg', items: ['Khay Vệ Sinh', 'Tã Lót'] }
    ];

    for (const group of dogAccList) {
        const cat = await Category.create({ name: group.name, parentId: accDog._id, slug: makeSlug(group.name) });
        for (const item of group.items) {
            products.push({
                type: 'accessory', // QUAN TRỌNG
                name: `${item} Cho Chó`,
                description: `Sản phẩm ${item} chất lượng cao, an toàn cho thú cưng. Hàng chính hãng.`,
                price: 150000,
                category: cat._id,
                seller: sellerHN._id,
                stock: 50,
                images: [group.img], // Dùng ảnh đại diện nhóm
                location: { city: 'Hà Nội', district: 'Cầu Giấy' },
                status: 'available',
                healthStatus: 'not_required' // Phụ kiện không cần duyệt
            });
        }
    }

    // 2. Phụ kiện Mèo
    const catAccList = [
        { name: 'Thức Ăn & Pate', img: '/uploads/default_accessory.jpg', items: ['Hạt Catsrang', 'Súp Thưởng'] }, // Ảnh default cho thức ăn mèo nếu ko có ảnh riêng
        { name: 'Cát Vệ Sinh', img: '/uploads/default_khayvesinh.jpg', items: ['Cát Nhật Đen', 'Nhà Vệ Sinh'] },
        { name: 'Chuồng & Balo', img: '/uploads/default_chuongchomeo.jpg', items: ['Balo Phi Hành Gia', 'Lồng Tĩnh Điện'] },
        { name: 'Đồ Chơi', img: '/uploads/default_dochoichomeo.jpg', items: ['Cần Câu Mèo', 'Bàn Cào Móng'] },
        { name: 'Y Tế', img: '/uploads/default_thuocchochomeo.jpg', items: ['Vitamin Gel', 'Thuốc Nhỏ Mắt'] }
    ];

    for (const group of catAccList) {
        const cat = await Category.create({ name: group.name, parentId: accCat._id, slug: makeSlug(group.name) });
        for (const item of group.items) {
            products.push({
                type: 'accessory',
                name: `${item} Cho Mèo`,
                description: `${item} cao cấp dành cho hoàng thượng.`,
                price: 90000,
                category: cat._id,
                seller: sellerHN._id,
                stock: 100,
                images: [group.img],
                location: { city: 'Hà Nội', district: 'Ba Đình' },
                status: 'available',
                healthStatus: 'not_required'
            });
        }
    }

    // 3. Phụ kiện Khác
    const otherAccCat = await Category.create({ name: 'Lồng & Vật Dụng', parentId: accOther._id, slug: 'long-vat-dung' });
    products.push({
        type: 'accessory',
        name: 'Lồng Mica Hamster',
        description: 'Lồng nuôi hamster full phụ kiện.',
        price: 250000,
        category: otherAccCat._id,
        seller: sellerHN._id,
        stock: 20,
        images: ['/uploads/default_accessory.jpg'],
        location: { city: 'Hà Nội', district: 'Tây Hồ' },
        status: 'available',
        healthStatus: 'not_required'
    });

    // 4. Lưu tất cả vào DB
    await Pet.insertMany(products);
    
    console.log('✅ SEEDER CHẠY THÀNH CÔNG!');
    console.log(`- Tổng sản phẩm tạo ra: ${products.length}`);
    console.log('- Đã phân loại rõ ràng (Pet/Accessory), có Cân nặng/Chiều dài và gán ảnh chính xác.');
    
    process.exit();

  } catch (error) {
    console.error(`❌ Lỗi Seeder: ${error.message}`);
    process.exit(1);
  }
};

importData();