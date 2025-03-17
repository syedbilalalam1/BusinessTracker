const mongoose = require("mongoose");

const StockHistorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['add', 'remove'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['purchase', 'return', 'damage', 'correction', 'other']
  },
  notes: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const StockHistory = mongoose.model("stockHistory", StockHistorySchema);
module.exports = StockHistory; 