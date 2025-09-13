const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stockSymbol: { type: String, required: true, uppercase: true },
  quantity: { type: mongoose.Decimal128, required: true },
  priceAtReward: { type: mongoose.Decimal128, required: true },
  totalValue: { type: mongoose.Decimal128, required: true },
  rewardType: { type: String, required: true },
  rewardReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reward', rewardSchema);
