# Person Detection Implementation Guide

**Created:** 2026-01-26  
**For:** InterVueX AI Interview Platform

---

## 🎯 Overview

This guide explains how to implement **real person detection** to ensure only one person (the candidate) is visible in the camera during interviews.

---

## 🔧 Current Implementation (Simulated)

### What's Implemented Now

**File:** `frontend/src/pages/student/StudentInterview.jsx`

```javascript
// Person Detection (Simulated)
useEffect(() => {
    if (step === 'interview' && cameraReady) {
        const detectionInterval = setInterval(() => {
            // Simulate: 90% chance of 1 person, 10% chance of 2+ people
            const random = Math.random();
            const detectedCount = random < 0.9 ? 1 : Math.floor(Math.random() * 2) + 2;
            
            setPersonCount(detectedCount);
            
            if (detectedCount > 1) {
                setMultiplePersonWarning(true);
                handleSuspiciousActivity('multiple_people', 
                    `${detectedCount} people detected. Only candidate should be visible.`);
                
                setTimeout(() => setMultiplePersonWarning(false), 5000);
            } else {
                setMultiplePersonWarning(false);
            }
        }, 3000); // Check every 3 seconds
        
        return () => clearInterval(detectionInterval);
    }
}, [step, cameraReady, handleSuspiciousActivity]);
```

### UI Indicators

1. **Camera Status Badge:**
   - "Detecting..." (when starting)
   - "1 Person ✓" (correct)
   - "2 People ⚠️" (warning)

2. **Warning Banner:**
   - Red pulsing banner at bottom of camera feed
   - "⚠️ Multiple people detected! Only the candidate should be visible."
   - Auto-hides after 5 seconds

3. **Suspicious Events:**
   - Logged in `suspiciousEvents` state
   - Sent to backend via video signals
   - Included in final report

---

## 🚀 Production Implementation

### Option 1: TensorFlow.js BlazeFace (Recommended)

**Pros:**
- Fast and lightweight
- Runs in browser (no server needed)
- Good accuracy for face detection
- Free and open source

**Installation:**

```bash
npm install @tensorflow/tfjs @tensorflow-models/blazeface
```

**Implementation:**

```javascript
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

// Hook for face detection
function useFaceDetection(videoRef) {
    const [faceCount, setFaceCount] = useState(0);
    const [model, setModel] = useState(null);

    useEffect(() => {
        // Load BlazeFace model
        const loadModel = async () => {
            await tf.ready();
            const loadedModel = await blazeface.load();
            setModel(loadedModel);
        };
        loadModel();
    }, []);

    useEffect(() => {
        if (!model || !videoRef.current) return;

        const detectFaces = async () => {
            const predictions = await model.estimateFaces(videoRef.current, false);
            setFaceCount(predictions.length);
        };

        const interval = setInterval(detectFaces, 1000); // Every 1 second
        return () => clearInterval(interval);
    }, [model, videoRef]);

    return faceCount;
}

// Usage in StudentInterview component
const faceCount = useFaceDetection(videoRef);

useEffect(() => {
    setPersonCount(faceCount);
    
    if (faceCount > 1) {
        setMultiplePersonWarning(true);
        handleSuspiciousActivity('multiple_people', 
            `${faceCount} faces detected. Only candidate should be visible.`);
        setTimeout(() => setMultiplePersonWarning(false), 5000);
    } else if (faceCount === 0) {
        handleSuspiciousActivity('no_face', 'No face detected in camera.');
    } else {
        setMultiplePersonWarning(false);
    }
}, [faceCount, handleSuspiciousActivity]);
```

**Performance:**
- ~30-60 FPS on modern devices
- ~5-10ms per frame
- Minimal CPU usage

---

### Option 2: face-api.js (More Features)

**Pros:**
- Face detection + recognition + landmarks
- Can detect age, gender, expressions
- More detailed analysis

**Cons:**
- Heavier than BlazeFace
- Slower performance

**Installation:**

```bash
npm install face-api.js
```

**Implementation:**

```javascript
import * as faceapi from 'face-api.js';

function useFaceDetection(videoRef) {
    const [faceCount, setFaceCount] = useState(0);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models'; // Place models in public/models
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            setModelsLoaded(true);
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (!modelsLoaded || !videoRef.current) return;

        const detectFaces = async () => {
            const detections = await faceapi.detectAllFaces(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            );
            setFaceCount(detections.length);
        };

        const interval = setInterval(detectFaces, 1000);
        return () => clearInterval(interval);
    }, [modelsLoaded, videoRef]);

    return faceCount;
}
```

