const express = require("express");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

const {
  addFood,
  getFoods,
  getFood,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");

const auth = require("../middleware/authMiddleware");

// Public
router.get("/", getFoods);
router.get("/:id", getFood);

// Protected
router.post("/", auth,admin, addFood);
router.put("/:id", auth,admin, updateFood);
router.delete("/:id", auth,admin, deleteFood);

module.exports = router;