import { useEffect, useState, useRef } from "react";

interface FightModeOverlayProps {
  isActive: boolean;
  rightEyePos?: { x: number; y: number } | null;
}

const FightModeOverlay = ({ isActive, rightEyePos }: FightModeOverlayProps) => {
  const [rotation, setRotation] = useState(0);
  const [scanAngle, setScanAngle] = useState(0);
  const [targetDistance, setTargetDistance] = useState(142);
  const [threatLevel, setThreatLevel] = useState(0);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  // Animation loop
  useEffect(() => {
    if (!isActive) return;
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setRotation(elapsed * 60 % 360);
      setScanAngle(elapsed * 45 % 360);
      setTargetDistance(Math.round(142 + Math.sin(elapsed * 0.7) * 30));
      setThreatLevel(Math.min(100, Math.round(Math.abs(Math.sin(elapsed * 0.3)) * 100)));
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isActive]);

  if (!isActive) return null;

  const eyeX = rightEyePos ? rightEyePos.x * 100 : 68;
  const eyeY = rightEyePos ? rightEyePos.y * 100 : 28;
  const locked = !!rightEyePos;

  return (
    <div className="fixed inset-0 pointer-events-none z-[25]">
      {/* Main targeting reticle */}
      <div
        className="absolute"
        style={{
          left: `${eyeX}%`,
          top: `${eyeY}%`,
          width: "220px",
          height: "220px",
          transform: "translate(-50%, -50%)",
          transition: "left 0.08s ease-out, top 0.08s ease-out",
        }}
      >
        {/* Outermost ring - slow rotation with tick marks */}
        <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full"
          style={{ transform: `rotate(${rotation * 0.3}deg)`, overflow: "visible" }}>
          <circle cx="150" cy="150" r="140" fill="none"
            stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
          <circle cx="150" cy="150" r="135" fill="none"
            stroke="hsl(195 100% 50% / 0.4)" strokeWidth="1" strokeDasharray="2 14" />
          {/* Major tick marks */}
          {Array.from({ length: 36 }).map((_, i) => (
            <line key={i} x1="150" y1="12" x2="150" y2={i % 3 === 0 ? "24" : "18"}
              stroke={`hsl(195 100% 50% / ${i % 3 === 0 ? 0.6 : 0.25})`}
              strokeWidth={i % 3 === 0 ? "1.5" : "0.8"}
              transform={`rotate(${i * 10} 150 150)`} />
          ))}
          {/* Degree labels at cardinal points */}
          {[0, 90, 180, 270].map(deg => (
            <text key={deg} x="150" y="32" fill="hsl(195 100% 50% / 0.5)"
              fontSize="6" fontFamily="monospace" textAnchor="middle"
              transform={`rotate(${deg} 150 150)`}>{String(deg).padStart(3, "0")}</text>
          ))}
        </svg>

        {/* Scanning arc */}
        <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full"
          style={{ transform: `rotate(${scanAngle}deg)` }}>
          <defs>
            <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(195 100% 50% / 0)" />
              <stop offset="100%" stopColor="hsl(195 100% 50% / 0.5)" />
            </linearGradient>
          </defs>
          <path d={`M 150 150 L ${150 + 120 * Math.cos(-0.3)} ${150 + 120 * Math.sin(-0.3)} A 120 120 0 0 1 ${150 + 120 * Math.cos(0.3)} ${150 + 120 * Math.sin(0.3)} Z`}
            fill="url(#scanGrad)" opacity="0.3" />
        </svg>

        {/* Middle ring - counter rotation */}
        <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full"
          style={{ transform: `rotate(${-rotation * 0.8}deg)` }}>
          <circle cx="150" cy="150" r="100" fill="none"
            stroke="hsl(195 100% 50% / 0.3)" strokeWidth="1" strokeDasharray="8 4" />
          {/* Arc segments */}
          <path d="M 150 55 A 95 95 0 0 1 235 120" fill="none"
            stroke="hsl(195 100% 50% / 0.6)" strokeWidth="2" />
          <path d="M 150 245 A 95 95 0 0 1 65 180" fill="none"
            stroke="hsl(195 100% 50% / 0.6)" strokeWidth="2" />
        </svg>

        {/* Inner ring - fast rotation */}
        <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full"
          style={{ transform: `rotate(${rotation * 1.5}deg)` }}>
          <circle cx="150" cy="150" r="60" fill="none"
            stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.8" />
          {/* Small diamond markers */}
          {[0, 60, 120, 180, 240, 300].map(a => (
            <polygon key={a} points="150,93 153,100 150,107 147,100"
              fill="hsl(195 100% 50% / 0.5)"
              transform={`rotate(${a} 150 150)`} />
          ))}
        </svg>

        {/* Center targeting diamond */}
        <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full">
          {/* Crosshair lines */}
          <line x1="150" y1="120" x2="150" y2="140" stroke="hsl(195 100% 50% / 0.8)" strokeWidth="1" />
          <line x1="150" y1="160" x2="150" y2="180" stroke="hsl(195 100% 50% / 0.8)" strokeWidth="1" />
          <line x1="120" y1="150" x2="140" y2="150" stroke="hsl(195 100% 50% / 0.8)" strokeWidth="1" />
          <line x1="160" y1="150" x2="180" y2="150" stroke="hsl(195 100% 50% / 0.8)" strokeWidth="1" />
          {/* Center dot with glow */}
          <circle cx="150" cy="150" r="3" fill="hsl(195 100% 50% / 0.9)"
            filter="url(#glow)" />
          <circle cx="150" cy="150" r="6" fill="none"
            stroke="hsl(195 100% 50% / 0.4)" strokeWidth="0.8" />
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        </svg>

        {/* Corner brackets - movie style */}
        <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full">
          <path d="M 60 70 L 60 55 L 75 55" fill="none" stroke="hsl(195 100% 50% / 0.7)" strokeWidth="1.5" />
          <path d="M 240 70 L 240 55 L 225 55" fill="none" stroke="hsl(195 100% 50% / 0.7)" strokeWidth="1.5" />
          <path d="M 60 230 L 60 245 L 75 245" fill="none" stroke="hsl(195 100% 50% / 0.7)" strokeWidth="1.5" />
          <path d="M 240 230 L 240 245 L 225 245" fill="none" stroke="hsl(195 100% 50% / 0.7)" strokeWidth="1.5" />
        </svg>

        {/* Right side data panel */}
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 font-mono text-[7px] leading-relaxed tracking-wider"
          style={{ color: "hsl(195 100% 50% / 0.7)" }}>
          <div>TGT DIST: <span className="text-primary/90">{targetDistance}m</span></div>
          <div>STATUS: <span className={locked ? "text-green-400/80" : "text-yellow-400/80"}>
            {locked ? "LOCKED" : "TRACKING"}
          </span></div>
          <div>THREAT: <span style={{ color: threatLevel > 70 ? "hsl(0 80% 60% / 0.8)" : "hsl(195 100% 50% / 0.8)" }}>
            {threatLevel}%
          </span></div>
          <div>MODE: FIGHT</div>
        </div>

        {/* Left side data panel */}
        <div className="absolute -left-28 top-1/2 -translate-y-1/2 font-mono text-[7px] leading-relaxed tracking-wider text-right"
          style={{ color: "hsl(195 100% 50% / 0.5)" }}>
          <div>RPLS: ARMED</div>
          <div>PWR: 100%</div>
          <div>SCAN: ACTIVE</div>
        </div>

        {/* Bottom label */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[6px] tracking-[0.35em]"
          style={{ color: "hsl(195 100% 50% / 0.5)" }}>
          COMBAT TARGETING SYSTEM
        </div>
      </div>

      {/* Top fight mode indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="font-mono text-[10px] tracking-[0.3em]"
          style={{ color: "hsl(0 80% 60% / 0.8)" }}>FIGHT MODE ENGAGED</span>
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      </div>

      {/* Thin border flash */}
      <div className="absolute inset-0 border border-red-500/10" />
    </div>
  );
};

export default FightModeOverlay;
