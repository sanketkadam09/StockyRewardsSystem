const Reward = require('../models/Reward');
const mongoose = require('mongoose');

let prices = {
  RELIANCE: 2500,
  TCS: 3100,
  INFOSYS: 1500,
  // Add more stocks as needed
};

// Function to simulate price updates
function updatePrices() {
  Object.keys(prices).forEach(symbol => {
    // Randomly adjust price by ±5%
    let changePercent = (Math.random() * 0.1) - 0.05;
    prices[symbol] = parseFloat((prices[symbol] * (1 + changePercent)).toFixed(2));
  });
  console.log('Stock prices updated:', prices);
}

// Start periodic price updates every 5 minutes for demo
function startPriceUpdates() {
  console.log('Starting stock price update service...');
  updatePrices(); // Initial update
  setInterval(updatePrices, 5 * 60 * 1000); 
}

module.exports = { startPriceUpdates, prices };
