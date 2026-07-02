 const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

router.post("/", auth, addReview);

router.get("/:foodId", getReviews);

router.put("/:id", auth, updateReview);

router.delete("/:id", auth, deleteReview);

module.exports = router;