const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Tạo transporter (người vận chuyển)
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Hoặc dùng host/port nếu không dùng gmail
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Lưu ý: Đây phải là App Password của Gmail, không phải pass đăng nhập thường
    },
  });

  // 2. Cấu hình email
  const mailOptions = {
    from: `"Fluffy Pet Shop" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // Nếu muốn gửi HTML đẹp thì dùng cái này sau
  };

  // 3. Gửi
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;