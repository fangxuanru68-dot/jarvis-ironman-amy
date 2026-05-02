import { useEffect, useState } from "react";

interface Props { isActive: boolean; onComplete: () => void; }

const ThunderRecallOverlay = ({ isActive, onComplete }: Props) => {
  const [phase, setPhase] = useState(0);
  const [bolts, setBolts] = useState<number[]>([]);
  const [charge, setCharge] = useState(0);

  useEffect(() => {
    if (!isActive) { setPhase(0); setCharge(0); setBolts([]); return; }
    setPhase(1);
    const chargeInt = setInterval(() => setCharge(c => Math.min(100, c + 2)), 80);
    const boltInt = setInterval(() => setBolts(b => [...b.slice(-5), Date.now()]), 350);
    const end = setTimeout(() => onComplete(), 10000);
    return () => { clearInterval(chargeInt); clearInterval(boltInt); clearTimeout(end); };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const jagged = (sx: number, sy: number, ex: number, ey: number) => {
    const segs = 6; const pts = [`${sx},${sy}`];
    for (let i = 1; i < segs; i++) {
      const t = i / segs;
      const x = sx + (ex - sx) * t + (Math.random() - 0.5) * 8;
      const y = sy + (ey - sy) * t + (Math.random() - 0.5) * 8;
      pts.push(`${x},${y}`);
    }
    pts.push(`${ex},${ey}`);
    return pts.join(" ");
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[40] animate-fade-in">
      {/* Cloud-like dim layer */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(circle at 50% 50%, hsl(260 60% 20% / 0.25) 0%, hsl(220 40% 5% / 0.5) 80%)",
      }} />

      {/* Lightning arcs converging to center */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {bolts.map((id, i) => {
          const angle = (id % 360) * (Math.PI / 180);
          const dist = 50;
          const sx = 50 + Math.cos(angle) * dist;
          const sy = 50 + Math.sin(angle) * dist;
          return (
            <polyline key={id} points={jagged(sx, sy, 50, 50)}
              fill="none" stroke="hsl(220 100% 80%)" strokeWidth="0.3"
              style={{ animation: "lightning-flash 0.4s ease-out forwards", filter: "drop-shadow(0 0 1px hsl(260 100% 70%))" }}
              vectorEffect="non-scaling-stroke" />
          );
        })}
      </svg>

      {/* Central charging core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 220, height: 220 }}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(220 80% 60% / 0.3)" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(260 80% 70% / 0.5)" strokeWidth="1.2"
            strokeDasharray={`${(charge / 100) * 502.6} 502.6`}
            transform="rotate(-90 100 100)" />
          <circle cx="100" cy="100" r="60" fill="hsl(220 100% 70% / 0.1)" />
          <circle cx="100" cy="100" r="20" fill="hsl(220 100% 90% / 0.5)" className="animate-pulse-glow" />
        </svg>
      </div>

      {/* Random screen flashes */}
      <div className="absolute inset-0 bg-white/0" style={{
        animation: "thunder-flash 3s ease-out infinite",
      }} />

      {/* HUD text */}
      <div className="absolute top-8 left-8 font-mono text-[10px] tracking-[0.3em] text-cyan-300 space-y-2">
        <div>⚡ ENERGY SPIKE DETECTED</div>
        <div>⚡ THUNDER FIELD ACTIVE</div>
        <div className="text-purple-300">⚡ POWER CHANNELING · {charge}%</div>
      </div>

      <style>{`
        @keyframes lightning-flash { 0% { opacity: 0; } 20% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes thunder-flash { 0%, 88%, 100% { background-color: rgba(255,255,255,0); } 90% { background-color: rgba(180,200,255,0.08); } 92% { background-color: rgba(255,255,255,0); } 94% { background-color: rgba(180,200,255,0.05); } }
      `}</style>
    </div>
  );
};

export default ThunderRecallOverlay;
