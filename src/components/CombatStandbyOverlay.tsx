import { useEffect, useState, useRef } from "react";

interface CombatStandbyOverlayProps {
  isActive: boolean;
}

const CombatStandbyOverlay = ({ isActive }: CombatStandbyOverlayProps) => {
  const [pulse, setPulse] = useState(0);
  const [flickerOpacity, setFlickerOpacity] = useState(1);
  const frameRef = useRef<number>(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;
    startRef.current = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setPulse(Math.sin(elapsed * 0.8) * 0.5 + 0.5);
      // Occasional flicker
      setFlickerOpacity(Math.random() > 0.97 ? 0.7 : 1);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[25]" style={{ opacity: flickerOpacity }}>
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "hsl(0 0% 0% / 0.4)" }} />

      {/* Central inactive targeting circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="0 0 300 300" className="w-48 h-48" style={{ opacity: 0.3 + pulse * 0.2 }}>
          <circle cx="150" cy="150" r="120" fill="none" stroke="hsl(0 60% 50% / 0.15)" strokeWidth="1" />
          <circle cx="150" cy="150" r="90" fill="none" stroke="hsl(0 60% 50% / 0.2)" strokeWidth="1.5" strokeDasharray="12 8" />
          <circle cx="150" cy="150" r="60" fill="none" stroke="hsl(0 60% 50% / 0.15)" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="150" cy="150" r="5" fill="hsl(0 60% 50% / 0.3)" />
          {/* Crosshair */}
          <line x1="150" y1="100" x2="150" y2="130" stroke="hsl(0 60% 50% / 0.2)" strokeWidth="1" />
          <line x1="150" y1="170" x2="150" y2="200" stroke="hsl(0 60% 50% / 0.2)" strokeWidth="1" />
          <line x1="100" y1="150" x2="130" y2="150" stroke="hsl(0 60% 50% / 0.2)" strokeWidth="1" />
          <line x1="170" y1="150" x2="200" y2="150" stroke="hsl(0 60% 50% / 0.2)" strokeWidth="1" />
        </svg>
      </div>

      {/* Left side panel */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 space-y-4 font-mono text-[8px] tracking-wider">
        <div>
          <div className="text-orange-400/60 mb-1">ARMOR STATUS</div>
          <div className="flex items-center gap-1">
            <div className="w-24 h-1 bg-muted/30 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400/50 rounded-full" style={{ width: "92%" }} />
            </div>
            <span className="text-orange-400/50">92%</span>
          </div>
        </div>
        <div>
          <div className="text-orange-400/60 mb-1">POWER LEVEL</div>
          <div className="flex items-center gap-1">
            <div className="w-24 h-1 bg-muted/30 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400/50 rounded-full animate-pulse-glow" style={{ width: "87%" }} />
            </div>
            <span className="text-orange-400/50">87%</span>
          </div>
        </div>
        <div>
          <div className="text-orange-400/60 mb-1">WEAPON SYSTEM</div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400/60 animate-pulse" />
            <span className="text-orange-400/70">STANDBY</span>
          </div>
        </div>
      </div>

      {/* Right side panel */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 space-y-4 font-mono text-[8px] tracking-wider text-right">
        <div>
          <div className="text-orange-400/60 mb-1">REPULSORS</div>
          <span className="text-orange-400/50">CHARGED</span>
        </div>
        <div>
          <div className="text-orange-400/60 mb-1">UNIBEAM</div>
          <span className="text-orange-400/50">READY</span>
        </div>
        <div>
          <div className="text-orange-400/60 mb-1">SHIELDS</div>
          <span className="text-orange-400/50">ONLINE</span>
        </div>
      </div>

      {/* Top indicator */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60 animate-pulse" />
        <span className="font-orbitron text-[10px] tracking-[0.3em]" style={{ color: "hsl(25 80% 55% / 0.8)" }}>
          COMBAT SYSTEM READY
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60 animate-pulse" />
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="font-mono text-[8px] tracking-[0.3em]" style={{ color: "hsl(25 60% 50% / 0.5)" }}>
          AWAITING COMMAND
        </div>
        <div className="font-mono text-[7px] tracking-[0.2em]" style={{ color: "hsl(25 60% 50% / 0.3)" }}>
          ALL SYSTEMS STANDBY
        </div>
      </div>

      {/* Subtle red/orange border */}
      <div className="absolute inset-0 border border-orange-500/10" />

      {/* Blinking indicators in corners */}
      {[
        "top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"
      ].map((pos, i) => (
        <div key={i} className={`absolute ${pos}`}>
          <div className="w-1 h-1 rounded-full bg-orange-500/40 animate-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
        </div>
      ))}
    </div>
  );
};

export default CombatStandbyOverlay;
