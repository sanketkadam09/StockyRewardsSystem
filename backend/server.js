const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const rewardRoutes = require('./src/routes/rewards');
const stockPriceService = require('./src/services/stockPriceService');


const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log(' MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});


stockPriceService.startPriceUpdates();

app.use('/api/rewards', rewardRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running', time: new Date() });
});


app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The route "${req.originalUrl}" does not exist`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
});
