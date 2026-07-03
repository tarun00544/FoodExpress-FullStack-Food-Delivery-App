const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");


const {
  getDashboard,
  getRecentOrders,
   getUsers,
  deleteUser,
  changeUserRole,
  getAnalytics,
  getAllOrders,
} = require("../controllers/adminController");

router.get("/dashboard", auth, admin, getDashboard);

router.get("/orders", auth, admin, getRecentOrders);
router.get("/orders/all", auth, admin, getAllOrders);

router.get("/users", auth, admin, getUsers);

router.delete("/users/:id", auth, admin, deleteUser);

router.put("/users/:id/role", auth, admin, changeUserRole);

router.get("/analytics", auth, admin, getAnalytics);

module.exports = router;