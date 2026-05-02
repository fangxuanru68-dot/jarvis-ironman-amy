import { useEffect, useState } from "react";

interface Props { isActive: boolean; onComplete: () => void; }

const DOSSIERS = [
  { code: "T-01", name: "TARGET ALPHA", status: "TRACKING", risk: "HIGH" },
  { code: "T-02", name: "ASSET BRAVO", status: "OBSERVING", risk: "MED" },
  { code: "T-03", name: "TARGET CHARLIE", status: "FLAGGED", risk: "LOW" },
];

const StealthIntelOverlay = ({ isActive, onComplete }: Props) => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!isActive) { setPhase(0); return; }
    setPhase(1);
    const t = setTimeout(() => onComplete(), 12000);
    return () => clearTimeout(t);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[40] animate-fade-in">
      {/* Dimming layer */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Scanline */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 h-[2px]"
          style={{ background: "linear-gradient(to right, transparent, hsl(0 90% 60% / 0.5), transparent)",
            animation: "stealth-scan 4s linear infinite" }} />
      </div>

      {/* Top label */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em]"
        style={{ color: "hsl(0 90% 65%)" }}>
        ▸ INTEL MODE ACTIVE · STEALTH PRIORITY
      </div>

      {/* Center silhouette outline */}
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width="260" height="320" viewBox="0 0 260 320">
        <ellipse cx="130" cy="80" rx="38" ry="46" fill="none" stroke="hsl(30 90% 60% / 0.7)" strokeWidth="0.8" strokeDasharray="3 3" />
        <path d="M 60 320 Q 60 180 130 150 Q 200 180 200 320" fill="none" stroke="hsl(0 90% 60% / 0.6)" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="100" y1="110" x2="160" y2="110" stroke="hsl(0 90% 60% / 0.4)" strokeWidth="0.4" />
      </svg>

      {/* Right dossier panel */}
      <div className="absolute top-20 right-6 space-y-3 w-56" style={{
        opacity: phase ? 1 : 0,
        transform: phase ? "translateX(0)" : "translateX(40px)",
        transition: "all 0.8s ease-out",
      }}>
        {DOSSIERS.map((d, i) => (
          <div key={i} className="border p-2 backdrop-blur-sm font-mono text-[9px] space-y-1"
            style={{
              borderColor: "hsl(0 90% 60% / 0.4)",
              background: "hsl(0 30% 10% / 0.6)",
              color: "hsl(30 80% 75%)",
              animation: `dossier-in 0.5s ease-out ${i * 0.3 + 0.4}s both`,
            }}>
            <div className="flex justify-between">
              <span style={{ color: "hsl(0 90% 70%)" }}>{d.code}</span>
              <span className="animate-pulse" style={{ color: "hsl(30 90% 60%)" }}>● {d.status}</span>
            </div>
            <div className="text-[10px] tracking-widest">{d.name}</div>
            <div className="flex gap-2 opacity-70">
              <span>RISK: {d.risk}</span>
              <span>LOW PROFILE</span>
            </div>
            <div className="h-px" style={{ background: "linear-gradient(to right, hsl(0 90% 60% / 0.6), transparent)" }} />
          </div>
        ))}
      </div>

      <div className="absolute bottom-8 left-8 font-mono text-[9px] tracking-[0.3em]" style={{ color: "hsl(30 80% 70%)" }}>
        ▸ TARGETS TAGGED: {DOSSIERS.length} · TRACKING
      </div>

      <style>{`
        @keyframes stealth-scan { 0% { top: 0; } 100% { top: 100%; } }
        @keyframes dossier-in { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default StealthIntelOverlay;
