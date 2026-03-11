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

  useEffect(() => {
    if (!isActive) return;
    setPulseCount(0);
  }, [isActive]);

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

  useEffect(() => {
    if (!isActive) return;
    const anim = setInterval(() => {
      setRotation(prev => (prev + 2) % 360);
    }, 30);
    return () => clearInterval(anim);
  }, [isActive]);

  if (!isActive) return null;

  const eyeX = rightEyePos ? rightEyePos.x * 100 : 68;
  const eyeY = rightEyePos ? rightEyePos.y * 100 : 28;

  return (
    <div className="fixed inset-0 pointer-events-none z-[25]">
      {visible && (
        <div
          className="absolute animate-scale-in"
          style={{
            left: `${eyeX}%`,
            top: `${eyeY}%`,
            width: "220px",
            height: "220px",
            transform: "translate(-50%, -50%)",
            transition: "left 0.1s ease-out, top 0.1s ease-out",
          }}
        >
          {/* Outer rotating ring - thicker, more prominent */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Outer glow ring */}
            <circle cx="100" cy="100" r="95" fill="none"
              stroke="hsl(195 100% 50% / 0.2)" strokeWidth="1" />
            {/* Main outer ring - thick dashed */}
            <circle cx="100" cy="100" r="90" fill="none"
              stroke="hsl(195 100% 50% / 0.8)" strokeWidth="3" strokeDasharray="16 6" />
            {/* Secondary ring */}
            <circle cx="100" cy="100" r="75" fill="none"
              stroke="hsl(195 100% 50% / 0.5)" strokeWidth="2" />
            {/* Inner detail ring */}
            <circle cx="100" cy="100" r="60" fill="none"
              stroke="hsl(195 100% 50% / 0.3)" strokeWidth="1.5" strokeDasharray="8 4" />
            {/* Tick marks - thicker */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
              <line key={angle} x1="100" y1="12" x2="100" y2="28"
                stroke="hsl(195 100% 50% / 0.9)" strokeWidth="3"
                transform={`rotate(${angle} 100 100)`} />
            ))}
            {/* Corner brackets - thicker, more cinematic */}
            <path d="M 45 30 L 25 30 L 25 50" fill="none" stroke="hsl(195 100% 50% / 0.9)" strokeWidth="3.5" />
            <path d="M 155 30 L 175 30 L 175 50" fill="none" stroke="hsl(195 100% 50% / 0.9)" strokeWidth="3.5" />
            <path d="M 45 170 L 25 170 L 25 150" fill="none" stroke="hsl(195 100% 50% / 0.9)" strokeWidth="3.5" />
            <path d="M 155 170 L 175 170 L 175 150" fill="none" stroke="hsl(195 100% 50% / 0.9)" strokeWidth="3.5" />
            {/* Crosshair lines */}
            <line x1="100" y1="35" x2="100" y2="55" stroke="hsl(195 100% 50% / 0.6)" strokeWidth="2" />
            <line x1="100" y1="145" x2="100" y2="165" stroke="hsl(195 100% 50% / 0.6)" strokeWidth="2" />
            <line x1="35" y1="100" x2="55" y2="100" stroke="hsl(195 100% 50% / 0.6)" strokeWidth="2" />
            <line x1="145" y1="100" x2="165" y2="100" stroke="hsl(195 100% 50% / 0.6)" strokeWidth="2" />
          </svg>

          {/* Counter-rotating inner ring */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full"
            style={{ transform: `rotate(${-rotation * 1.5}deg)` }}>
            <circle cx="100" cy="100" r="45" fill="none"
              stroke="hsl(195 100% 50% / 0.4)" strokeWidth="2" strokeDasharray="8 4" />
            <path d="M 100 60 A 40 40 0 0 1 135 85" fill="none"
              stroke="hsl(195 100% 50% / 0.8)" strokeWidth="3" />
            <path d="M 100 140 A 40 40 0 0 1 65 115" fill="none"
              stroke="hsl(195 100% 50% / 0.8)" strokeWidth="3" />
          </svg>

          {/* Center crosshair - bigger, glowing */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full border-2 border-primary"
              style={{ boxShadow: "0 0 12px hsl(195 100% 50% / 0.8), 0 0 24px hsl(195 100% 50% / 0.3)" }} />
          </div>

          {/* Data labels */}
          <div className="absolute -right-24 top-1/2 -translate-y-1/2">
            <div className="font-mono text-[8px] text-primary/80 tracking-wider">
              <div>LOCK: {pulseCount}</div>
              <div className="font-orbitron text-[9px]">{rightEyePos ? "LOCKED" : "SEARCHING"}</div>
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
            <div className="font-orbitron text-[7px] text-primary/60 tracking-[0.3em]">TARGETING</div>
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
