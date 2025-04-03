const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
    },
    comment: {
        type: String,
    },
    reply: [{ type: mongoose.Schema.Types.ObjectId, ref: "reply" }],
    hide: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("Review", reviewSchema, "review");