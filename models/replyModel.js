const mongoose = require("mongoose");

const replySchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "reply" }]
});

module.exports = mongoose.model("Reply", replySchema, "reply");