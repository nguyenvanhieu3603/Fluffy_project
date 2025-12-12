const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Tạo transporter (người vận chuyển)
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });

  // 2. Cấu hình email
  const mailOptions = {
    from: `"Fluffy Pet Shop" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    
  };

  // 3. Gửi
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;