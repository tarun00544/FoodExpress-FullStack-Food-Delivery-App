const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");


const {
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/paymentController");

// Create Razorpay Order
router.post("/create-order", auth, createPaymentOrder);

// Verify Payment
router.post("/verify-payment", auth, verifyPayment);

module.exports = router;