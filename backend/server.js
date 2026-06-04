// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Global fallback for history storage in demo/disconnected mode
global.predictionHistory = [];

// Performance & Security Middlewares
app.use(compression());
app.use(helmet());
app.use(mongoSanitize());

// Secure CORS Configuration
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin === '*' ? '*' : allowedOrigin.split(','),
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load class names
const classNamesPath = path.join(__dirname, 'class_names.json');
let CLASS_NAMES = [];

try {
  const classData = JSON.parse(fs.readFileSync(classNamesPath, 'utf8'));
  CLASS_NAMES = classData.class_names;
  console.log(`Loaded ${CLASS_NAMES.length} classes`);
} catch (error) {
  console.error('Error loading class names:', error);
  // Fallback class names
  CLASS_NAMES = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Blueberry___healthy',
    'Cherry___Powdery_mildew',
    'Cherry___healthy',
    'Corn___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn___Common_rust',
    'Corn___Northern_Leaf_Blight',
    'Corn___healthy',
    'Grape___Black_rot',
    'Grape___Esca Black_Measles',
    'Grape___Leaf_blight Isariopsis_Leaf_Spot',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
  ];
}

// MongoDB Connection with robust error handling, reconnection stability, and pooling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plant-disease';

const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  };
  
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('⚠️ MongoDB connection failed:', err.message);
    console.log('Running in fallback demo mode (in-memory storage).');
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

connectDB();

// Load Prediction Model Schema
const Prediction = require('./models/predictions');

// Simulate model predictions (since TFLite is running client-side now)
function getRandomPredictions() {
  const predictions = CLASS_NAMES.map((className, idx) => ({
    index: idx,
    class: className,
    confidence: Math.random()
  }));
  
  predictions.sort((a, b) => b.confidence - a.confidence);
  
  return predictions.slice(0, 5).map(p => ({
    class: p.class,
    confidence: Math.round(p.confidence * 100)
  }));
}

// Routes
app.use('/api/predict', require('./routes/predict'));
app.use('/api/history', require('./routes/history'));

// Standard health check for Render
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date(),
    dbConnected: mongoose.connection.readyState === 1
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    classes: CLASS_NAMES.length,
    mode: 'api-only'
  });
});

// Production error handling middleware (prevent stack traces)
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.message);
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    error: 'An internal server error occurred',
    details: isProduction ? null : err.message
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
});

// Global Exception Handlers
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful Shutdown
function gracefulShutdown() {
  console.log('Received termination signal. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    }).catch((err) => {
      console.error('Error during MongoDB connection close:', err);
      process.exit(1);
    });
  });

  // Force close after 10s
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);