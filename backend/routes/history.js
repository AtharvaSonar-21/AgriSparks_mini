// backend/routes/history.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Get all predictions (MongoDB with fallback to in-memory)
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const Prediction = mongoose.model('Prediction');
      const dbPredictions = await Prediction.find().sort({ timestamp: -1 }).limit(50).lean();
      return res.json({ 
        success: true, 
        predictions: dbPredictions 
      });
    }
    
    res.json({ 
      success: true, 
      predictions: global.predictionHistory.slice(0, 50) 
    });
  } catch (error) {
    console.error('Failed to fetch history:', error.message);
    res.status(500).json({ error: 'Failed to fetch history', details: error.message });
  }
});

// Get prediction by ID
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let prediction = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const Prediction = mongoose.model('Prediction');
      prediction = await Prediction.findById(id).lean();
    }

    if (!prediction) {
      prediction = global.predictionHistory.find(p => p._id === id);
    }
    
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }
    
    res.json({ success: true, prediction });
  } catch (error) {
    console.error('Failed to fetch prediction:', error.message);
    res.status(500).json({ error: 'Failed to fetch prediction', details: error.message });
  }
});

// Delete prediction
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let deletedFromDb = false;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const Prediction = mongoose.model('Prediction');
      const result = await Prediction.deleteOne({ _id: id });
      deletedFromDb = result.deletedCount > 0;
    }

    // Always remove from memory fallback as well
    global.predictionHistory = global.predictionHistory.filter(p => p._id !== id);

    res.json({ 
      success: true, 
      message: deletedFromDb ? 'Prediction deleted from database' : 'Prediction deleted' 
    });
  } catch (error) {
    console.error('Failed to delete prediction:', error.message);
    res.status(500).json({ error: 'Failed to delete prediction', details: error.message });
  }
});

module.exports = router;