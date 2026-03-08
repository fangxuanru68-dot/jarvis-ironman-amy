import { useEffect, useState } from "react";

interface WarModeOverlayProps {
  isActive: boolean;
  onEnd: () => void;
  rightEyePos?: { x: number; y: number } | null;
}

const WarModeOverlay = ({ isActive, onEnd, rightEyePos }: WarModeOverlayProps) => {
  const [visible, setVisible] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pulseCount, setPulseCount] = useState(0);

  // Auto-end after 10 seconds
  useEffect(() => {
    if (!isActive) return;
    setPulseCount(0);
    const timer = setTimeout(() => onEnd(), 10000);
    return () => clearTimeout(timer);
  }, [isActive, onEnd]);

  // Show reticle every 3 seconds
  useEffect(() => {
    if (!isActive) return;
    setVisible(true);
    setPulseCount(1);
    const showTimeout = setTimeout(() => setVisible(false), 1800);

    const interval = setInterval(() => {
      setPulseCount(prev => prev + 1);
      setVisible(true);
      setTimeout(() => setVisible(false), 1800);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(showTimeout);
      setVisible(false);
    };
  }, [isActive]);

  // Continuous rotation
  useEffect(() => {
    if (!isActive) return;
    const anim = setInterval(() => {
      setRotation(prev => (prev + 2) % 360);
    }, 30);
    return () => clearInterval(anim);
  }, [isActive]);

  if (!isActive) return null;

  // Calculate position: use right eye tracking or fallback
  const eyeX = rightEyePos ? rightEyePos.x * 100 : 68;
  const eyeY = rightEyePos ? rightEyePos.y * 100 : 28;

  return (
    <div className="fixed inset-0 pointer-events-none z-[25]">
      {/* Right eye targeting reticle - follows face */}
      {visible && (
        <div
          className="absolute animate-scale-in"
          style={{
            left: `${eyeX}%`,
            top: `${eyeY}%`,
            width: "160px",
            height: "160px",
            transform: "translate(-50%, -50%)",
            transition: "left 0.1s ease-out, top 0.1s ease-out",
          }}
        >
          {/* Outer rotating ring */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <circle cx="100" cy="100" r="90" fill="none"
              stroke="hsl(195 100% 50% / 0.6)" strokeWidth="1.5" strokeDasharray="12 8" />
            <circle cx="100" cy="100" r="70" fill="none"
              stroke="hsl(195 100% 50% / 0.4)" strokeWidth="1" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
              <line key={angle} x1="100" y1="18" x2="100" y2="28"
                stroke="hsl(195 100% 50% / 0.7)" strokeWidth="1.5"
                transform={`rotate(${angle} 100 100)`} />
            ))}
            <path d="M 55 40 L 40 40 L 40 55" fill="none" stroke="hsl(195 100% 50% / 0.8)" strokeWidth="2" />
            <path d="M 145 40 L 160 40 L 160 55" fill="none" stroke="hsl(195 100% 50% / 0.8)" strokeWidth="2" />
            <path d="M 55 160 L 40 160 L 40 145" fill="none" stroke="hsl(195 100% 50% / 0.8)" strokeWidth="2" />
            <path d="M 145 160 L 160 160 L 160 145" fill="none" stroke="hsl(195 100% 50% / 0.8)" strokeWidth="2" />
          </svg>

          {/* Counter-rotating inner ring */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full"
            style={{ transform: `rotate(${-rotation * 1.5}deg)` }}>
            <circle cx="100" cy="100" r="50" fill="none"
              stroke="hsl(195 100% 50% / 0.3)" strokeWidth="1" strokeDasharray="6 6" />
            <path d="M 100 55 A 45 45 0 0 1 140 85" fill="none"
              stroke="hsl(195 100% 50% / 0.6)" strokeWidth="2" />
            <path d="M 100 145 A 45 45 0 0 1 60 115" fill="none"
              stroke="hsl(195 100% 50% / 0.6)" strokeWidth="2" />
          </svg>

          {/* Center crosshair */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full border border-primary/80"
              style={{ boxShadow: "0 0 8px hsl(195 100% 50% / 0.6)" }} />
          </div>

          {/* Data labels */}
          <div className="absolute -right-20 top-1/2 -translate-y-1/2">
            <div className="font-mono text-[7px] text-primary/60 tracking-wider">
              <div>LOCK: {pulseCount}</div>
              <div>TRK: {rightEyePos ? "LOCKED" : "SEARCHING"}</div>
            </div>
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
            <div className="font-mono text-[6px] text-primary/40 tracking-widest">TARGETING</div>
          </div>
        </div>
      )}

      {/* War mode indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="font-orbitron text-[10px] tracking-[0.3em] text-destructive/80">WAR MODE ACTIVE</span>
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
      </div>

      {/* Border */}
      <div className="absolute inset-0 border-2 border-destructive/10 rounded-none" />
    </div>
  );
};

export default WarModeOverlay;