**Download Models:**
```bash
# Download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
# Place in: public/models/
- tiny_face_detector_model-weights_manifest.json
- tiny_face_detector_model-shard1
```

---

### Option 3: MediaPipe Face Detection (Google)

**Pros:**
- Very accurate
- Maintained by Google
- Cross-platform

**Installation:**

```bash
npm install @mediapipe/face_detection @mediapipe/camera_utils
```

**Implementation:**

```javascript
import { FaceDetection } from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';

function useFaceDetection(videoRef) {
    const [faceCount, setFaceCount] = useState(0);

    useEffect(() => {
        if (!videoRef.current) return;

        const faceDetection = new FaceDetection({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
            }
        });

        faceDetection.setOptions({
            model: 'short',
            minDetectionConfidence: 0.5
        });

        faceDetection.onResults((results) => {
            setFaceCount(results.detections.length);
        });

        const camera = new Camera(videoRef.current, {
            onFrame: async () => {
                await faceDetection.send({ image: videoRef.current });
            },
            width: 640,
            height: 480
        });

        camera.start();

        return () => {
            camera.stop();
        };
    }, [videoRef]);

    return faceCount;
}
```

---

## 📊 Comparison

| Solution | Speed | Accuracy | Size | Ease of Use |
|----------|-------|----------|------|-------------|
| **BlazeFace** | ⚡⚡⚡ Fast | ✓ Good | 📦 Small (100KB) | 😊 Easy |
| **face-api.js** | ⚡⚡ Medium | ✓✓ Better | 📦📦 Large (6MB) | 😐 Medium |
| **MediaPipe** | ⚡⚡⚡ Fast | ✓✓✓ Best | 📦📦 Medium (2MB) | 😊 Easy |

**Recommendation:** Use **BlazeFace** for production - best balance of speed, accuracy, and size.

---

## 🎨 Enhanced UI Features

### Visual Feedback

```javascript
// Add face bounding boxes
const drawFaceBoundingBoxes = (predictions) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.topLeft.concat(prediction.bottomRight);
        
        // Draw box
        ctx.strokeStyle = predictions.length > 1 ? '#ef4444' : '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Draw label
        ctx.fillStyle = predictions.length > 1 ? '#ef4444' : '#10b981';
        ctx.fillText(
            predictions.length > 1 ? '⚠️ Extra Person' : '✓ Candidate',
            x, y - 10
        );
    });
};
```

### Audio Alerts

```javascript
// Play warning sound when multiple people detected
const playWarningSound = () => {
    const audio = new Audio('/sounds/warning.mp3');
    audio.play();
};

useEffect(() => {
    if (faceCount > 1) {
        playWarningSound();
    }
}, [faceCount]);
```

---

## 🔒 Privacy & Ethics

### Best Practices

1. **Explicit Consent:**
   - ✅ Already implemented in consent checkbox
   - User must acknowledge camera monitoring

2. **No Recording of Faces:**
   - Only count faces, don't store images
   - Don't use facial recognition (identity)
   - Only detect presence, not who

3. **Transparent Communication:**
   - Clear warning when multiple people detected
   - Explain why it's flagged
   - Give user chance to correct

4. **Data Handling:**
   ```javascript
   // DON'T store face images
   // DO store only counts and timestamps
   const signal = {
       person_count: faceCount,
       timestamp: Date.now(),
       // NO face images or biometric data
   };
   ```

---

## 🧪 Testing

### Test Cases

1. **Single Person (Normal):**
   - Expected: `personCount = 1`, no warnings
   - Status: ✓ Pass

2. **Multiple People:**
   - Expected: `personCount > 1`, warning shown
   - Status: ⚠️ Flagged

3. **No Person:**
   - Expected: `personCount = 0`, warning
   - Status: ⚠️ Flagged

4. **Person Leaves Frame:**
   - Expected: `personCount = 0`, then back to 1
   - Status: Track in suspicious events

### Manual Testing

```javascript
// Add debug overlay
{process.env.NODE_ENV === 'development' && (
    <div className="debug-overlay">
        <p>Faces Detected: {faceCount}</p>
        <p>Model Loaded: {modelLoaded ? 'Yes' : 'No'}</p>
        <p>Detection Active: {detectionActive ? 'Yes' : 'No'}</p>
    </div>
)}
```

