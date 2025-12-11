// backend/routes/history.js
const express = require('express');
const router = express.Router();

// Dummy history - in production this would use MongoDB
let predictionHistory = [];

// Get all predictions
router.get('/', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      predictions: predictionHistory.slice(0, 50) 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get prediction by ID
router.get('/:id', async (req, res) => {
  try {
    const prediction = predictionHistory.find(p => p._id === req.params.id);
    
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }
    
    res.json({ success: true, prediction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prediction' });
  }
});

// Delete prediction
router.delete('/:id', async (req, res) => {
  try {
    predictionHistory = predictionHistory.filter(p => p._id !== req.params.id);
    res.json({ success: true, message: 'Prediction deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete prediction' });
  }
});

module.exports = router;