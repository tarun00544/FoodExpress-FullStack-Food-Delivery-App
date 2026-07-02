const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

     paymentMethod: {
    type: String,
    enum: [
        "Cash on Delivery",
        "UPI",
        "Credit / Debit Card"
    ],
    default: "Cash on Delivery",
},
    

  paymentDate:{
    type: Date
  }, 
  
    razorpayOrderId: {
    type: String,
},

razorpayPaymentId: {
    type: String,
},

paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
},

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);