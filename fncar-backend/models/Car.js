const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    brand: String,
    model: String,
    year: Number,
});

module.exports = mongoose.model("Car", CarSchema);