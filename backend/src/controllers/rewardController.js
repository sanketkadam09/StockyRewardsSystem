const Reward = require('../models/Reward');
const User = require('../models/User');
const Ledger = require('../models/Ledger');
const mongoose = require('mongoose');

// Helper: Simulate fetching current stock price
async function getCurrentStockPrice(stockSymbol) {
  // For demo: return random price around 2500 for RELIANCE etc.
  const basePrices = {
    RELIANCE: 2500,
    TCS: 3100,
    INFOSYS: 1500,
  };
  const base = basePrices[stockSymbol.toUpperCase()] || 1000;
  return (base * (0.95 + Math.random() * 0.1)).toFixed(4);
}

// POST /api/rewards - create reward
exports.addReward = async (req, res) => {
  try {
    const { userId, stockSymbol, quantity, rewardType, rewardReason } = req.body;
    if (!userId || !stockSymbol || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Get price
    const priceAtReward = await getCurrentStockPrice(stockSymbol);
    const totalValue = (priceAtReward * quantity).toFixed(4);

    // Create reward
    const reward = await Reward.create({
      userId,
      stockSymbol: stockSymbol.toUpperCase(),
      quantity,
      priceAtReward,
      totalValue,
      rewardType,
      rewardReason,
    });

    // Add fee entry to ledger (simple fixed 0.4% fee example)
    const feeAmount = (totalValue * 0.004).toFixed(4);
    await Ledger.create({
      userId,
      stockSymbol: stockSymbol.toUpperCase(),
      feeType: 'BROKERAGE',
      amount: feeAmount,
      transactionType: 'DEBIT',
      description: 'Brokerage fee (0.4%)',
    });

    res.json({ success: true, message: 'Reward created', data: reward });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/rewards/today-stocks/:userId - rewards today
exports.getTodaysRewards = async (req, res) => {
  try {
    const { userId } = req.params;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const rewardsToday = await Reward.find({
      userId,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    res.json({ success: true, data: rewardsToday });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getHistoricalINR = async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 7;

    // For simplicity, generate dummy historical data for past 'days'
    const historicalData = [];
    for (let i = days; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      historicalData.push({
        date: date.toISOString().split('T')[0],
        value: (10000 + Math.random() * 5000).toFixed(4) // dummy value
      });
    }

    res.json({ success: true, data: historicalData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/rewards/stats/:userId - summary stats
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const rewardsToday = await Reward.find({
      userId,
      createdAt: {$gte: todayStart, $lte: todayEnd}
    });

    // Sum total shares for today grouped by stock symbol
    const sharesByStock = rewardsToday.reduce((acc, r) => {
      acc[r.stockSymbol] = (acc[r.stockSymbol] || 0) + parseFloat(r.quantity.toString());
      return acc;
    }, {});

    // Dummy current portfolio INR value - You can calculate actual from latest prices and holdings
    const currentPortfolioValue = 30000 + Math.random() * 10000;

    res.json({
      success: true,
      data: {
        totalSharesToday: sharesByStock,
        currentPortfolioINR: currentPortfolioValue.toFixed(4)
      }
    });
  } catch (error) {
    res.status(500).json({ success:false, message: error.message });
  }
};

// GET /api/rewards/portfolio/:userId 
exports.getPortfolioDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all rewards for user grouped by stock symbol
    const rewards = await Reward.find({ userId });

    // Aggregate holdings
    const holdings = {};
    rewards.forEach(r => {
      if (!holdings[r.stockSymbol]) {
        holdings[r.stockSymbol] = {
          quantity: 0,
          totalCost: 0,
          rewards: [],
          firstRewardDate: r.createdAt,
          lastRewardDate: r.createdAt,
        };
      }
      holdings[r.stockSymbol].quantity += parseFloat(r.quantity.toString());
      holdings[r.stockSymbol].totalCost += parseFloat(r.totalValue.toString());
      holdings[r.stockSymbol].rewards.push({
        id: r._id,
        quantity: r.quantity,
        priceAtReward: r.priceAtReward,
        rewardType: r.rewardType,
        rewardReason: r.rewardReason,
        timestamp: r.createdAt
      });
      if (r.createdAt < holdings[r.stockSymbol].firstRewardDate) holdings[r.stockSymbol].firstRewardDate = r.createdAt;
      if (r.createdAt > holdings[r.stockSymbol].lastRewardDate) holdings[r.stockSymbol].lastRewardDate = r.createdAt;
    });

    // Simulate fetching current price; calculate gains/losses
    const portfolioSummary = {
      holdings: [],
      totalCurrentValue: 0,
      totalCostValue: 0,
      totalGainLoss: 0,
    };

    for (const [stockSymbol, data] of Object.entries(holdings)) {
      const currentPrice = await getCurrentStockPrice(stockSymbol);
      const currentValue = currentPrice * data.quantity;
      const gainLoss = currentValue - data.totalCost;

      portfolioSummary.holdings.push({
        stockSymbol,
        quantity: data.quantity,
        avgCostPrice: data.totalCost / data.quantity,
        currentPrice,
        totalCostValue: data.totalCost,
        currentValue,
        gainLoss,
        rewardCount: data.rewards.length,
        firstRewardDate: data.firstRewardDate,
        lastRewardDate: data.lastRewardDate,
        rewards: data.rewards,
      });

      portfolioSummary.totalCurrentValue += currentValue;
      portfolioSummary.totalCostValue += data.totalCost;
      portfolioSummary.totalGainLoss += gainLoss;
    }

    res.json({ success: true, data: { userId, portfolioSummary } });
  } catch (error) {
    res.status(500).json({ success:false, message: error.message });
  }
};

// Reuse previous method to get current stock price
async function getCurrentStockPrice(stockSymbol) {
  const basePrices = {
    RELIANCE: 2500,
    TCS: 3100,
    INFOSYS: 1500,
  };
  const base = basePrices[stockSymbol.toUpperCase()] || 1000;
  return parseFloat((base * (0.95 + Math.random() * 0.1)).toFixed(4));
}
