import { useEffect, useState, useRef } from "react";

interface SystemOverloadOverlayProps {
  isActive: boolean;
}

const SystemOverloadOverlay = ({ isActive }: SystemOverloadOverlayProps) => {
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
  const [blackout, setBlackout] = useState(false);
  const [scanBreak, setScanBreak] = useState(0);
  const [shake, setShake] = useState({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;
    startRef.current = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const intensity = Math.min(1, elapsed * 0.15);

      // Glitch
      if (Math.random() > 0.85) {
        setGlitchOffset({ x: (Math.random() - 0.5) * 10 * intensity, y: (Math.random() - 0.5) * 6 * intensity });
      } else {
        setGlitchOffset(prev => ({ x: prev.x * 0.9, y: prev.y * 0.9 }));
      }

      // Shake
      setShake({
        x: (Math.random() - 0.5) * 4 * intensity,
        y: (Math.random() - 0.5) * 4 * intensity,
      });

      // Blackout flashes
      setBlackout(Math.random() > 0.96);

      // Scan line break position
      setScanBreak((elapsed * 30) % 100);

      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[25]"
      style={{ transform: `translate(${shake.x}px, ${shake.y}px)` }}>
      
      {/* Red/orange warning overlay */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse at center, hsl(0 70% 20% / 0.3), hsl(0 60% 10% / 0.5))`,
      }} />

      {/* Glitch layer */}
      <div className="absolute inset-0 overflow-hidden" style={{
        transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`,
      }}>
        {/* Horizontal glitch bands */}
        {[20, 35, 55, 72, 88].map((y, i) => (
          <div key={i} className="absolute left-0 right-0" style={{
            top: `${y}%`,
            height: `${2 + Math.random() * 3}px`,
            background: `hsl(0 80% 50% / ${0.1 + Math.random() * 0.2})`,
            transform: `translateX(${(Math.random() - 0.5) * 20}px)`,
          }} />
        ))}
      </div>

      {/* Breaking scan lines */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, hsl(0 80% 50% / 0.5) 3px, hsl(0 80% 50% / 0.5) 4px)",
        backgroundSize: "100% 4px",
        transform: `translateY(${scanBreak}px)`,
      }} />

      {/* Distorted HUD circle breaking apart */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="0 0 200 200" className="w-40 h-40">
          {/* Fragmenting rings */}
          <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(0 70% 50% / 0.4)" strokeWidth="1.5"
            strokeDasharray="20 15 8 12" style={{ transform: `rotate(${scanBreak}deg)`, transformOrigin: "center" }} />
          <circle cx="100" cy="100" r="55" fill="none" stroke="hsl(0 70% 50% / 0.3)" strokeWidth="1"
            strokeDasharray="10 20 5 15" style={{ transform: `rotate(${-scanBreak * 1.3}deg)`, transformOrigin: "center" }} />
          <circle cx="100" cy="100" r="30" fill="none" stroke="hsl(0 70% 50% / 0.5)" strokeWidth="2"
            strokeDasharray="8 12" />
          {/* Warning symbol */}
          <polygon points="100,65 115,95 85,95" fill="none" stroke="hsl(0 80% 60% / 0.7)" strokeWidth="2" />
          <line x1="100" y1="75" x2="100" y2="87" stroke="hsl(0 80% 60% / 0.7)" strokeWidth="2" />
          <circle cx="100" cy="91" r="1" fill="hsl(0 80% 60% / 0.7)" />
        </svg>
      </div>

      {/* Warning text - flickering */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 animate-hud-flicker">
        <div className="font-orbitron text-sm tracking-[0.4em] animate-pulse" style={{ color: "hsl(0 80% 55% / 0.9)" }}>
          ⚠ SYSTEM OVERLOAD ⚠
        </div>
      </div>

      {/* Side warnings */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 font-mono text-[8px] tracking-wider space-y-3">
        <div className="animate-pulse" style={{ color: "hsl(0 70% 55% / 0.7)" }}>CRITICAL FAILURE</div>
        <div style={{ color: "hsl(30 80% 55% / 0.5)" }}>CORE TEMP: 847°C</div>
        <div className="animate-hud-flicker" style={{ color: "hsl(0 70% 55% / 0.6)" }}>REACTOR: UNSTABLE</div>
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 font-mono text-[8px] tracking-wider space-y-3 text-right">
        <div style={{ color: "hsl(0 70% 55% / 0.5)" }}>PWR DRAIN: 340%</div>
        <div className="animate-pulse" style={{ color: "hsl(0 70% 55% / 0.6)" }}>SHIELDS: FAILING</div>
        <div style={{ color: "hsl(30 80% 55% / 0.5)" }}>BACKUP: OFFLINE</div>
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-[0.3em] animate-pulse"
        style={{ color: "hsl(0 80% 55% / 0.7)" }}>
        CORE INSTABILITY DETECTED
      </div>

      {/* Blackout flash */}
      {blackout && <div className="absolute inset-0 bg-black/60" />}

      {/* Flashing border */}
      <div className="absolute inset-0 border-2 animate-pulse" style={{ borderColor: "hsl(0 70% 50% / 0.2)" }} />
    </div>
  );
};

export default SystemOverloadOverlay;
