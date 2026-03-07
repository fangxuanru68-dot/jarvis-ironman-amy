import { useEffect, useRef } from "react";

interface FullScreenCameraProps {
  isActive: boolean;
}

const FullScreenCamera = ({ isActive }: FullScreenCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      console.error("Camera access denied");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  // Expose capture function globally
  useEffect(() => {
    const captureFrame = (): string | null => {
      const video = videoRef.current;
      if (!video || !isActive) return null;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.7);
    };
    (window as any).__jarvisCaptureFrame = captureFrame;
    return () => { delete (window as any).__jarvisCaptureFrame; };
  });

  if (!isActive) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="fixed inset-0 w-full h-full object-cover transform scale-x-[-1] z-0"
    />
  );
};

export default FullScreenCamera;
