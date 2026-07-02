 const Review = require("../models/Review");

// Add Review
 exports.addReview = async (req, res) => {

  console.log("===== REVIEW BODY =====");
  console.log(req.body);

  try {
    const { foodId, rating, comment } = req.body;

    const review = await Review.create({
      user: req.user.id,
      foodId: foodId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review Added Successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Reviews By Food
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      foodId: req.params.foodId,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Review
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review Not Found",
      });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review Updated",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};