const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// -------------------
// CREATE coupon (admin)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    const savedCoupon = await coupon.save();
    res.status(201).json(savedCoupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// -------------------
// GET all coupons (admin)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------
// UPDATE coupon (admin)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCoupon) return res.status(404).json({ message: "Coupon not found" });
    res.json(updatedCoupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// -------------------
// DELETE coupon (admin)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------
// APPLY coupon (customer)
router.post("/apply", authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    if (coupon.expiresAt && coupon.expiresAt < new Date())
      return res.status(400).json({ message: "Coupon expired" });
    if (coupon.usageLimit && coupon.usedBy.includes(req.user._id))
      return res.status(400).json({ message: "Coupon already used" });

    // Mark as used
    coupon.usedBy.push(req.user._id);
    await coupon.save();

    res.json({ message: "Coupon applied", discount: coupon.discount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
