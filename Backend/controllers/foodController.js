 const Food = require("../models/Food");

 const Review = require("../models/Review");

// ===============================
// Add Food
// ===============================
exports.addFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);

    res.status(201).json({
      success: true,
      message: "Food Added Successfully",
      food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get All Foods
// ===============================
exports.getFoods = async (req, res) => {
  try {

    let query = {};

    // Search
    if (req.query.keyword) {
      query.name = {
        $regex: req.query.keyword,
        $options: "i",
      };
    }

    // Category Filter
    if (req.query.category && req.query.category !== "All") {
      query.category = req.query.category;
    }

    // Price Filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};

      if (req.query.minPrice) {
        query.price.$gte = Number(req.query.minPrice);
      }

      if (req.query.maxPrice) {
        query.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    // Sorting
    let sortOption = { createdAt: -1 };

    switch (req.query.sort) {
      case "price":
        sortOption = { price: 1 };
        break;

      case "-price":
        sortOption = { price: -1 };
        break;

      case "name":
        sortOption = { name: 1 };
        break;

      case "-name":
        sortOption = { name: -1 };
        break;

      case "latest":
        sortOption = { createdAt: -1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    const totalFoods = await Food.countDocuments(query);
    
    let foods = await Food.find(query)
  .sort(sortOption)
  .skip(skip)
  .limit(limit);

foods = await Promise.all(
  foods.map(async (food) => {

    const reviews = await Review.find({
      foodId: food._id,
    });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    return {
      ...food.toObject(),
      rating: Number(averageRating.toFixed(1)),
      totalReviews,
    };

  })
);

    res.status(200).json({
      success: true,
      foods,
      count: foods.length,
      totalFoods,
      currentPage: page,
      totalPages: Math.ceil(totalFoods / limit),
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ===============================
// Get Single Food
// ===============================
exports.getFood = async (req, res) => {
  try {

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food Not Found",
      });
    }

    res.status(200).json({
      success: true,
      food,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ===============================
// Update Food
// ===============================
exports.updateFood = async (req, res) => {
  try {

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food Not Found",
      });
    }

    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Food Updated Successfully",
      food: updatedFood,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ===============================
// Delete Food
// ===============================
exports.deleteFood = async (req, res) => {
  try {

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food Not Found",
      });
    }

    await food.deleteOne();

    res.status(200).json({
      success: true,
      message: "Food Deleted Successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};