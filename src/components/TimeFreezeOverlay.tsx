import { useEffect, useState } from "react";

interface TimeFreezeOverlayProps {
  isActive: boolean;
}

const TimeFreezeOverlay = ({ isActive }: TimeFreezeOverlayProps) => {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.4,
    }))
  );

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[25]">
      {/* Blue overlay */}
      <div className="absolute inset-0" style={{
        background: "hsl(210 60% 30% / 0.15)",
      }} />

      {/* Frozen particles */}
      {particles.map((p, i) => (
        <div key={i} className="absolute rounded-full bg-primary" style={{
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          opacity: p.opacity,
          boxShadow: `0 0 ${p.size * 3}px hsl(var(--primary) / 0.3)`,
        }} />
      ))}

      {/* Very slow pulse ring in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="0 0 200 200" className="w-32 h-32" style={{
          animation: "rotate-slow 200s linear infinite",
        }}>
          <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--primary) / 0.1)" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="0.5"
            strokeDasharray="4 8" />
        </svg>
      </div>

      {/* HUD text */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="font-orbitron text-[10px] tracking-[0.4em]" style={{
          color: "hsl(var(--primary) / 0.6)",
          animation: "pulse-glow 8s ease-in-out infinite",
        }}>
          TIME DILATION ACTIVE
        </div>
        <div className="font-mono text-[8px] tracking-[0.3em]" style={{
          color: "hsl(var(--primary) / 0.3)",
          animation: "pulse-glow 10s ease-in-out infinite",
        }}>
          SYSTEM SPEED REDUCED
        </div>
      </div>

      {/* Slow scan line */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="w-full h-[1px]" style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.2), transparent)",
          animation: "scan-line 40s linear infinite",
        }} />
      </div>
    </div>
  );
};

export default TimeFreezeOverlay;
