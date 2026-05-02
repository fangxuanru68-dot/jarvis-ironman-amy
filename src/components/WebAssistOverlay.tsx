import { useEffect, useState } from "react";

interface Props { isActive: boolean; onComplete: () => void; }

const WebAssistOverlay = ({ isActive, onComplete }: Props) => {
  const [phase, setPhase] = useState(0);
  const [pings, setPings] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (!isActive) { setPhase(0); setPings([]); return; }
    setPhase(1);
    const pingInt = setInterval(() => {
      setPings(p => [...p.slice(-4), { id: Date.now(), x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 }]);
    }, 900);
    const end = setTimeout(() => onComplete(), 10000);
    return () => { clearInterval(pingInt); clearTimeout(end); };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const lines = 16;
  const rings = [25, 40, 55];

  return (
    <div className="fixed inset-0 pointer-events-none z-[40] animate-fade-in">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Radial web lines */}
        {Array.from({ length: lines }).map((_, i) => {
          const a = (i * 360 / lines) * Math.PI / 180;
          const x = 50 + Math.cos(a) * 60;
          const y = 50 + Math.sin(a) * 60;
          return (
            <line key={i} x1="50" y1="50" x2={x} y2={y}
              stroke="hsl(195 100% 80%)" strokeWidth="0.15" opacity={phase ? 0.5 : 0}
              style={{
                transition: `opacity 0.6s ease-out ${i * 0.04}s`,
                filter: "drop-shadow(0 0 0.5px hsl(195 100% 60%))",
              }} vectorEffect="non-scaling-stroke" />
          );
        })}

        {/* Concentric ring webs */}
        {rings.map((r, ri) => (
          <polygon key={ri}
            points={Array.from({ length: lines }).map((_, i) => {
              const a = (i * 360 / lines) * Math.PI / 180;
              return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
            }).join(" ")}
            fill="none" stroke="hsl(195 100% 85%)" strokeWidth="0.12"
            opacity={phase ? 0.45 : 0}
            style={{ transition: `opacity 0.8s ease-out ${0.5 + ri * 0.2}s` }}
            vectorEffect="non-scaling-stroke" />
        ))}

        {/* Anchor nodes at intersections */}
        {phase > 0 && rings.flatMap((r, ri) =>
          Array.from({ length: lines }).map((_, i) => {
            const a = (i * 360 / lines) * Math.PI / 180;
            return (
              <circle key={`${ri}-${i}`} cx={50 + Math.cos(a) * r} cy={50 + Math.sin(a) * r} r="0.4"
                fill="hsl(195 100% 90%)" opacity="0.8">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" begin={`${(ri + i) * 0.05}s`} repeatCount="indefinite" />
              </circle>
            );
          })
        )}

        {/* Ping circles */}
        {pings.map(p => (
          <circle key={p.id} cx={p.x} cy={p.y} r="0.5" fill="none" stroke="hsl(195 100% 90%)" strokeWidth="0.2"
            style={{ animation: "web-ping 1.6s ease-out forwards" }} vectorEffect="non-scaling-stroke" />
        ))}

        {/* Center node */}
        <circle cx="50" cy="50" r="1.2" fill="hsl(195 100% 95%)" opacity="0.9" />
      </svg>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.35em] text-primary/90">
        ▸ WEB ASSIST ONLINE
      </div>
      <div className="absolute bottom-10 right-8 font-mono text-[9px] tracking-[0.3em] text-primary/70 text-right space-y-1">
        <div>MOBILITY OPTIMIZED</div>
        <div>TARGETING AID ACTIVE</div>
      </div>

      <style>{`@keyframes web-ping { 0% { r: 0.4; opacity: 1; } 100% { r: 8; opacity: 0; } }`}</style>
    </div>
  );
};

export default WebAssistOverlay;
