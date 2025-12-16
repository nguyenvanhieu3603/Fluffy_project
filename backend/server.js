const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
connectDB();

const app = express();

// --- Middlewares ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: true, 
    credentials: true 
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
// Route Chat mới
app.use('/api/chat', require('./routes/chatRoutes'));

app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// --- 2. TẠO SERVER SOCKET ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // URL Frontend của bạn
        methods: ["GET", "POST"]
    }
});

// --- 3. XỬ LÝ SOCKET CONNECTION ---
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User tham gia vào room riêng của mình (dựa theo UserID) để nhận thông báo
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    // Tham gia vào room chat cụ thể
    socket.on("join_chat", (room) => {
        socket.join(room);
        console.log("User joined room: " + room);
    });

    // Gửi tin nhắn
    socket.on("new_message", (newMessageReceived) => {
        var conversation = newMessageReceived.conversationId;
        // Gửi cho tất cả người trong room đó (trừ người gửi)
        socket.in(conversation).emit("message_received", newMessageReceived);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

const PORT = process.env.PORT || 5000;

// Thay app.listen bằng server.listen
server.listen(PORT, () => {
    console.log(`Server đang chạy tại port ${PORT}`);
});