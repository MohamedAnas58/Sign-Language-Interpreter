import React, { useRef, useEffect, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

function WebcamCapture({ onSignDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const landmarkerRef = useRef(null);
  const requestRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  useEffect(() => {
    let active = true;

    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (active) {
          landmarkerRef.current = landmarker;
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Failed to initialize MediaPipe:", error);
      }
    };

    initializeMediaPipe();

    return () => {
      active = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (landmarkerRef.current) landmarkerRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !videoRef.current) return;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [isLoaded]);

  const predictWebcam = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !canvas || !landmarker) return;

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      
      const startTimeMs = performance.now();
      const results = landmarker.detectForVideo(video, startTimeMs);

      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        drawLandmarks(ctx, landmarks, canvas.width, canvas.height);
        
        // Send to backend
        classifyLandmarks(landmarks);
      }
      ctx.restore();
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  const drawLandmarks = (ctx, landmarks, width, height) => {
    ctx.fillStyle = '#10b981'; // emerald-500
    ctx.strokeStyle = '#6366f1'; // indigo-500
    ctx.lineWidth = 2;

    // Draw connections (simplified for aesthetics)
    const connections = [
      [0,1], [1,2], [2,3], [3,4], // thumb
      [0,5], [5,6], [6,7], [7,8], // index
      [5,9], [9,10], [10,11], [11,12], // middle
      [9,13], [13,14], [14,15], [15,16], // ring
      [13,17], [0,17], [17,18], [18,19], [19,20] // pinky
    ];

    ctx.beginPath();
    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
    });
    ctx.stroke();

    // Draw points
    landmarks.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  // Debounce API calls to prevent flooding the backend
  const lastApiCall = useRef(0);
  
  const classifyLandmarks = async (landmarks) => {
    const now = performance.now();
    if (now - lastApiCall.current < 200) return; // limit to 5 requests per second
    lastApiCall.current = now;

    try {
      const response = await fetch('http://localhost:8000/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ landmarks }),
      });
      
      if (response.ok) {
        const data = await response.json();
        onSignDetected(data.sign, data.confidence);
      }
    } catch (error) {
      console.error("Error classifying sign:", error);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {!isLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-neutral-900">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-400 animate-pulse">Loading AI Models...</p>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute w-full h-full object-cover transform scale-x-[-1]"
      />
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="absolute w-full h-full object-cover transform scale-x-[-1] z-10 pointer-events-none"
      />
    </div>
  );
}

export default WebcamCapture;
