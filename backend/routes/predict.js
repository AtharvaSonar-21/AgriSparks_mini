// backend/routes/predict.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Configure multer for temporary file storage
const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Path to the TFLite model
const MODEL_PATH = path.join(__dirname, '../models/model_int8 (2).tflite');
const INFERENCE_SCRIPT = path.join(__dirname, '../inference.py');

// Class names for reference
const CLASS_NAMES = [
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

/**
 * Run Python inference script
 */
function runPythonInference(imagePath) {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [INFERENCE_SCRIPT, MODEL_PATH, imagePath]);
    
    let output = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python inference failed: ${error}`));
        return;
      }
      
      try {
        const result = JSON.parse(output);
        if (!result.success) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      } catch (e) {
        reject(new Error(`Failed to parse inference output: ${e.message}`));
      }
    });
  });
}

router.post('/', upload.single('image'), async (req, res) => {
  let uploadedFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    uploadedFilePath = req.file.path;
    
    console.log(`📸 Image uploaded: ${req.file.originalname}`);
    console.log(`🔄 Running inference on ${uploadedFilePath}...`);
    
    // Check if model exists
    if (!fs.existsSync(MODEL_PATH)) {
      return res.status(503).json({ 
        error: 'Model file not found',
        modelPath: MODEL_PATH
      });
    }
    
    // Run Python inference
    const result = await runPythonInference(uploadedFilePath);
    
    console.log(`✅ Inference successful`);
    console.log(`   Top prediction: ${result.topPrediction.disease} (${result.topPrediction.confidence}%)`);

    res.json({
      success: true,
      prediction: {
        disease: result.topPrediction.disease,
        confidence: result.topPrediction.confidence,
        allPredictions: result.allPredictions
      }
    });

  } catch (error) {
    console.error('❌ Prediction error:', error.message);
    res.status(500).json({ 
      error: 'Prediction failed',
      details: error.message
    });
  } finally {
    // Clean up uploaded file
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlink(uploadedFilePath, (err) => {
        if (err) console.warn('Warning: Could not delete temporary file');
      });
    }
  }
});

module.exports = router;