import { useState, useEffect } from 'react';

/**
 * Custom hook to load and manage TFLite model
 */
export default function useTFLiteModel(modelPath = '/models/model_int8.tflite') {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        if (!modelPath) {
          throw new Error('Model path is required');
        }

        // Lazy load tflite to avoid circular imports
        const tflite = await import('@tensorflow/tfjs-tflite');
        
        // Convert relative path to absolute URL
        const modelUrl = modelPath.startsWith('http') 
          ? modelPath 
          : `${window.location.origin}${modelPath}`;
        
        console.log('🔄 Loading TFLite model from:', modelUrl);
        
        const tfliteModel = await tflite.loadTFLiteModel(modelUrl);
        
        if (!isMounted) return;
        
        setModel(tfliteModel);
        setIsReady(true);
        setError(null);
        console.log('✅ TFLite model loaded successfully');
      } catch (err) {
        if (!isMounted) return;
        
        console.error('❌ Failed to load TFLite model:', err);
        setError(err.message || 'Failed to load model');
        setModel(null);
        setIsReady(false);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadModel();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [modelPath]);

  return { model, loading, error, isReady };
}
