const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid Amount",
      });
    }

    const options = {
      amount: amount * 100, // Razorpay uses paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment Verification Failed",
      });
    }
    
     console.log(req.body);
    if (
    !orderData ||
    !orderData.items ||
    !Array.isArray(orderData.items)
) {
    return res.status(400).json({
        success: false,
        message: "Invalid Order Data"
    });
} 

console.log(orderData);
    // Save Order
     const order = await Order.create({

    user: req.user.id,

    items: orderData.items,

    totalPrice: orderData.totalPrice,

    address: orderData.address,

    phone: orderData.phone,

    paymentMethod: orderData.paymentMethod,

    paymentStatus: "Paid",

    paymentDate: new Date(), 

    razorpayOrderId: razorpay_order_id,

    razorpayPaymentId: razorpay_payment_id,

    status: "Pending"

});

    // Clear Cart
    await Cart.deleteMany({
      user: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Payment Successful",
      order,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

     

  }

 

};

