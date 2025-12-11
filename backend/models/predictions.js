// backend/models/Prediction.js
const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  disease: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
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

module.exports = mongoose.model('Prediction', predictionSchema);