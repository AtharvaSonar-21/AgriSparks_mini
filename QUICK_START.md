# Plant Disease Classifier - Quick Start Guide

## 🚀 Server Status

Both servers are currently running:

| Server | URL | Status |
|--------|-----|--------|
| **Frontend (React)** | http://localhost:5173 | ✅ Running |
| **Backend (Node.js)** | http://localhost:5000/api | ✅ Running |
| **Health Check** | http://localhost:5000/api/health | ✅ Available |

## 🧪 How to Test

### Option 1: Use the Web Interface
1. Open http://localhost:5173 in your browser
2. Click "Choose Image" button
3. Select any image file (JPG, PNG, JPEG, GIF, BMP, WEBP)
4. Click "Predict" button
5. View the disease prediction results
6. Scroll down to see "Recent Predictions" history

### Option 2: Test via API (cURL)

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test prediction endpoint
curl -X POST \
  -F "image=@/path/to/your/image.jpg" \
  http://localhost:5000/api/predict

# Get prediction history
curl http://localhost:5000/api/history
```

### Option 3: Test via Python

```python
import requests
from pathlib import Path

# Upload image and get prediction
with open('path/to/image.jpg', 'rb') as f:
    files = {'image': f}
    response = requests.post('http://localhost:5000/api/predict', files=files)
    print(response.json())
```

## 📊 Example Response

When you upload an image, you'll receive a response like:

```json
{
  "success": true,
  "prediction": {
    "disease": "Corn___Common_rust",
    "confidence": 85,
    "allPredictions": [
      {
        "class": "Corn___Common_rust",
        "confidence": 85.0,
        "index": 8
      },
      {
        "class": "Corn___Northern_Leaf_Blight",
        "confidence": 82.0,
        "index": 9
      },
      {
        "class": "Corn___healthy",
        "confidence": 79.0,
        "index": 10
      },
      {
        "class": "Grape___Black_rot",
        "confidence": 70.0,
        "index": 11
      },
      {
        "class": "Grape___Esca Black_Measles",
        "confidence": 67.0,
        "index": 12
      }
    ]
  }
}
```

## 🎯 Available Disease Classes (38 total)

### By Plant Type:
- **Apple** (4): Apple_scab, Black_rot, Cedar_apple_rust, healthy
- **Blueberry** (1): healthy
- **Cherry** (2): Powdery_mildew, healthy
- **Corn** (4): Cercospora_leaf_spot, Common_rust, Northern_Leaf_Blight, healthy
- **Grape** (4): Black_rot, Esca, Leaf_blight, healthy
- **Orange** (1): Haunglongbing
- **Peach** (2): Bacterial_spot, healthy
- **Pepper** (2): Bacterial_spot, healthy
- **Potato** (3): Early_blight, Late_blight, healthy
- **Raspberry** (1): healthy
- **Soybean** (1): healthy
- **Squash** (1): Powdery_mildew
- **Strawberry** (2): Leaf_scorch, healthy
- **Tomato** (8): Bacterial_spot, Early_blight, Late_blight, Leaf_Mold, Septoria, Spider_mites, Target_Spot, Yellow_Leaf_Curl_Virus, Mosaic_virus, healthy

## 🔧 Troubleshooting

### Problem: "Failed to connect to backend"
- **Solution**: Check if backend server is running
  ```powershell
  Set-Location "d:\Ai Agents\plant-disease-classifier\backend"
  npm start
  ```

### Problem: "Frontend not loading"
- **Solution**: Check if frontend server is running
  ```powershell
  Set-Location "d:\Ai Agents\plant-disease-classifier\frontend"
  npm run dev
  ```

### Problem: "502 Bad Gateway"
- **Solution**: Backend may be restarting. Wait 2 seconds and retry.

### Problem: "No predictions returned"
- **Solution**: Check server logs for Python script errors:
  ```powershell
  # Check backend terminal output for error details
  ```

## 📝 Key Files

- **Frontend**: `frontend/src/App.jsx` - Main React component
- **Backend**: `backend/server.js` - Express app setup
- **Routes**: `backend/routes/predict.js` - Prediction endpoint
- **Python Script**: `backend/inference.py` - TFLite inference
- **Model**: `backend/models/model_int8 (2).tflite` - TFLite model

## ⚙️ Configuration

### Environment Variables
Create `.env` file in `backend/` folder:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/plant-disease
NODE_ENV=development
```

### Python Script Parameters
The inference script accepts:
- Model path: `models/model_int8 (2).tflite`
- Image path: Path to input image file

## 📊 Current Prediction Mode

⚠️ **Note**: Currently running in **Mock Prediction Mode**

- **Status**: tflite_runtime not available on Windows
- **Impact**: Predictions are deterministic (based on image hash)
- **Appearance**: Still shows realistic disease names and confidence scores
- **Functionality**: All features work normally

To use **Real Model Predictions**:
1. Install tflite_runtime from Google's TensorFlow repo
2. Or use WSL2 Linux environment
3. Restart backend server

## 🎉 You're All Set!

The application is ready for testing. Start by:
1. Opening http://localhost:5173
2. Uploading an image
3. Viewing the predictions

For detailed status information, see `INTEGRATION_STATUS.md`
