const express = require('express');
const router = express.Router();
const { createPaymentUrl, vnpayReturn, vnpayIpn } = require('../controllers/paymentController');

router.post('/create_payment_url', createPaymentUrl);
router.get('/vnpay_return', vnpayReturn);
router.get('/vnpay_ipn', vnpayIpn);

module.exports = router;