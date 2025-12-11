import * as tf from '@tensorflow/tfjs';

// Class names matching your training data
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

const IMG_SIZE = 160;

/**
 * Load TFLite model from file
 * DEPRECATED: Use backend API instead
 * This function is kept for compatibility only
 */
export const loadTFLiteModel = async (modelPath) => {
  console.warn('⚠️ TFLite model loading not supported. Using backend API instead.');
  throw new Error('TFLite loading not available. Please use the backend API endpoint.');
};

/**
 * Load TFLite model from URL (alternative method)
 * DEPRECATED: Use backend API instead
 */
export const loadTFLiteModelFromUrl = async (modelPath) => {
  console.warn('⚠️ TFLite model loading not supported. Using backend API instead.');
  throw new Error('TFLite loading not available. Please use the backend API endpoint.');
};

/**
 * Preprocess image for model inference
 * @param {HTMLImageElement|string} imageInput - Image element or data URL
 * @returns {object} - Preprocessed tensor
 */
export const preprocessImage = (imageInput) => {
  try {
    let tensor;

    // Handle both Image elements and data URLs
    if (typeof imageInput === 'string') {
      // Data URL or blob URL
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageInput;
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            tensor = tf.browser.fromPixels(img);
            const processed = _preprocessTensor(tensor);
            resolve(processed);
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      });
    } else {
      // HTMLImageElement
      tensor = tf.browser.fromPixels(imageInput);
      return _preprocessTensor(tensor);
    }
  } catch (error) {
    console.error('Error preprocessing image:', error);
    throw new Error(`Image preprocessing failed: ${error.message}`);
  }
};

/**
 * Internal function to preprocess tensor
 * @private
 */
const _preprocessTensor = (tensor) => {
  try {
    // Resize to model input size (160x160)
    let resized = tf.image.resizeBilinear(tensor, [IMG_SIZE, IMG_SIZE]);

    // Convert to float and normalize to [0, 1]
    const normalized = resized.toFloat().div(tf.scalar(255.0));

    // Add batch dimension [1, 160, 160, 3]
    const batched = normalized.expandDims(0);

    // Cleanup intermediate tensors
    tensor.dispose();
    resized.dispose();
    normalized.dispose();

    return batched;
  } catch (error) {
    tensor.dispose();
    throw error;
  }
};

/**
 * Run inference on preprocessed image
 * @param {object} model - TFLite model
 * @param {object} preprocessedImage - Preprocessed tensor
 * @returns {Promise<Float32Array>} - Model predictions
 */
export const runInference = async (model, preprocessedImage) => {
  try {
    if (!model) {
      throw new Error('Model not loaded');
    }

    // Run inference - TFLite models use predict() method
    const output = model.predict(preprocessedImage);
    
    // Get output data
    let outputArray;
    if (output.dataSync) {
      outputArray = Array.from(output.dataSync());
    } else if (output.data) {
      outputArray = Array.from(output.data);
    } else {
      // Handle tensor directly
      outputArray = await output.data();
      outputArray = Array.from(outputArray);
    }

    // Cleanup
    preprocessedImage.dispose();
    if (output && output.dispose) {
      output.dispose();
    }

    return outputArray;
  } catch (error) {
    console.error('Error during inference:', error);
    if (preprocessedImage && preprocessedImage.dispose) {
      preprocessedImage.dispose();
    }
    throw new Error(`Inference failed: ${error.message}`);
  }
};

/**
 * Process model output and get predictions
 * @param {number[]} outputArray - Raw model predictions
 * @param {number} topN - Number of top predictions to return
 * @returns {object} - Processed predictions with top class and confidence
 */
export const postprocessPredictions = (outputArray, topN = 5) => {
  try {
    if (!Array.isArray(outputArray) || outputArray.length === 0) {
      throw new Error('Invalid output array');
    }

    // Create indexed predictions
    const predictions = outputArray.map((confidence, idx) => ({
      index: idx,
      class: CLASS_NAMES[idx] || `Class_${idx}`,
      confidence: parseFloat((confidence * 100).toFixed(2)),
      rawConfidence: confidence
    }));

    // Sort by confidence (descending)
    predictions.sort((a, b) => b.rawConfidence - a.rawConfidence);

    // Get top N predictions
    const topPredictions = predictions.slice(0, topN);
    const topPrediction = topPredictions[0];

    return {
      topPrediction: {
        disease: topPrediction.class,
        confidence: topPrediction.confidence,
        index: topPrediction.index
      },
      allPredictions: topPredictions.map(pred => ({
        class: pred.class,
        confidence: pred.confidence,
        index: pred.index
      }))
    };
  } catch (error) {
    console.error('Error postprocessing predictions:', error);
    throw new Error(`Postprocessing failed: ${error.message}`);
  }
};

/**
 * Complete inference pipeline
 * @param {object} model - TFLite model
 * @param {string|HTMLImageElement} imageInput - Image to process
 * @returns {Promise<object>} - Final predictions
 */
export const predictImage = async (model, imageInput) => {
  try {
    if (!model) {
      throw new Error('Model not loaded');
    }

    // Preprocess
    const preprocessed = await preprocessImage(imageInput);

    // Inference
    const output = await runInference(model, preprocessed);

    // Postprocess
    const predictions = postprocessPredictions(output);

    return predictions;
  } catch (error) {
    console.error('Error in prediction pipeline:', error);
    throw error;
  }
};

/**
 * Get confidence color based on value
 */
export const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return '#48bb78'; // Green
  if (confidence >= 60) return '#f6ad55'; // Orange
  return '#f56565'; // Red
};

/**
 * Get class names
 */
export const getClassNames = () => CLASS_NAMES;

/**
 * Get model input shape
 */
export const getModelInputShape = () => [1, IMG_SIZE, IMG_SIZE, 3];
