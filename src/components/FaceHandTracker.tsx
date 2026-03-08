import { useEffect, useRef, useState, useCallback } from "react";

interface FaceHandTrackerProps {
  videoElement: HTMLVideoElement | null;
  isActive: boolean;
  onGesture?: (gesture: string) => void;
  onHandData?: (landmarks: Array<{ x: number; y: number; z: number }>, gesture: string) => void;
  onFaceData?: (faceBox: { x: number; y: number; w: number; h: number } | null, rightEye: { x: number; y: number } | null) => void;
}

type HandLandmark = { x: number; y: number; z: number };

const FaceHandTracker = ({ videoElement, isActive, onGesture, onHandData, onFaceData }: FaceHandTrackerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [faceBox, setFaceBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [handPoints, setHandPoints] = useState<HandLandmark[]>([]);
  const [gestureLabel, setGestureLabel] = useState<string>("");
  const gestureTimeoutRef = useRef<number>(0);
  const lastGestureRef = useRef<string>("");
  const faceDetectorRef = useRef<any>(null);
  const handDetectorRef = useRef<any>(null);
  const visionRef = useRef<any>(null);

  // Load MediaPipe
  useEffect(() => {
    if (!isActive) return;
    let cancelled = false;
    const loadVision = async () => {
      try {
        const vision = await import("@mediapipe/tasks-vision");
        if (cancelled) return;
        visionRef.current = vision;
        const filesetResolver = await vision.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        if (cancelled) return;
        const faceDetector = await vision.FaceDetector.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite", delegate: "GPU" },
          runningMode: "VIDEO", minDetectionConfidence: 0.5,
        });
        if (cancelled) return;
        faceDetectorRef.current = faceDetector;
        const handLandmarker = await vision.HandLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.tflite", delegate: "GPU" },
          runningMode: "VIDEO", numHands: 2, minHandDetectionConfidence: 0.5, minTrackingConfidence: 0.5,
        });
        if (cancelled) return;
        handDetectorRef.current = handLandmarker;
      } catch (e) { console.error("MediaPipe load error:", e); }
    };
    loadVision();
    return () => { cancelled = true; };
  }, [isActive]);

  // Gesture detection
  const detectGesture = useCallback((landmarks: HandLandmark[]): string => {
    if (landmarks.length < 21) return "";
    const thumb_tip = landmarks[4];
    const index_tip = landmarks[8];
    const middle_tip = landmarks[12];
    const ring_tip = landmarks[16];
    const pinky_tip = landmarks[20];
    const wrist = landmarks[0];
    const index_mcp = landmarks[5];
    const middle_mcp = landmarks[9];
    const ring_mcp = landmarks[13];
    const pinky_mcp = landmarks[17];

    const isFingerUp = (tip: HandLandmark, mcp: HandLandmark) => tip.y < mcp.y - 0.02;
    const indexUp = isFingerUp(index_tip, index_mcp);
    const middleUp = isFingerUp(middle_tip, middle_mcp);
    const ringUp = isFingerUp(ring_tip, ring_mcp);
    const pinkyUp = isFingerUp(pinky_tip, pinky_mcp);
    const thumbUp = thumb_tip.y < wrist.y - 0.05;

    if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) return "THUMBS_UP";
    if (indexUp && middleUp && ringUp && pinkyUp) return "OPEN_PALM";
    if (indexUp && middleUp && !ringUp && !pinkyUp) return "PEACE";
    if (indexUp && !middleUp && !ringUp && !pinkyUp) return "POINTING";
    if (!indexUp && !middleUp && !ringUp && !pinkyUp && !thumbUp) return "FIST";
    return "";
  }, []);

  // Detection loop
  useEffect(() => {
    if (!isActive || !videoElement) return;
    let lastTimestamp = -1;
    const detect = () => {
      if (!videoElement || videoElement.readyState < 2) { animFrameRef.current = requestAnimationFrame(detect); return; }
      const now = performance.now();
      if (now - lastTimestamp < 66) { animFrameRef.current = requestAnimationFrame(detect); return; } // ~15fps
      lastTimestamp = now;
      try {
        if (faceDetectorRef.current) {
          const faceResult = faceDetectorRef.current.detectForVideo(videoElement, now);
          if (faceResult.detections?.length > 0) {
            const det = faceResult.detections[0];
            const bb = det.boundingBox;
            if (bb) {
              const fBox = { x: 1 - (bb.originX + bb.width) / videoElement.videoWidth, y: bb.originY / videoElement.videoHeight, w: bb.width / videoElement.videoWidth, h: bb.height / videoElement.videoHeight };
              setFaceBox(fBox);
              // Extract right eye keypoint (index 0 in blaze_face is right eye)
              let rightEye: { x: number; y: number } | null = null;
              if (det.keypoints && det.keypoints.length > 0) {
                // Keypoint 0 = right eye, mirrored
                const kp = det.keypoints[0];
                rightEye = { x: 1 - kp.x, y: kp.y };
              }
              onFaceData?.(fBox, rightEye);
            }
          } else { setFaceBox(null); onFaceData?.(null, null); }
        }
        if (handDetectorRef.current) {
          const handResult = handDetectorRef.current.detectForVideo(videoElement, now);
          if (handResult.landmarks?.length > 0) {
            const mirrored = handResult.landmarks[0].map((lm: HandLandmark) => ({ ...lm, x: 1 - lm.x }));
            setHandPoints(mirrored);
            const gesture = detectGesture(handResult.landmarks[0]);
            
            // Always send hand data for resize tracking
            onHandData?.(mirrored, gesture);

            if (gesture && gesture !== lastGestureRef.current) {
              lastGestureRef.current = gesture;
              setGestureLabel(gesture);
              onGesture?.(gesture);
              clearTimeout(gestureTimeoutRef.current);
              gestureTimeoutRef.current = window.setTimeout(() => { setGestureLabel(""); lastGestureRef.current = ""; }, 2000);
            }
          } else {
            setHandPoints([]);
            onHandData?.([], "");
          }
        }
      } catch { /* silently continue */ }
      animFrameRef.current = requestAnimationFrame(detect);
    };
    const timeout = setTimeout(() => { animFrameRef.current = requestAnimationFrame(detect); }, 2000);
    return () => { clearTimeout(timeout); cancelAnimationFrame(animFrameRef.current); };
  }, [isActive, videoElement, detectGesture, onGesture, onHandData]);

  // Draw overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Face box
      if (faceBox) {
        const fx = faceBox.x * w, fy = faceBox.y * h, fw = faceBox.w * w, fh = faceBox.h * h;
        const pad = 20;
        const bx = fx - pad, by = fy - pad, bw = fw + pad * 2, bh = fh + pad * 2;
        const cornerLen = 20;
        ctx.strokeStyle = "hsl(195, 100%, 50%)";
        ctx.lineWidth = 2;
        ctx.shadowColor = "hsl(195, 100%, 50%)";
        ctx.shadowBlur = 8;

        ctx.beginPath(); ctx.moveTo(bx, by + cornerLen); ctx.lineTo(bx, by); ctx.lineTo(bx + cornerLen, by); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + bw - cornerLen, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cornerLen); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx, by + bh - cornerLen); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + cornerLen, by + bh); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + bw - cornerLen, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cornerLen); ctx.stroke();

        const scanY = by + (Date.now() % 2000) / 2000 * bh;
        ctx.lineWidth = 1; ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.moveTo(bx, scanY); ctx.lineTo(bx + bw, scanY); ctx.stroke();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        ctx.font = "10px 'Orbitron', sans-serif"; ctx.fillStyle = "hsl(195, 100%, 50%)";
        ctx.fillText("FACE DETECTED", bx, by - 8);

        ctx.font = "9px 'JetBrains Mono', monospace"; ctx.fillStyle = "hsl(195, 100%, 50%)";
        const dataX = bx + bw + 10;
        ["ID: VERIFIED", "CONF: 98.7%", `POS: ${Math.round(faceBox.x * 100)}, ${Math.round(faceBox.y * 100)}`, "STATUS: ACTIVE"].forEach((line, i) => {
          ctx.globalAlpha = 0.7; ctx.fillText(line, dataX, by + 12 + i * 14);
        });
        ctx.globalAlpha = 1;
      }

      // Hand landmarks
      if (handPoints.length > 0) {
        ctx.strokeStyle = "hsl(195, 100%, 50%)"; ctx.fillStyle = "hsl(195, 100%, 70%)";
        ctx.lineWidth = 1; ctx.shadowColor = "hsl(195, 100%, 50%)"; ctx.shadowBlur = 4;
        const connections = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
        connections.forEach(([a, b]) => {
          if (handPoints[a] && handPoints[b]) {
            ctx.beginPath(); ctx.globalAlpha = 0.5;
            ctx.moveTo(handPoints[a].x * w, handPoints[a].y * h);
            ctx.lineTo(handPoints[b].x * w, handPoints[b].y * h);
            ctx.stroke();
          }
        });
        handPoints.forEach((p) => { ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(p.x * w, p.y * h, 3, 0, Math.PI * 2); ctx.fill(); });
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;

        const indexTip = handPoints[8];
        if (indexTip) {
          ctx.strokeStyle = "hsl(195, 100%, 50%)"; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.7;
          const cx = indexTip.x * w, cy = indexTip.y * h, size = 15;
          ctx.beginPath(); ctx.arc(cx, cy, size, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx - size - 5, cy); ctx.lineTo(cx - size + 5, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx + size - 5, cy); ctx.lineTo(cx + size + 5, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, cy - size - 5); ctx.lineTo(cx, cy - size + 5); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, cy + size - 5); ctx.lineTo(cx, cy + size + 5); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // Gesture label
      if (gestureLabel) {
        ctx.font = "bold 14px 'Orbitron', sans-serif"; ctx.fillStyle = "hsl(195, 100%, 70%)";
        ctx.shadowColor = "hsl(195, 100%, 50%)"; ctx.shadowBlur = 10;
        const text = `GESTURE: ${gestureLabel.replace("_", " ")}`;
        ctx.fillText(text, w / 2 - ctx.measureText(text).width / 2, h * 0.15);
        ctx.shadowBlur = 0;
      }
    };
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, [faceBox, handPoints, gestureLabel]);

  if (!isActive) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 z-[5] pointer-events-none" style={{ width: "100vw", height: "100vh" }} />;
};

export default FaceHandTracker;
