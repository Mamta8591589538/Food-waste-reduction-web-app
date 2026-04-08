const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  unit: String,
  purchaseDate: Date,
  expiryDate: Date,
  type: String,
  userId: String
});

module.exports = mongoose.model("Food", foodSchema);
