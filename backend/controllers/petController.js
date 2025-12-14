const Pet = require('../models/petModel');
const Category = require('../models/categoryModel'); 
const User = require('../models/userModel');

// @desc    Lấy danh sách sản phẩm (Hỗ trợ lọc theo type)
const getPets = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;

    // Lọc theo từ khóa
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: 'i' } }
      : {};

    // Lọc theo Danh mục
    let categoryFilter = {};
    if (req.query.category) {
        const ids = req.query.category.split(',');
        if (ids.length > 1) {
            categoryFilter = { category: { $in: ids } };
        } else {
            try {
                const currentCat = await Category.findById(ids[0]);
                if (currentCat) {
                    // Lấy cả danh mục con
                    const level2Cats = await Category.find({ parentId: currentCat._id });
                    const level2Ids = level2Cats.map(c => c._id);
                    const level3Cats = await Category.find({ parentId: { $in: level2Ids } });
                    const level3Ids = level3Cats.map(c => c._id);
                    const allCatIds = [currentCat._id, ...level2Ids, ...level3Ids];
                    categoryFilter = { category: { $in: allCatIds } };
                } else {
                    categoryFilter = { category: ids[0] };
                }
            } catch (err) { categoryFilter = {}; }
        }
    }
    
    // Lọc theo Giá
    const priceFilter = {};
    if (req.query.minPrice || req.query.maxPrice) {
        priceFilter.price = {};
        if (req.query.minPrice) priceFilter.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) priceFilter.price.$lte = Number(req.query.maxPrice);
    }

    // --- MỚI: Lọc theo Type (pet/accessory) ---
    const typeFilter = req.query.type ? { type: req.query.type } : {};

    const genderFilter = req.query.gender ? { gender: req.query.gender } : {};
    const breedFilter = req.query.breed ? { breed: { $regex: req.query.breed, $options: 'i' } } : {};
    const locationFilter = req.query.city ? { 'location.city': { $regex: req.query.city, $options: 'i' } } : {};

    // Điều kiện cơ bản: Phải available VÀ (đã duyệt HOẶC là phụ kiện)
    const baseCondition = { 
        status: 'available',
        $or: [
            { healthStatus: 'approved' },
            { healthStatus: 'not_required' } // Phụ kiện sẽ rơi vào đây
        ],
        ...keyword,
        ...categoryFilter,
        ...priceFilter,
        ...typeFilter, // <--- Apply type filter
        ...genderFilter,
        ...breedFilter,
        ...locationFilter
    };

    let sortOption = { createdAt: -1 };
    if (req.query.sort) {
        switch (req.query.sort) {
            case 'price-asc': sortOption = { price: 1 }; break;
            case 'price-desc': sortOption = { price: -1 }; break;
            case 'oldest': sortOption = { createdAt: 1 }; break;
            default: sortOption = { createdAt: -1 };
        }
    }

    const count = await Pet.countDocuments(baseCondition);
    const pets = await Pet.find(baseCondition)
      .populate('category', 'name slug')
      .populate('seller', 'fullName sellerInfo.shopName avatar')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(sortOption);

    res.json({ pets, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
        .populate('seller', 'fullName sellerInfo.shopName sellerInfo.shopAddress avatar email phone')
        .populate({
            path: 'category',
            select: 'name parentId', 
            populate: { path: 'parentId', select: 'name' }
        });

    if (pet) {
      pet.views = (pet.views || 0) + 1;
      await pet.save();
      res.json(pet);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tạo sản phẩm mới (Thú cưng hoặc Phụ kiện)
const createPet = async (req, res) => {
  try {
    const { 
        name, description, price, category, stock, 
        type, // 'pet' hoặc 'accessory'
        age, gender, breed, weight, length 
    } = req.body;

    const imageFiles = req.files && req.files['images'] ? req.files['images'] : [];
    if (imageFiles.length === 0) return res.status(400).json({ message: 'Vui lòng upload ít nhất 1 ảnh' });

    const imageUrls = imageFiles.map(file => `/uploads/${file.filename}`);
    
    // Xử lý địa chỉ shop
    const seller = await User.findById(req.user._id);
    const shopAddress = seller.sellerInfo?.shopAddress || '';
    const addressParts = shopAddress.split(',').map(part => part.trim());
    const city = addressParts.length > 0 ? addressParts[addressParts.length - 1] : 'Toàn quốc';
    const district = addressParts.length > 1 ? addressParts[addressParts.length - 2] : 'Khác';

    // --- LOGIC PHÂN LOẠI ---
    let healthStatus = 'pending';
    let healthInfo = {};

    if (type === 'accessory') {
        // Nếu là phụ kiện: Không cần duyệt sức khỏe
        healthStatus = 'not_required';
    } else {
        // Nếu là thú cưng: Bắt buộc có giấy tờ
        const certFile = req.files && req.files['certification'] ? req.files['certification'][0] : null;
        if (!certFile) {
            return res.status(400).json({ message: 'Bắt buộc tải lên Giấy chứng nhận sức khỏe cho thú cưng' });
        }
        healthInfo = { vaccinationCertificate: `/uploads/${certFile.filename}` };
        healthStatus = 'pending';
    }

    const newProduct = new Pet({
      type: type || 'pet', // Mặc định là pet nếu không gửi
      name, description, price, category, stock,
      seller: req.user._id,
      images: imageUrls,
      location: { city, district },
      status: 'available',
      
      // Các trường này chỉ có ý nghĩa nếu type='pet'
      age, gender, breed, weight, length,
      healthInfo,
      healthStatus
    });

    const createdProduct = await newProduct.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePet = async (req, res) => {
  try {
    const { name, description, price, stock, status, age, gender, weight, length } = req.body;
    const pet = await Pet.findById(req.params.id);

    if (pet) {
      if (pet.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Không có quyền sửa' });
      }

      pet.name = name || pet.name;
      pet.description = description || pet.description;
      pet.price = price || pet.price;
      pet.stock = stock || pet.stock;
      pet.status = status || pet.status;
      
      // Chỉ update thông số thú cưng nếu sản phẩm là thú cưng
      if (pet.type === 'pet') {
          if (age) pet.age = age;
          if (gender) pet.gender = gender;
          if (weight) pet.weight = weight;
          if (length) pet.length = length;
      }

      // Update ảnh
      if (req.files && req.files['images'] && req.files['images'].length > 0) {
          const imageFiles = req.files['images'];
          pet.images = imageFiles.map(file => `/uploads/${file.filename}`);
      }

      // Update giấy tờ (chỉ cho pet)
      if (pet.type === 'pet' && req.files && req.files['certification']) {
          const certFile = req.files['certification'][0];
          pet.healthInfo.vaccinationCertificate = `/uploads/${certFile.filename}`;
          pet.healthStatus = 'pending'; // Reset về chờ duyệt khi đổi giấy tờ
      }

      const updatedPet = await pet.save();
      res.json(updatedPet);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (pet) {
      if (pet.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Không có quyền xóa' });
      }
      await pet.deleteOne();
      res.json({ message: 'Đã xóa sản phẩm' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveHealthCheck = async (req, res) => {
    try {
        const { status } = req.body; 
        const pet = await Pet.findById(req.params.id);
        if(pet) {
            pet.healthStatus = status;
            pet.verifiedBy = req.user._id;
            await pet.save();
            res.json({ message: `Đã cập nhật trạng thái: ${status}` });
        } else {
            res.status(404).json({ message: 'Không tìm thấy' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyPets = async (req, res) => {
  try {
    // Trả về tất cả sản phẩm của người bán (cả pet và accessory)
    const pets = await Pet.find({ seller: req.user._id }).populate('category', 'name').sort({ createdAt: -1 });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingPets = async (req, res) => {
    try {
        // Chỉ lấy những sản phẩm có status = pending (Thú cưng đang chờ duyệt)
        const pets = await Pet.find({ healthStatus: 'pending' })
            .populate('seller', 'fullName email sellerInfo.shopName')
            .populate('category', 'name')
            .sort({ createdAt: 1 });
        res.json(pets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  approveHealthCheck,
  getMyPets,
  getPendingPets
};