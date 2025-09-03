const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: {type: String, required: true, unique: true},
    discount: {type: String, required: true, },
    expiresAt: Date,
    usageLimit  : Number,
    usedBy: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    createdAt: {type: Date, default: Date.now},
});

module.exports = mongoose.model("Coupon", couponSchema);