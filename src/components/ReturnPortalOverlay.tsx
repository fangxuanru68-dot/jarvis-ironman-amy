import { useEffect, useState } from "react";

interface Props { isActive: boolean; onComplete: () => void; }

const PORTAL_POSITIONS = [
  { x: "12%", y: "22%", size: 110, delay: 0 },
  { x: "85%", y: "18%", size: 130, delay: 0.4 },
  { x: "8%", y: "70%", size: 140, delay: 0.8 },
  { x: "88%", y: "75%", size: 120, delay: 1.2 },
  { x: "30%", y: "85%", size: 100, delay: 1.6 },
  { x: "70%", y: "12%", size: 95, delay: 2.0 },
  { x: "50%", y: "78%", size: 115, delay: 2.4 },
];

const ReturnPortalOverlay = ({ isActive, onComplete }: Props) => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!isActive) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => onComplete(), 12000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[40] animate-fade-in">
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, hsl(195 100% 50% / 0.06) 0%, transparent 60%)",
      }} />

      {/* Portals */}
      {PORTAL_POSITIONS.map((p, i) => (
        <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size,
            opacity: phase ? 1 : 0,
            transition: `opacity 1.2s ease-out ${p.delay}s, transform 1.2s ease-out ${p.delay}s`,
            transform: phase ? "scale(1)" : "scale(0.3)",
          }}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id={`pg${i}`}>
                <stop offset="0%" stopColor="hsl(195 100% 90% / 0.3)" />
                <stop offset="60%" stopColor="hsl(195 100% 60% / 0.2)" />
                <stop offset="100%" stopColor="hsl(195 100% 50% / 0)" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="46" fill={`url(#pg${i})`} />
            <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(195 100% 75%)" strokeWidth="0.6" opacity="0.7" className="animate-rotate-slow" style={{ transformOrigin: "50% 50%" }} />
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(195 100% 65% / 0.5)" strokeWidth="0.4" strokeDasharray="3 2" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="hsl(195 100% 80% / 0.6)" strokeWidth="0.3" />
            <circle cx="50" cy="50" r="3" fill="hsl(195 100% 90%)" opacity="0.8">
              <animate attributeName="r" values="2;5;2" dur="3s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      ))}

      {/* Connection lines from portals to center */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: phase ? 0.3 : 0, transition: "opacity 2s ease-out 2.5s" }}>
        {PORTAL_POSITIONS.map((p, i) => (
          <line key={i} x1={p.x} y1={p.y} x2="50%" y2="50%"
            stroke="hsl(195 100% 70%)" strokeWidth="0.5" strokeDasharray="2 4" />
        ))}
      </svg>

      {/* Central arc-reactor pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 180, height: 180, opacity: phase ? 1 : 0, transition: "opacity 2s ease-out 1s" }}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(195 100% 60% / 0.3)" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="hsl(195 100% 70% / 0.5)" strokeWidth="0.8" className="animate-rotate-slow" style={{ transformOrigin: "100px 100px" }} strokeDasharray="6 4" />
          <circle cx="100" cy="100" r="30" fill="hsl(195 100% 80% / 0.15)" />
          <circle cx="100" cy="100" r="10" fill="hsl(195 100% 90% / 0.5)" className="animate-pulse-glow" />
        </svg>
      </div>

      {/* Ripple expansion */}
      {phase > 0 && [0, 1, 2].map(i => (
        <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            borderColor: "hsl(195 100% 70% / 0.3)",
            width: 100, height: 100,
            animation: `ripple-expand 4s ease-out ${i * 1.3}s infinite`,
          }} />
      ))}

      {/* HUD text */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center font-mono text-[10px] tracking-[0.3em]"
        style={{ color: "hsl(195 100% 75%)", opacity: phase ? 1 : 0, transition: "opacity 1.2s ease-out 0.3s" }}>
        SIGNAL RECEIVED · "ON YOUR LEFT"
      </div>
      <div className="absolute bottom-24 left-8 font-mono text-[9px] tracking-[0.25em] text-primary/70 space-y-1.5"
        style={{ opacity: phase ? 1 : 0, transition: "opacity 1.2s ease-out 1.5s" }}>
        <div>▸ MULTIPLE ALLIES ONLINE</div>
        <div>▸ UNIT REINTEGRATION COMPLETE</div>
        <div className="text-primary/40">▸ TRUST PROTOCOL CONFIRMED</div>
      </div>

      <style>{`@keyframes ripple-expand { 0% { width: 60px; height: 60px; opacity: 0.6; } 100% { width: 600px; height: 600px; opacity: 0; } }`}</style>
    </div>
  );
};

export default ReturnPortalOverlay;
