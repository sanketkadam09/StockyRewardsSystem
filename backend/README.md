# Stocky Backend

Stocky Backend is my project to track users earning fractional shares of popular Indian stocks like Reliance, TCS, and Infosys. Users get these rewards for onboarding, referrals, or hitting milestones. The system handles reward events, updates stock prices regularly, and calculates real-time portfolio values, including internal company fees.

## Features

- Record rewards of fractional shares with precise decimal handling.  
- Track brokerage, taxes, and regulatory fees internally.  
- Update stock prices every 5 minutes using a mock service that simulates real market changes.  
- REST APIs to create rewards, get today’s rewards, historical valuations, stats, and portfolio details.

## Tech Stack

- **Node.js & Express** – API server  
- **MongoDB & Mongoose** – Database and schema validation  
- **Decimal128** – For precise fractional shares and INR values  
- **Middleware** – Helmet for security, CORS for cross-origin support

## Setup & Installation

1. Clone this repository.  
2. Run  npm install to install dependencies.  
3. Create a `.env` file with:  


PORT=5000
MONGODB_URI=<your_mongo_uri>

4. Start the server:  
npm run dev

5. Test the APIs using Postman or Hoppscotch with your MongoDB user IDs.

## API Endpoints

- **POST** `/api/rewards` – Record a stock reward event  
- **GET** `/api/rewards/today-stocks/:userId` – Get today’s rewards for a user  
- **GET** `/api/rewards/historical-inr/:userId` – Get historical INR portfolio values  
- **GET** `/api/rewards/stats/:userId` – Get today’s total shares rewarded and current portfolio INR  
- **GET** `/api/rewards/portfolio/:userId` – Get detailed portfolio holdings and valuation

## How It Works

- Reward events store user, stock, shares, price, and timestamp.  
- Internal ledger tracks company fees (hidden from users).  
- Background service updates stock prices every 5 minutes (simulated).  
- APIs calculate portfolio value dynamically using latest prices and reward data.

## Future Improvements

- Integrate real stock price APIs instead of simulated ones  
- Add user authentication and authorization  
- Expand API documentation with examples and tests

## API Testing Examples

### POST `/api/rewards` – Create New Reward

**Request**  

POST http://localhost:5000/api/rewards
Content-Type: application/json

{
"userId": "68c5023c06a021fc2a0d8190",
"stockSymbol": "RELIANCE",
"quantity": 5,
"rewardType": "ONBOARDING",
"rewardReason": "Welcome bonus"
}


**Response**  

{
"success": true,
"message": "Reward created",
"data": {
"userId": "68c5023c06a021fc2a0d8190",
"stockSymbol": "RELIANCE",
"quantity": { "$numberDecimal": "5" },
"priceAtReward": { "$numberDecimal": "2404.1534" },
"totalValue": { "$numberDecimal": "12020.7670" },
"rewardType": "ONBOARDING",
"rewardReason": "Welcome bonus",
"_id": "68c5026dbcfc2ffbd59682af",
"createdAt": "2025-09-13T05:34:37.791Z",
"__v": 0
}
}


### GET `/api/rewards/today-stocks/:userId` – Get Today’s Rewards for a User

**Request**  
GET http://localhost:5000/api/rewards/today-stocks/68c5023c06a021fc2a0d8190

**Response**  

{
"success": true,
"data": [
{
"_id": "68c5026dbcfc2ffbd59682af",
"userId": "68c5023c06a021fc2a0d8190",
"stockSymbol": "RELIANCE",
"quantity": { "$numberDecimal": "5" },
"priceAtReward": { "$numberDecimal": "2404.1534" },
"totalValue": { "$numberDecimal": "12020.7670" },
"rewardType": "ONBOARDING",
"rewardReason": "Welcome bonus",
"createdAt": "2025-09-13T05:34:37.791Z",
"__v": 0
}
]
}
