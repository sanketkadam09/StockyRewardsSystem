const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stockSymbol: { type: String, uppercase: true },
  feeType: { type: String }, 
  amount: { type: mongoose.Decimal128, required: true },
  transactionType: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ledger', ledgerSchema);
