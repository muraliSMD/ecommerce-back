const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

//Get all products
router.get("/", async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

//Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(404).json({ message: "Product not found", error });
  }
});

//Create a new product (Admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: "Bad request", error });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        );

        if(!updatedProduct) return res.status(404).json({ message: "Product not found"});
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({message: "Bad Request", error});
    }
});

//delete a product (Admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const deleteProduct = await Product.findByIdAndDelete(req.params.id);
        if(!deleteProduct) return res.status(404).jsso({ message: "Product not found" });
        res.json({ message: "Pdouct deletd Successfully"});
    } catch (error) {
        res.status(400).json({ message :"Bad Request", error});
    }
});

module.exports = router;

