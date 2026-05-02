import { useEffect, useState, useRef } from "react";

interface SnapDisintegrationOverlayProps {
  isActive: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
}

const SnapDisintegrationOverlay = ({ isActive, onComplete }: SnapDisintegrationOverlayProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [phase, setPhase] = useState<"idle" | "disintegrating" | "fading">("idle");
  const [dissolveProgress, setDissolveProgress] = useState(0); // 0 -> 1
  const frameRef = useRef<number>(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      setPhase("idle");
      setDissolveProgress(0);
      return;
    }

    setPhase("disintegrating");
    startRef.current = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const progress = Math.min(1, elapsed / 5); // disintegrate over 5s
      setDissolveProgress(progress);

      // Spawn particles in waves
      if (Math.random() < 0.6 && elapsed < 5.5) {
        setParticles(prev => {
          const next = [...prev];
          const spawnCount = 8 + Math.floor(progress * 12);
          for (let i = 0; i < spawnCount; i++) {
            // Spawn from edges + scattered points
            const fromTop = Math.random() < 0.5;
            const x = Math.random() * 100;
            const y = fromTop
              ? 5 + Math.random() * 40
              : 55 + Math.random() * 40;
            next.push({
              x,
              y,
              vx: (Math.random() - 0.5) * 0.15,
              vy: -0.05 - Math.random() * 0.15, // drift upward
              size: 0.5 + Math.random() * 2,
              opacity: 0.3 + Math.random() * 0.5,
              life: 1,
            });
          }
          // cap
          if (next.length > 600) next.splice(0, next.length - 600);
          return next;
        });
      }

      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vx: p.vx + (Math.random() - 0.5) * 0.02,
            life: p.life - 0.012,
            opacity: p.opacity * 0.985,
          }))
          .filter(p => p.life > 0 && p.opacity > 0.02)
      );

      if (elapsed > 7) {
        setPhase("fading");
        if (elapsed > 9) {
          cancelAnimationFrame(frameRef.current);
          onComplete?.();
          return;
        }
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  // UI fade: starts opaque, fades to nothing as dissolveProgress climbs
  const uiOpacity = phase === "fading" ? Math.max(0, 1 - (dissolveProgress - 0.6) * 2) : 1;

  return (
    <div className="fixed inset-0 pointer-events-none z-[30]">
      {/* Subtle dust haze overlay */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(25 40% 20% / 0.15), hsl(220 30% 4% / 0.4))",
          opacity: 0.4 + dissolveProgress * 0.4,
        }}
      />

      {/* Particles */}
      <svg className="absolute inset-0 w-full h-full">
        {particles.map((p, i) => (
          <circle
            key={i}
            cx={`${p.x}%`}
            cy={`${p.y}%`}
            r={p.size}
            fill="hsl(25 60% 70%)"
            opacity={p.opacity * p.life}
            style={{ filter: `blur(${0.3 + p.size * 0.2}px)` }}
          />
        ))}
      </svg>

      {/* Disintegrating UI fragments — abstract HUD pieces drifting and fading */}
      <div
        className="absolute inset-0"
        style={{ opacity: uiOpacity, transition: "opacity 0.5s linear" }}
      >
        {/* Left fragment */}
        <div
          className="absolute left-[8%] top-[30%] w-32 h-20 border border-primary/30"
          style={{
            opacity: Math.max(0, 1 - dissolveProgress * 1.1),
            transform: `translate(${dissolveProgress * -30}px, ${dissolveProgress * -20}px) rotate(${dissolveProgress * -8}deg)`,
            filter: `blur(${dissolveProgress * 4}px)`,
            background:
              "linear-gradient(135deg, hsl(var(--primary) / 0.05), transparent)",
          }}
        >
          <div className="p-2 font-mono text-[8px] text-primary/50 tracking-wider">
            SECTOR 01<br />OFFLINE
          </div>
        </div>

        {/* Right fragment */}
        <div
          className="absolute right-[10%] top-[55%] w-40 h-24 border border-primary/30"
          style={{
            opacity: Math.max(0, 1 - dissolveProgress * 1.2),
            transform: `translate(${dissolveProgress * 40}px, ${dissolveProgress * 25}px) rotate(${dissolveProgress * 6}deg)`,
            filter: `blur(${dissolveProgress * 5}px)`,
            background:
              "linear-gradient(225deg, hsl(var(--primary) / 0.05), transparent)",
          }}
        >
          <div className="p-2 font-mono text-[8px] text-primary/50 tracking-wider text-right">
            DATA STREAM<br />CORRUPTED
          </div>
        </div>

        {/* Central HUD ring fragmenting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg viewBox="0 0 200 200" className="w-48 h-48">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="hsl(var(--primary) / 0.4)"
              strokeWidth="1"
              strokeDasharray={`${4 + dissolveProgress * 30} ${4 + dissolveProgress * 40}`}
              style={{
                opacity: Math.max(0, 1 - dissolveProgress),
                filter: `blur(${dissolveProgress * 3}px)`,
                transform: `rotate(${dissolveProgress * 30}deg)`,
                transformOrigin: "center",
              }}
            />
            <circle
              cx="100"
              cy="100"
              r="55"
              fill="none"
              stroke="hsl(var(--primary) / 0.3)"
              strokeWidth="0.8"
              strokeDasharray={`${3 + dissolveProgress * 20} ${5 + dissolveProgress * 30}`}
              style={{
                opacity: Math.max(0, 1 - dissolveProgress * 1.1),
                filter: `blur(${dissolveProgress * 2}px)`,
                transform: `rotate(${-dissolveProgress * 25}deg)`,
                transformOrigin: "center",
              }}
            />
          </svg>
        </div>
      </div>

      {/* HUD text — fades and flickers */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-hud-flicker"
        style={{ opacity: Math.max(0, 1 - Math.max(0, dissolveProgress - 0.5) * 2) }}
      >
        <div
          className="font-orbitron text-sm tracking-[0.4em]"
          style={{
            color: "hsl(25 70% 65% / 0.85)",
            textShadow: "0 0 20px hsl(25 70% 50% / 0.5)",
          }}
        >
          SYSTEM FAILURE
        </div>
        <div
          className="font-mono text-[10px] tracking-[0.3em]"
          style={{ color: "hsl(25 50% 60% / 0.6)" }}
        >
          SIGNAL LOST
        </div>
      </div>

      {/* Bottom subtitle */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-[0.35em]"
        style={{
          color: "hsl(25 40% 55% / 0.5)",
          opacity: Math.max(0, 1 - Math.max(0, dissolveProgress - 0.4) * 1.6),
        }}
      >
        — CONNECTION TERMINATED —
      </div>
    </div>
  );
};

export default SnapDisintegrationOverlay;
