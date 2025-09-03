const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// -------------------
// CREATE order (checkout)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    const items = cart.items.map((i) => ({
      product: i.product._id,
      quantity: i.quantity,
      variant: i.variant,
      price: i.product.price,
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await new Order({
      user: req.user.id,
      items,
      totalAmount,
      paymentMethod: req.body.paymentMethod || "COD",
      shippingAddress: req.body.shippingAddress,
    }).save();

    // Reduce stock
    for (const i of items) {
      await Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------
// GET logged-in user's orders
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("items.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------
// GET all orders (admin)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate("items.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------
// UPDATE order status (admin)
router.put("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.orderStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------
// CANCEL order (user/admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (req.user.role !== "admin" && order.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    order.orderStatus = "cancelled";
    await order.save();
    res.json({ message: "Order cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
