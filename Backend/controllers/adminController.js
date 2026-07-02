 const User = require("../models/User");
const Food = require("../models/Food");
const Order = require("../models/Order");
const Review = require("../models/Review");

// =========================================
// Dashboard Statistics
// =========================================
exports.getDashboard = async (req, res) => {
  try {

    const totalUsers = await User.countDocuments();
    const totalFoods = await Food.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalReviews = await Review.countDocuments();

    const paidOrders = await Order.countDocuments({
      paymentStatus: "Paid",
    });

    const failedPayments = await Order.countDocuments({
      paymentStatus: "Failed",
    });

    const pendingPayments = await Order.countDocuments({
      paymentStatus: "Pending",
    });

    const paidOrdersData = await Order.find({
      paymentStatus: "Paid",
    });

    const totalRevenue = paidOrdersData.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          paymentDate: {
            $gte: today,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);

    const todaysOrders = await Order.countDocuments({
      paymentDate: {
        $gte: today,
      },
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalFoods,
        totalOrders,
        totalReviews,

        totalRevenue,

        paidOrders,
        failedPayments,
        pendingPayments,

        todaysRevenue:
          todaysRevenue.length > 0
            ? todaysRevenue[0].total
            : 0,

        todaysOrders,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =========================================
// Recent Orders
// =========================================
exports.getRecentOrders = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.foodId", "name image price")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =========================================
// Get Users
// =========================================
exports.getUsers = async (req, res) => {
  try {

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    const users = await User.find(keyword).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =========================================
// Delete User
// =========================================
exports.deleteUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =========================================
// Change User Role
// =========================================
exports.changeUserRole = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    user.role = req.body.role;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Role Updated Successfully",
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =========================================
// Analytics
// =========================================
exports.getAnalytics = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("items.foodId");

    let totalRevenue = 0;
    let totalOrders = orders.length;
    let totalItemsSold = 0;

    orders.forEach((order) => {

      if (order.paymentStatus === "Paid") {
        totalRevenue += order.totalPrice;
      }

      order.items.forEach((item) => {
        totalItemsSold += item.quantity;
      });

    });

    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        totalItemsSold,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =========================================
// Payment Analytics
// =========================================
exports.getPaymentAnalytics = async (req, res) => {
  try {

    const paidOrders = await Order.countDocuments({
      paymentStatus: "Paid",
    });

    const failedPayments = await Order.countDocuments({
      paymentStatus: "Failed",
    });

    const pendingPayments = await Order.countDocuments({
      paymentStatus: "Pending",
    });

    res.status(200).json({
      success: true,
      paymentAnalytics: {
        paidOrders,
        failedPayments,
        pendingPayments,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};