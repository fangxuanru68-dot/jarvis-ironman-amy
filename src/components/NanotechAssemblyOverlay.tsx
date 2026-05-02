import { useEffect, useState } from "react";

interface Props { isActive: boolean; onComplete: () => void; }

// Generate hex fragment positions
const FRAGMENTS = Array.from({ length: 60 }).map((_, i) => {
  const ring = Math.floor(i / 20);
  const angle = (i % 20) * 18 + ring * 9;
  const radius = 60 + ring * 35;
  const a = angle * Math.PI / 180;
  return {
    id: i,
    finalX: Math.cos(a) * radius,
    finalY: Math.sin(a) * radius,
    startX: Math.cos(a) * (radius + 350) + (Math.random() - 0.5) * 200,
    startY: Math.sin(a) * (radius + 350) + (Math.random() - 0.5) * 200,
    rot: angle + 90,
    delay: i * 0.025,
  };
});

const NanotechAssemblyOverlay = ({ isActive, onComplete }: Props) => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!isActive) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 3000);
    const t3 = setTimeout(() => onComplete(), 8000);
    return () => { [t1, t2, t3].forEach(clearTimeout); };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const hex = "M 0,-8 L 7,-4 L 7,4 L 0,8 L -7,4 L -7,-4 Z";

  return (
    <div className="fixed inset-0 pointer-events-none z-[40] animate-fade-in">
      <div className="absolute inset-0" style={{
        background: "radial-gradient(circle at center, hsl(195 100% 50% / 0.08) 0%, transparent 70%)",
      }} />

      {/* Fragments */}
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width="800" height="800" viewBox="-400 -400 800 800">
        {FRAGMENTS.map(f => {
          const isHome = phase >= 1;
          return (
            <g key={f.id}
              style={{
                transform: isHome ? `translate(${f.finalX}px, ${f.finalY}px) rotate(${f.rot}deg)` : `translate(${f.startX}px, ${f.startY}px) rotate(0deg)`,
                opacity: isHome ? 1 : 0,
                transition: `transform 1.2s cubic-bezier(0.5, 0, 0.2, 1) ${f.delay}s, opacity 0.4s ease-out ${f.delay}s`,
              }}>
              <path d={hex} fill="hsl(195 100% 50% / 0.15)"
                stroke="hsl(195 100% 70%)" strokeWidth="0.6" />
            </g>
          );
        })}

        {/* Assembled rings */}
        {[60, 95, 130, 165].map((r, i) => (
          <circle key={i} cx="0" cy="0" r={r} fill="none"
            stroke="hsl(195 100% 70%)" strokeWidth="0.5"
            strokeDasharray="4 3"
            style={{
              opacity: phase >= 1 ? 0.5 : 0,
              transition: `opacity 1s ease-out ${1 + i * 0.15}s`,
              transformOrigin: "center",
            }} />
        ))}

        {/* Central core */}
        <circle cx="0" cy="0" r="22" fill="hsl(195 100% 80% / 0.2)" />
        <circle cx="0" cy="0" r="14" fill="hsl(195 100% 90% / 0.4)"
          style={{
            filter: phase >= 2 ? "drop-shadow(0 0 18px hsl(195 100% 60%))" : "none",
            transition: "filter 0.8s ease-out",
          }} />
      </svg>

      {/* Final lock flash */}
      {phase >= 2 && (
        <div className="absolute inset-0" style={{
          background: "radial-gradient(circle at center, hsl(195 100% 70% / 0.15) 0%, transparent 50%)",
          animation: "nano-lock 0.8s ease-out",
        }} />
      )}

      <div className="absolute top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] text-primary/90">
        ▸ NANOTECH DEPLOYED
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center font-mono text-[9px] tracking-[0.35em] space-y-1">
        <div className="text-primary/70">STRUCTURE {phase >= 2 ? "COMPLETE" : "ASSEMBLING..."}</div>
        <div className={phase >= 2 ? "text-primary" : "text-primary/30"}>
          {phase >= 2 ? "● SYSTEM READY" : "○ STANDBY"}
        </div>
      </div>

      <style>{`@keyframes nano-lock { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }`}</style>
    </div>
  );
};

export default NanotechAssemblyOverlay;
