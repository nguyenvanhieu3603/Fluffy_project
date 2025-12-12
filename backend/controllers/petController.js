const Pet = require('../models/petModel');
const Category = require('../models/categoryModel'); 
const User = require('../models/userModel');

// ... (Giữ nguyên các hàm getPets, getPetById)
// @desc    Lấy danh sách thú cưng (Lọc, Tìm kiếm, Phân trang, Sắp xếp)
// @route   GET /api/pets
// @access  Public
const getPets = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;

    // 1. Xử lý Từ khóa tìm kiếm
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    // 2. Xử lý Lọc Danh mục (NÂNG CẤP: Hỗ trợ 1 ID hoặc Nhiều ID)
    let categoryFilter = {};
    
    if (req.query.category) {
        const ids = req.query.category.split(',');

        if (ids.length > 1) {
            categoryFilter = { category: { $in: ids } };
        } else {
            try {
                const currentCat = await Category.findById(ids[0]);
                
                if (currentCat) {
                    const level2Cats = await Category.find({ parentId: currentCat._id });
                    const level2Ids = level2Cats.map(c => c._id);

                    const level3Cats = await Category.find({ parentId: { $in: level2Ids } });
                    const level3Ids = level3Cats.map(c => c._id);
                    
                    const allCatIds = [currentCat._id, ...level2Ids, ...level3Ids];
                    
                    categoryFilter = { category: { $in: allCatIds } };
                } else {
                    categoryFilter = { category: ids[0] };
                }
            } catch (err) {
                console.error("Lỗi ID danh mục:", err);
                categoryFilter = {}; 
            }
        }
    }
    
    // 3. Xử lý Lọc Giá
    const priceFilter = {};
    if (req.query.minPrice || req.query.maxPrice) {
        priceFilter.price = {};
        if (req.query.minPrice) priceFilter.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) priceFilter.price.$lte = Number(req.query.maxPrice);
    }

    const genderFilter = req.query.gender ? { gender: req.query.gender } : {};
    const breedFilter = req.query.breed ? { breed: { $regex: req.query.breed, $options: 'i' } } : {};
    const locationFilter = req.query.city ? { 'location.city': { $regex: req.query.city, $options: 'i' } } : {};

    const baseCondition = { 
        status: 'available',
        healthStatus: 'approved',
        ...keyword,
        ...categoryFilter,
        ...priceFilter,
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

// @desc    Lấy chi tiết 1 thú cưng
// @route   GET /api/pets/:id
// @access  Public
const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
        .populate('seller', 'fullName sellerInfo.shopName sellerInfo.shopAddress avatar email phone')
        // Populate lồng nhau: Lấy category hiện tại VÀ lấy luôn cả cha của nó (parentId)
        .populate({
            path: 'category',
            select: 'name parentId', 
            populate: {
                path: 'parentId', // Lấy thông tin của danh mục cha
                select: 'name'
            }
        });

    if (pet) {
      pet.views = (pet.views || 0) + 1;
      await pet.save();
      res.json(pet);
    } else {
      res.status(404).json({ message: 'Không tìm thấy thú cưng này' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tạo thú cưng mới (Seller)
const createPet = async (req, res) => {
  try {
    // --- MỚI: Thêm weight, length vào destructuring ---
    const { name, description, price, category, stock, age, gender, breed, weight, length } = req.body;

    const imageFiles = req.files && req.files['images'] ? req.files['images'] : [];
    
    if (imageFiles.length === 0) {
        return res.status(400).json({ message: 'Vui lòng upload ít nhất 1 ảnh sản phẩm' });
    }

    const certFile = req.files && req.files['certification'] ? req.files['certification'][0] : null;
    let certPath = '';

    if (breed && !certFile) {
        return res.status(400).json({ message: 'Bắt buộc tải lên Giấy chứng nhận sức khỏe cho thú cưng' });
    }

    if (certFile) {
        certPath = `/uploads/${certFile.filename}`;
    }

    const imageUrls = imageFiles.map(file => `/uploads/${file.filename}`);

    const seller = await User.findById(req.user._id);
    const shopAddress = seller.sellerInfo?.shopAddress || '';
    const addressParts = shopAddress.split(',').map(part => part.trim());
    const city = addressParts.length > 0 ? addressParts[addressParts.length - 1] : 'Toàn quốc';
    const district = addressParts.length > 1 ? addressParts[addressParts.length - 2] : 'Khác';

    const pet = new Pet({
      name, description, price, category, stock,
      seller: req.user._id,
      images: imageUrls,
      age, gender, breed,
      weight, length, // --- MỚI: Lưu vào DB ---
      location: { city, district },
      healthInfo: {
          vaccinationCertificate: certPath
      },
      healthStatus: 'pending', 
      status: 'available'
    });

    const createdPet = await pet.save();
    res.status(201).json(createdPet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật thú cưng (Seller)
const updatePet = async (req, res) => {
  try {
    // --- MỚI: Thêm weight, length ---
    const { name, description, price, stock, status, age, gender, weight, length } = req.body;
    const pet = await Pet.findById(req.params.id);

    if (pet) {
      if (pet.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Bạn không có quyền sửa sản phẩm này' });
      }
      pet.name = name || pet.name;
      pet.description = description || pet.description;
      pet.price = price || pet.price;
      pet.stock = stock || pet.stock;
      pet.status = status || pet.status;
      
      // Update thông tin chi tiết
      if (age) pet.age = age;
      if (gender) pet.gender = gender;
      if (weight) pet.weight = weight; // --- MỚI ---
      if (length) pet.length = length; // --- MỚI ---

      const updatedPet = await pet.save();
      res.json(updatedPet);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... (Giữ nguyên deletePet, approveHealthCheck, getMyPets, getPendingPets)
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (pet) {
      if (pet.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Bạn không có quyền xóa sản phẩm này' });
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
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ seller: req.user._id }).populate('category', 'name').sort({ createdAt: -1 });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingPets = async (req, res) => {
    try {
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