---

## 📦 Package.json Updates

Add to `frontend/package.json`:

```json
{
  "dependencies": {
    "@tensorflow/tfjs": "^4.11.0",
    "@tensorflow-models/blazeface": "^0.0.7"
  }
}
```

Then run:
```bash
cd frontend
npm install
```

---

## 🚀 Deployment Checklist

- [ ] Install TensorFlow.js and BlazeFace
- [ ] Replace simulated detection with real detection
- [ ] Test on multiple devices (desktop, laptop, mobile)
- [ ] Verify performance (should be <50ms per detection)
- [ ] Test with different lighting conditions
- [ ] Add loading state while model loads
- [ ] Handle model loading errors gracefully
- [ ] Add debug mode for development
- [ ] Test privacy compliance
- [ ] Document in user guide

---

## 📝 Code Integration Steps

### Step 1: Install Dependencies

```bash
cd frontend
npm install @tensorflow/tfjs @tensorflow-models/blazeface
```

### Step 2: Create Hook

Create `frontend/src/hooks/useFaceDetection.js`:

```javascript
import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

export function useFaceDetection(videoRef, enabled = true) {
    const [faceCount, setFaceCount] = useState(0);
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load model
    useEffect(() => {
        if (!enabled) return;
        
        const loadModel = async () => {
            try {
                await tf.ready();
                const loadedModel = await blazeface.load();
                setModel(loadedModel);
                setLoading(false);
            } catch (error) {
                console.error('Failed to load face detection model:', error);
                setLoading(false);
            }
        };
        
        loadModel();
    }, [enabled]);

    // Detect faces
    useEffect(() => {
        if (!model || !videoRef.current || !enabled) return;

        const detectFaces = async () => {
            try {
                const predictions = await model.estimateFaces(videoRef.current, false);
                setFaceCount(predictions.length);
            } catch (error) {
                console.error('Face detection error:', error);
            }
        };

        const interval = setInterval(detectFaces, 1000);
        return () => clearInterval(interval);
    }, [model, videoRef, enabled]);

    return { faceCount, loading };
}
```

### Step 3: Use in StudentInterview

```javascript
import { useFaceDetection } from '../../hooks/useFaceDetection';

// In component
const { faceCount, loading: faceDetectionLoading } = useFaceDetection(
    videoRef, 
    step === 'interview' && cameraReady
);

// Replace simulated detection with real detection
useEffect(() => {
    setPersonCount(faceCount);
    
    if (faceCount > 1) {
        setMultiplePersonWarning(true);
        handleSuspiciousActivity('multiple_people', 
            `${faceCount} people detected. Only candidate should be visible.`);
        setTimeout(() => setMultiplePersonWarning(false), 5000);
    } else {
        setMultiplePersonWarning(false);
    }
}, [faceCount, handleSuspiciousActivity]);
```

---

## 🎯 Expected Behavior

### Normal Interview Flow

1. **Setup:** User enables camera
2. **Detection Starts:** Model loads (1-2 seconds)
3. **Monitoring:** Checks every 1 second
4. **Status Display:** "1 Person ✓" in camera badge
5. **No Warnings:** Interview proceeds normally

### Multiple People Detected

1. **Detection:** 2+ faces found
2. **Warning:** Red banner appears
3. **Logging:** Event logged as suspicious
4. **Backend:** Sent in video signals
5. **Report:** Flagged in final evaluation
6. **Auto-Hide:** Warning disappears after 5s if resolved

---

## 🔍 Troubleshooting

### Model Won't Load

```javascript
// Check TensorFlow backend
console.log('TF Backend:', tf.getBackend());

// Try setting backend explicitly
await tf.setBackend('webgl');
```

### Slow Performance

```javascript
// Reduce detection frequency
const interval = setInterval(detectFaces, 2000); // Every 2s instead of 1s

// Use lower resolution
const predictions = await model.estimateFaces(
    videoRef.current, 
    false,
    { inputSize: 128 } // Lower resolution = faster
);
```

### False Positives

```javascript
// Add confidence threshold
const predictions = await model.estimateFaces(videoRef.current, false);
const highConfidenceFaces = predictions.filter(p => p.probability[0] > 0.8);
setFaceCount(highConfidenceFaces.length);
```

---

**This guide provides everything needed to implement real person detection in production!** 🚀
