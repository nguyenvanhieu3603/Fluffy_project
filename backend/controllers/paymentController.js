const moment = require('moment');
const qs = require('qs');
const crypto = require('crypto');
const vnpayConfig = require('../config/vnpayConfig');
const Order = require('../models/orderModel');
// Không cần import Pet nữa

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
		    str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// @desc    Tạo URL thanh toán VNPAY
const createPaymentUrl = async (req, res) => {
    try {
        const { orderId, amount, bankCode, language } = req.body;
        
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        const tmnCode = vnpayConfig.vnp_TmnCode;
        const secretKey = vnpayConfig.vnp_HashSecret;
        let vnpUrl = vnpayConfig.vnp_Url;
        const returnUrl = vnpayConfig.vnp_ReturnUrl;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = language || 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId; 
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; 
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        if(bankCode !== null && bankCode !== '' && bankCode !== undefined){
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        
        vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        res.status(200).json({ paymentUrl: vnpUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xử lý kết quả trả về từ VNPAY (Return URL)
const vnpayReturn = async (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = vnpayConfig.vnp_HashSecret;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

    if(secureHash === signed){
        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];

        if(rspCode === '00') {
            try {
                const order = await Order.findById(orderId);
                if(order) {
                    if (!order.isPaid) {
                        order.isPaid = true;
                        order.paidAt = Date.now();
                        order.paymentResult = {
                            id: orderId,
                            status: 'success',
                            update_time: Date.now(),
                            email_address: order.shippingInfo?.email
                        };
                        await order.save();
                        // KHÔNG CẦN TRỪ KHO Ở ĐÂY NỮA
                    }
                }
                res.redirect(`http://localhost:5173/order/${orderId}?payment=success`);
            } catch (error) {
                console.error(error);
                res.redirect(`http://localhost:5173/order/${orderId}?payment=error`);
            }
        } else {
            res.redirect(`http://localhost:5173/order/${orderId}?payment=failed`);
        }
    } else {
        res.redirect(`http://localhost:5173/?payment=checksum_failed`);
    }
};

// @desc    IPN (Instant Payment Notification)
const vnpayIpn = async (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    
    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = vnpayConfig.vnp_HashSecret;
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    
    if(secureHash === signed){
        const order = await Order.findById(orderId);
        if(order){
            if(rspCode === '00'){
                if (!order.isPaid) {
                    order.isPaid = true;
                    order.paidAt = Date.now();
                    await order.save();
                    // KHÔNG CẦN TRỪ KHO Ở ĐÂY NỮA
                }
                res.status(200).json({RspCode: '00', Message: 'Success'});
            } else {
                res.status(200).json({RspCode: '00', Message: 'Success'});
            }
        } else {
            res.status(200).json({RspCode: '01', Message: 'Order not found'});
        }
    } else {
        res.status(200).json({RspCode: '97', Message: 'Checksum failed'});
    }
};

module.exports = {
    createPaymentUrl,
    vnpayReturn,
    vnpayIpn
};