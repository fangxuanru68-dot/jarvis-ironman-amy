import { useEffect, useRef, useState } from "react";
import { Video, VideoOff } from "lucide-react";

interface LiveCameraProps {
  onFrame?: (dataUrl: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

const LiveCamera = ({ isActive, onToggle }: LiveCameraProps) => {
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
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
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

  // Capture a frame from the live feed
  const captureFrame = (): string | null => {
    const video = videoRef.current;
    if (!video || !isActive) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.7);
  };

  // Expose captureFrame via ref-like pattern
  useEffect(() => {
    (window as any).__jarvisCaptureFrame = captureFrame;
    return () => { delete (window as any).__jarvisCaptureFrame; };
  });

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="absolute top-2 right-2 z-20 p-1.5 rounded-sm bg-card/70 backdrop-blur-sm border border-border/30 text-muted-foreground hover:text-primary transition-colors"
        title={isActive ? "关闭摄像头" : "开启摄像头"}
      >
        {isActive ? <Video size={14} /> : <VideoOff size={14} />}
      </button>
      
      {isActive ? (
        <div className="relative overflow-hidden rounded-sm border border-primary/30">
          {/* HUD overlay on camera */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-2 left-2 font-orbitron text-[8px] tracking-[0.2em] text-primary/70">LIVE FEED</div>
            <div className="absolute bottom-2 left-2 font-mono text-[8px] text-primary/50">CAM_01</div>
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-primary/50" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-primary/50" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-primary/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-primary/50" />
            {/* Scan line */}
            <div className="w-full h-[1px] bg-primary/20 animate-scan-line" />
          </div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto transform scale-x-[-1]"
          />
        </div>
      ) : (
        <div className="aspect-[4/3] rounded-sm border border-border/30 bg-card/30 flex items-center justify-center">
          <div className="text-center">
            <VideoOff size={24} className="mx-auto text-muted-foreground/50 mb-1" />
            <p className="font-mono text-[9px] text-muted-foreground/50">CAMERA OFFLINE</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveCamera;
