const Wishlist = require("../models/Wishlist");
const Food = require("../models/Food");

// =====================================
// Add To Wishlist
// =====================================
exports.addToWishlist = async (req, res) => {
  try {
    const { food } = req.body;

    if (!food) {
      return res.status(400).json({
        success: false,
        message: "Food ID is required",
      });
    }

    // Check food exists
    const foodExists = await Food.findById(food);

    if (!foodExists) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    // Already exists?
    const exists = await Wishlist.findOne({
      user: req.user.id,
      food,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Food already in wishlist",
      });
    }

    const wishlist = await Wishlist.create({
      user: req.user.id,
      food,
    });

    await wishlist.populate("food");

    res.status(201).json({
      success: true,
      message: "Added To Wishlist",
      wishlist,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =====================================
// Get Wishlist
// =====================================
exports.getWishlist = async (req, res) => {
  try {

    const wishlist = await Wishlist.find({
      user: req.user.id,
    })
      .populate("food")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =====================================
// Remove Wishlist Item
// =====================================
exports.removeWishlist = async (req, res) => {
  try {

    const item = await Wishlist.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Wishlist Item Not Found",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: "Removed From Wishlist",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};