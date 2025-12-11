// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import { getConfidenceColor } from './utils/tfliteModel';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    }
  };

  // Prediction using backend API
  const handlePredict = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed');
      }

      setPrediction(data.prediction);
      fetchHistory();
    } catch (err) {
      console.error('API Prediction error:', err);
      setError(`Prediction failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history`);
      const data = await response.json();
      if (data.success) {
        setHistory(data.predictions);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPreview(null);
    setPrediction(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌿 Plant Disease Detection</h1>
        <p>Upload a leaf image to detect diseases using AI</p>
      </header>

      <main className="container">
        <div className="upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="file-input"
            style={{ display: 'none' }}
          />
          
          {!preview ? (
            <label 
              htmlFor="file-input" 
              className="upload-button"
              style={{ opacity: 1, cursor: 'pointer' }}
            >
              📁 Choose Image
            </label>
          ) : (
            <>
              <div className="preview-container">
                <img src={preview} alt="Preview" className="preview-image" />
                <div className="button-group">
                  <button
                    onClick={handlePredict}
                    disabled={loading}
                    className="predict-button"
                  >
                    {loading ? '⏳ Analyzing...' : '🔍 Detect Disease'}
                  </button>
                  <button onClick={resetForm} className="reset-button" disabled={loading}>
                    🔄 Upload New
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <span>⚠️</span>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {prediction && (
          <div className="results-section">
            <h2>📊 Analysis Results</h2>
            <div className="main-prediction">
              <h3>Detected Disease:</h3>
              <p className="disease-name">{prediction.disease}</p>
              <p className="confidence">
                Confidence: {prediction.confidence}%
              </p>
              <div className="confidence-bar-container">
                <div 
                  className="confidence-bar-fill"
                  style={{ 
                    width: `${prediction.confidence}%`,
                    backgroundColor: getConfidenceColor(prediction.confidence)
                  }}
                />
              </div>
            </div>

            <div className="top-predictions">
              <h3>Top 5 Predictions:</h3>
              {prediction.allPredictions.map((pred, idx) => (
                <div key={idx} className="prediction-item">
                  <span className="rank">#{idx + 1}</span>
                  <span className="class-name">{pred.class}</span>
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{ 
                        width: `${pred.confidence}%`,
                        backgroundColor: getConfidenceColor(pred.confidence)
                      }}
                    />
                  </div>
                  <span className="confidence-value">{pred.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="history-section">
            <h2>📜 Recent Predictions</h2>
            <div className="history-grid">
              {history.slice(0, 6).map((item) => (
                <div key={item._id} className="history-item">
                  <p className="history-disease">{item.disease}</p>
                  <p className="history-confidence">{item.confidence}%</p>
                  <p className="history-date">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Powered by TensorFlow.js & MERN Stack</p>
      </footer>
    </div>
  );
}

export default App;