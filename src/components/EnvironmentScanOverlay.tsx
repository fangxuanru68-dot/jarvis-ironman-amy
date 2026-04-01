import { useEffect, useState, useRef } from "react";

interface EnvironmentScanOverlayProps {
  isActive: boolean;
}

const EnvironmentScanOverlay = ({ isActive }: EnvironmentScanOverlayProps) => {
  const [scanY, setScanY] = useState(0);
  const [detectedObjects, setDetectedObjects] = useState<Array<{ id: number; x: number; y: number; w: number; h: number; label: string; opacity: number }>>([]);
  const frameRef = useRef<number>(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!isActive) { setDetectedObjects([]); return; }
    startRef.current = Date.now();

    const objects = [
      { id: 1, x: 15, y: 25, w: 12, h: 18, label: "OBJECT DETECTED" },
      { id: 2, x: 55, y: 40, w: 15, h: 20, label: "UNKNOWN ITEM" },
      { id: 3, x: 75, y: 15, w: 10, h: 14, label: "ENTITY IDENTIFIED" },
      { id: 4, x: 35, y: 65, w: 18, h: 15, label: "STRUCTURAL ELEMENT" },
      { id: 5, x: 60, y: 70, w: 11, h: 12, label: "ANOMALY DETECTED" },
    ];

    const animate = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const y = (elapsed * 15) % 110;
      setScanY(y);

      setDetectedObjects(objects.map((obj, i) => ({
        ...obj,
        opacity: elapsed > (i + 1) * 0.8 ? Math.min(1, (elapsed - (i + 1) * 0.8) * 2) : 0,
      })));

      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[25]">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `
          linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      {/* Scan sweep line */}
      <div className="absolute left-0 right-0" style={{ top: `${scanY}%`, transition: "none" }}>
        <div className="w-full h-[2px]" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.8), transparent)" }} />
        <div className="w-full h-16" style={{ background: "linear-gradient(180deg, hsl(var(--primary) / 0.15), transparent)", marginTop: "-1px" }} />
      </div>

      {/* Secondary scan line */}
      <div className="absolute left-0 right-0" style={{ top: `${(scanY + 50) % 110}%` }}>
        <div className="w-full h-[1px]" style={{ background: "linear-gradient(90deg, transparent 20%, hsl(var(--primary) / 0.4) 50%, transparent 80%)" }} />
      </div>

      {/* Detected objects with bounding boxes */}
      {detectedObjects.map(obj => obj.opacity > 0 && (
        <div key={obj.id} className="absolute" style={{
          left: `${obj.x}%`, top: `${obj.y}%`, width: `${obj.w}%`, height: `${obj.h}%`,
          opacity: obj.opacity, transition: "opacity 0.5s ease-out",
        }}>
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-primary/70" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-primary/70" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-primary/70" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-primary/70" />
          {/* Faint fill */}
          <div className="absolute inset-0 bg-primary/5 border border-primary/20" />
          {/* Label */}
          <div className="absolute -top-5 left-0 font-mono text-[7px] tracking-wider text-primary/80 whitespace-nowrap">
            {obj.label}
          </div>
          {/* Mini HUD circle */}
          <svg className="absolute -right-2 -top-2 w-4 h-4 animate-rotate-slow" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="7" fill="none" stroke="hsl(var(--primary) / 0.5)" strokeWidth="0.8" strokeDasharray="3 2" />
            <circle cx="10" cy="10" r="2" fill="hsl(var(--primary) / 0.6)" />
          </svg>
        </div>
      ))}

      {/* Top HUD bar */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="font-orbitron text-[10px] tracking-[0.4em] text-primary/80 animate-pulse-glow">
          SCANNING ENVIRONMENT
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[8px] tracking-[0.3em] text-primary/50">OBJECT RECOGNITION ACTIVE</span>
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
        </div>
      </div>

      {/* Bottom status */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="font-mono text-[8px] tracking-[0.3em] text-primary/40 animate-pulse-glow">
          ANALYSIS IN PROGRESS
        </div>
      </div>

      {/* Side data streams */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 font-mono text-[7px] text-primary/30 leading-loose">
        {["DEPTH: 4.2m", "GRID: 40x40", "FPS: 60", "LAT: 40.7128", "LON: -74.0060"].map((t, i) => (
          <div key={i} style={{ animationDelay: `${i * 0.2}s` }} className="animate-pulse-glow">{t}</div>
        ))}
      </div>

      {/* Thin border */}
      <div className="absolute inset-2 border border-primary/10 rounded-sm" />
    </div>
  );
};

export default EnvironmentScanOverlay;
