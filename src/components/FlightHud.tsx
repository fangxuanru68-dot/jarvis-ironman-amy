import { useEffect, useState, useRef } from "react";

const FlightHud = ({ size = 120 }: { size?: number }) => {
  const [rotation, setRotation] = useState(0);
  const [innerRotation, setInnerRotation] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    let raf: number;
    const animate = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setRotation(elapsed * 15 % 360);
      setInnerRotation(elapsed * -25 % 360);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const c = size / 2;
  const r = size / 2 - 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, hsl(195 100% 50% / 0.08) 0%, transparent 70%)`,
        }}
      />

      {/* Outer ring - slow rotation with compass marks */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 w-full h-full"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <circle cx={c} cy={c} r={r} fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
        <circle cx={c} cy={c} r={r - 3} fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="1" strokeDasharray="2 6" />
        {/* Tick marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i * 6) * Math.PI / 180;
          const isMajor = i % 5 === 0;
          const inner = r - (isMajor ? 8 : 5);
          const outer = r - 3;
          return (
            <line
              key={i}
              x1={c + Math.cos(a) * inner}
              y1={c + Math.sin(a) * inner}
              x2={c + Math.cos(a) * outer}
              y2={c + Math.sin(a) * outer}
              stroke={`hsl(195 100% 50% / ${isMajor ? 0.6 : 0.2})`}
              strokeWidth={isMajor ? 1.2 : 0.5}
            />
          );
        })}
      </svg>

      {/* Second ring - counter rotation */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 w-full h-full"
        style={{ transform: `rotate(${innerRotation}deg)` }}
      >
        <circle cx={c} cy={c} r={r * 0.72} fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="1.5" />
        {/* Arc segments */}
        {Array.from({ length: 4 }).map((_, i) => {
          const startA = i * 90 + 10;
          const endA = i * 90 + 70;
          const sr = r * 0.72;
          const x1 = c + Math.cos(startA * Math.PI / 180) * sr;
          const y1 = c + Math.sin(startA * Math.PI / 180) * sr;
          const x2 = c + Math.cos(endA * Math.PI / 180) * sr;
          const y2 = c + Math.sin(endA * Math.PI / 180) * sr;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${sr} ${sr} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke="hsl(195 100% 60% / 0.5)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
        {/* Diamond markers */}
        {[0, 90, 180, 270].map((deg) => {
          const a = deg * Math.PI / 180;
          const dr = r * 0.72;
          const px = c + Math.cos(a) * dr;
          const py = c + Math.sin(a) * dr;
          return (
            <polygon
              key={deg}
              points={`${px},${py - 3} ${px + 2},${py} ${px},${py + 3} ${px - 2},${py}`}
              fill="hsl(195 100% 50% / 0.7)"
            />
          );
        })}
      </svg>

      {/* Inner detail ring - slow rotation */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 w-full h-full"
        style={{ transform: `rotate(${rotation * 0.5}deg)` }}
      >
        <circle cx={c} cy={c} r={r * 0.52} fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.8" strokeDasharray="4 3" />
        {/* Small bars */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30) * Math.PI / 180;
          return (
            <line
              key={i}
              x1={c + Math.cos(a) * r * 0.48}
              y1={c + Math.sin(a) * r * 0.48}
              x2={c + Math.cos(a) * r * 0.55}
              y2={c + Math.sin(a) * r * 0.55}
              stroke={`hsl(195 100% 50% / ${i % 3 === 0 ? 0.6 : 0.25})`}
              strokeWidth="1"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Static center content */}
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 w-full h-full">
        {/* Center core glow */}
        <circle cx={c} cy={c} r={r * 0.18} fill="hsl(195 100% 50% / 0.08)" />
        <circle cx={c} cy={c} r={r * 0.12} fill="hsl(195 100% 50% / 0.15)" />

        {/* Drone/aircraft silhouette */}
        {/* Body */}
        <line x1={c} y1={c - 6} x2={c} y2={c + 8} stroke="hsl(195 100% 70% / 0.9)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Wings */}
        <line x1={c - 10} y1={c + 2} x2={c + 10} y2={c + 2} stroke="hsl(195 100% 70% / 0.9)" strokeWidth="1.2" strokeLinecap="round" />
        {/* Tail */}
        <line x1={c - 5} y1={c + 7} x2={c + 5} y2={c + 7} stroke="hsl(195 100% 70% / 0.7)" strokeWidth="1" strokeLinecap="round" />
        {/* Nose dot */}
        <circle cx={c} cy={c - 7} r="1.5" fill="hsl(195 100% 80% / 0.9)" />
      </svg>

      {/* Labels - static, outside rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* FLIGHT label */}
        <span
          className="absolute font-orbitron tracking-[0.2em] text-primary/80"
          style={{ fontSize: size * 0.06, top: c + r * 0.28 }}
        >
          FLIGHT
        </span>

        {/* Cardinal labels */}
        <span className="absolute font-mono text-primary/40" style={{ fontSize: size * 0.055, top: 2 , left: '50%', transform: 'translateX(-50%)' }}>N</span>
        <span className="absolute font-mono text-primary/30" style={{ fontSize: size * 0.05, bottom: 2, left: '50%', transform: 'translateX(-50%)' }}>S</span>
        <span className="absolute font-mono text-primary/30" style={{ fontSize: size * 0.05, right: 4, top: '50%', transform: 'translateY(-50%)' }}>E</span>
        <span className="absolute font-mono text-primary/30" style={{ fontSize: size * 0.05, left: 4, top: '50%', transform: 'translateY(-50%)' }}>W</span>

        {/* Sub-labels */}
        <span className="absolute font-mono text-primary/25" style={{ fontSize: size * 0.04, top: c - r * 0.5, left: c + r * 0.15 }}>HOUR</span>
        <span className="absolute font-mono text-primary/25" style={{ fontSize: size * 0.04, top: c - r * 0.15, right: size * 0.1 }}>SEC</span>
        <span className="absolute font-mono text-primary/25" style={{ fontSize: size * 0.04, bottom: c - r * 0.35, left: size * 0.12 }}>MIN</span>
      </div>
    </div>
  );
};

export default FlightHud;
