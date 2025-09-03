const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    items: [
        {
            product : {type: mongoose.Schema.Types.ObjectId, ref:"Product", required: true},
            quantity: {type: Number, default: 1},
            variants: {
                color: String,
                size: String,
            }, 
        },
    ],
    cretaedAt: {type: Date, dafault: Date.now},
    updatedAt: {type:Date, default: Date.now},
});

module.exports = mongoose.model("Cart", cartSchema);