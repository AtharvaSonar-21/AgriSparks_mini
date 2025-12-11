// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
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

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plant-disease';

mongoose.connect(MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.warn('⚠️ MongoDB not available, running in demo mode:', err.message));

// Load/Create Prediction Model Schema
const predictionSchema = new mongoose.Schema({
  disease: String,
  confidence: Number,
  imageName: String,
  imageSize: Number,
  topPredictions: [{
    class: String,
    confidence: Number
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Prediction = mongoose.model('Prediction', predictionSchema);

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    classes: CLASS_NAMES.length,
    mode: 'api-only'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
});