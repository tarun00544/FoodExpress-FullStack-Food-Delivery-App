const Order = require("../models/Order");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { items, totalPrice, address, paymentMethod } = req.body;

    const order = await Order.create({
      user: req.user.id,
      items,
      totalPrice,
      address,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get My Orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.foodId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Single Order
exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.foodId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update Status
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    res.json({
      success: true,
      message: "Order Updated",
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    res.json({
      success: true,
      message: "Order Deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================
// Update Order Status (Admin)
// =====================================

exports.updateOrderStatus = async (req, res) => {

    try {

        const order = await Order.findById(req.params.id);

        if (!order) {

            return res.status(404).json({
                success: false,
                message: "Order Not Found",
            });

        }

        order.status = req.body.status;

        await order.save();

        res.status(200).json({

            success: true,

            message: "Order Status Updated",

            order,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};