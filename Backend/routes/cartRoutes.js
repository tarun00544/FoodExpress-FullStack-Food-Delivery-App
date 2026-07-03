const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
  clearCart,
} = require("../controllers/cartController");

router.post("/", auth, addToCart);

router.get("/", auth, getCart);

router.delete("/clear", auth, clearCart);

router.delete("/:id", auth, removeCartItem);

router.put("/:id", auth, updateCartItem);

 

module.exports = router;