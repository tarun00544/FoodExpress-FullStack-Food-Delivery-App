const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");


const {
  createOrder,
  getOrders,
  getSingleOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

router.post("/", auth, createOrder);

router.get("/", auth, getOrders);

router.get("/:id", auth, getSingleOrder);

router.put("/:id", auth, updateOrder);

router.put(
    "/admin/:id",
    auth,
    admin,
    updateOrderStatus
);

router.delete("/:id", auth, deleteOrder);

module.exports = router;