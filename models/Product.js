const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
name: {type: String, required: true},
description: String,
price: {type: Number, required: true},
category: String,
subCategory: String,
stock: {type: Number, default: 0},
variants: [
    {
        color: String,
        size: String,
        stock: {type: Number, default: 0},
    },
],
image: [String],
createdAt: {type: Date, default: Date.now},
updatedAt: {type: Date, default: Date.now},

});

module.exprts = mongoose.model("Product", productSchema);