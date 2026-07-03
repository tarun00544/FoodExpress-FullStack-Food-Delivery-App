const Cart = require("../models/Cart");

// Add Item to Cart
exports.addToCart = async (req, res) => {
  try {
    const { food, quantity } = req.body;

    const cartItem = await Cart.create({
      user: req.user.id,
      food,
      quantity,
    });

    res.status(201).json({
      success: true,
      message: "Item Added To Cart",
      cartItem,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get User Cart
exports.getCart = async (req, res) => {
  try {

    const cart = await Cart.find({
      user: req.user.id,
    }).populate("food");

    res.json({
      success: true,
      cart,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Item
exports.removeCartItem = async (req, res) => {
  try {

    await Cart.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Item Removed",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Cart Quantity
exports.updateCartItem = async (req, res) => {
  try {

    const { quantity } = req.body;

    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart Item Not Found",
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    res.json({
      success: true,
      message: "Cart Item Updated",
      cartItem,
    });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};

// Clear User Cart
exports.clearCart = async (req, res) => {
  try {

    await Cart.deleteMany({
      user: req.user.id
    });

    res.json({
      success: true,
      message: "Cart Cleared"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};