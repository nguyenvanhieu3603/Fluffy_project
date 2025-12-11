const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

// --- Middlewares ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cấu hình CORS mở rộng để tránh lỗi upload
app.use(cors({
    origin: true, 
    credentials: true 
}));

// --- Cấu hình thư mục tĩnh cho ảnh (QUAN TRỌNG) ---
// Giúp truy cập: http://localhost:5000/uploads/ten-anh.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// --- Error Handling ---
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack); // Log lỗi ra terminal để debug
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server đang chạy tại port ${PORT}`);
});