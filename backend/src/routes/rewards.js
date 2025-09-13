const express = require('express');
const router = express.Router();
const {
  addReward,
  getTodaysRewards,
  getHistoricalINR,
  getUserStats,
  getPortfolioDetails,
} = require('../controllers/rewardController');

// POST /api/rewards
router.post('/', addReward);

// GET /api/rewards/today-stocks/:userId 
router.get('/today-stocks/:userId', getTodaysRewards);

// GET /api/rewards/historical-inr/:userId 
router.get('/historical-inr/:userId', getHistoricalINR);

// GET /api/rewards/stats/:userId 
router.get('/stats/:userId', getUserStats);

// GET /api/rewards/portfolio/:userId -
router.get('/portfolio/:userId', getPortfolioDetails);

module.exports = router;
