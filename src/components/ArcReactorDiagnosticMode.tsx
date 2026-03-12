import { useEffect, useState } from "react";

const ArcReactorDiagnosticMode = ({ isActive, onExit }: { isActive: boolean; onExit: () => void }) => {
  const [visible, setVisible] = useState(false);
  const [entering, setEntering] = useState(false);
  const [powerLevel, setPowerLevel] = useState(0);
  const [diagnosticStep, setDiagnosticStep] = useState(0);

  const DIAGNOSTICS = [
    "INITIALIZING CORE SCAN...",
    "CHECKING CORE STABILITY",
    "ENERGY OUTPUT STABLE",
    "POWER LEVEL: 100%",
    "SYSTEM HOLDING STEADY",
  ];

  useEffect(() => {
    if (isActive) {
      setVisible(true);
      setEntering(true);
      setPowerLevel(0);
      setDiagnosticStep(0);
      const powerInterval = setInterval(() => {
        setPowerLevel(p => { if (p >= 100) { clearInterval(powerInterval); return 100; } return p + 4; });
      }, 30);
      const stepInterval = setInterval(() => {
        setDiagnosticStep(s => { if (s >= DIAGNOSTICS.length - 1) { clearInterval(stepInterval); return s; } return s + 1; });
      }, 800);
      setTimeout(() => setEntering(false), 600);

      // Auto-exit after 4 seconds
      const autoExit = setTimeout(() => { onExit(); }, 4000);

      return () => { clearInterval(powerInterval); clearInterval(stepInterval); clearTimeout(autoExit); };
    } else {
      setEntering(false);
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  if (!visible) return null;

  const size = 420;
  const c = size / 2;
  const r = size / 2;

  // 10 energy cells around the reactor (like the reference image)
  const cellCount = 10;
  const cellAngleSpan = 26; // degrees each cell spans
  const cellGap = 36; // total angle per cell slot (360/10)

  return (
    <div
      className={`fixed inset-0 z-[45] flex items-center justify-center transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-0"}`}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      {/* Title */}
      <div className={`absolute top-8 left-1/2 -translate-x-1/2 text-center z-10 transition-all duration-700 ${entering ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}`}>
        <div className="font-orbitron text-[10px] tracking-[0.5em] text-primary/60 mb-1">ARC REACTOR</div>
        <div className="font-orbitron text-sm tracking-[0.3em] text-primary/90">DIAGNOSTIC MODE</div>
      </div>

      {/* ===== MAIN REACTOR ===== */}
      <div
        className={`relative transition-all duration-1000 ${entering ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}
        style={{ width: size, height: size }}
      >
        {/* Big ambient glow */}
        <div
          className="absolute rounded-full animate-arc-pulse"
          style={{
            inset: "-20%",
            background: `radial-gradient(circle, hsl(195 100% 60% / 0.12) 0%, hsl(195 100% 50% / 0.04) 40%, transparent 65%)`,
            filter: `blur(30px)`,
          }}
        />

        {/* RING - Outermost thin diagnostic frame with ticks */}
        <svg width={size} height={size} className="absolute" style={{ animation: "rotate-slow 50s linear infinite" }}>
          <circle cx={c} cy={c} r={r - 4} fill="none" stroke="hsl(195 100% 50% / 0.08)" strokeWidth="1" />
          {Array.from({ length: 72 }).map((_, i) => {
            const a = (i * 5) * Math.PI / 180;
            const len = i % 9 === 0 ? 10 : i % 3 === 0 ? 5 : 2;
            return (
              <line key={i}
                x1={c + Math.cos(a) * (r - 5)} y1={c + Math.sin(a) * (r - 5)}
                x2={c + Math.cos(a) * (r - 5 - len)} y2={c + Math.sin(a) * (r - 5 - len)}
                stroke={`hsl(195 100% 50% / ${i % 9 === 0 ? 0.5 : 0.12})`}
                strokeWidth={i % 9 === 0 ? 1.2 : 0.5}
              />
            );
          })}
        </svg>

        {/* OUTER RING - The dark gap ring between cells and outer frame */}
        <svg width={size} height={size} className="absolute">
          <circle cx={c} cy={c} r={r * 0.88} fill="none" stroke="hsl(195 30% 15% / 0.6)" strokeWidth="3" />
        </svg>

        {/* ===== 10 ENERGY CELLS - Key visual from the reference ===== */}
        <svg width={size} height={size} className="absolute" style={{ animation: "rotate-reverse 40s linear infinite" }}>
          <defs>
            <radialGradient id="cellGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(195 100% 85%)" stopOpacity="0.9" />
              <stop offset="40%" stopColor="hsl(200 100% 65%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(210 80% 45%)" stopOpacity="0.3" />
            </radialGradient>
            <filter id="cellBlur">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          {Array.from({ length: cellCount }).map((_, i) => {
            const startAngle = i * cellGap - 90;
            const endAngle = startAngle + cellAngleSpan;
            const outerR = r * 0.85;
            const innerR = r * 0.62;
            const midR = (outerR + innerR) / 2;

            const s1 = startAngle * Math.PI / 180;
            const e1 = endAngle * Math.PI / 180;

            // Outer arc points
            const ox1 = c + Math.cos(s1) * outerR;
            const oy1 = c + Math.sin(s1) * outerR;
            const ox2 = c + Math.cos(e1) * outerR;
            const oy2 = c + Math.sin(e1) * outerR;
            // Inner arc points
            const ix1 = c + Math.cos(s1) * innerR;
            const iy1 = c + Math.sin(s1) * innerR;
            const ix2 = c + Math.cos(e1) * innerR;
            const iy2 = c + Math.sin(e1) * innerR;

            // Cell shape path
            const path = `M ${ox1} ${oy1} A ${outerR} ${outerR} 0 0 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 0 0 ${ix1} ${iy1} Z`;

            // Coil lines (like copper coils between cells)
            const coilAngle = (startAngle + cellAngleSpan + 2) * Math.PI / 180;
            const coilAngle2 = (startAngle + cellAngleSpan + cellGap - cellAngleSpan - 2) * Math.PI / 180;

            // Mid-cell glow point
            const midAngle = ((startAngle + endAngle) / 2) * Math.PI / 180;
            const glowX = c + Math.cos(midAngle) * midR;
            const glowY = c + Math.sin(midAngle) * midR;

            return (
              <g key={i}>
                {/* Cell body - dark base */}
                <path d={path} fill="hsl(210 30% 12% / 0.8)" stroke="hsl(195 40% 25% / 0.5)" strokeWidth="1" />
                {/* Cell glow overlay */}
                <path d={path} fill="url(#cellGlow)" opacity={0.6}
                  style={{ animation: `pulse-glow ${2.5 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
                />
                {/* Bright center spot in each cell */}
                <circle cx={glowX} cy={glowY} r={8} fill="hsl(195 100% 85% / 0.5)" filter="url(#cellBlur)" />
                <circle cx={glowX} cy={glowY} r={4} fill="hsl(195 100% 95% / 0.7)" />

                {/* Divider lines (structural) inside cell */}
                {[0.3, 0.7].map((frac, fi) => {
                  const da = (startAngle + cellAngleSpan * frac) * Math.PI / 180;
                  return (
                    <line key={fi}
                      x1={c + Math.cos(da) * innerR} y1={c + Math.sin(da) * innerR}
                      x2={c + Math.cos(da) * outerR} y2={c + Math.sin(da) * outerR}
                      stroke="hsl(195 30% 20% / 0.4)" strokeWidth="0.8"
                    />
                  );
                })}

                {/* Copper coil lines between cells */}
                {Array.from({ length: 4 }).map((_, ci) => {
                  const cR = innerR + (outerR - innerR) * ((ci + 1) / 5);
                  return (
                    <line key={`coil${ci}`}
                      x1={c + Math.cos(coilAngle) * cR} y1={c + Math.sin(coilAngle) * cR}
                      x2={c + Math.cos(coilAngle2) * cR} y2={c + Math.sin(coilAngle2) * cR}
                      stroke="hsl(35 60% 40% / 0.5)" strokeWidth="0.8"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* INNER RING - Dark metallic ring between cells and core */}
        <svg width={size} height={size} className="absolute">
          <circle cx={c} cy={c} r={r * 0.58} fill="none" stroke="hsl(195 20% 18% / 0.8)" strokeWidth="8" />
          <circle cx={c} cy={c} r={r * 0.54} fill="none" stroke="hsl(195 40% 25% / 0.4)" strokeWidth="1" />
          <circle cx={c} cy={c} r={r * 0.62} fill="none" stroke="hsl(195 40% 25% / 0.4)" strokeWidth="1" />
        </svg>

        {/* INNER DETAIL RING - tick marks around core */}
        <svg width={size} height={size} className="absolute" style={{ animation: "rotate-slow 20s linear infinite" }}>
          {Array.from({ length: 20 }).map((_, i) => {
            const a = (i * 18) * Math.PI / 180;
            return (
              <line key={i}
                x1={c + Math.cos(a) * r * 0.5} y1={c + Math.sin(a) * r * 0.5}
                x2={c + Math.cos(a) * r * 0.54} y2={c + Math.sin(a) * r * 0.54}
                stroke={`hsl(195 100% 60% / ${i % 5 === 0 ? 0.6 : 0.2})`}
                strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
              />
            );
          })}
        </svg>

        {/* CORE RING - bright inner metallic ring */}
        <svg width={size} height={size} className="absolute">
          <circle cx={c} cy={c} r={r * 0.42} fill="none" stroke="hsl(195 30% 30% / 0.6)" strokeWidth="5" />
          <circle cx={c} cy={c} r={r * 0.42} fill="none" stroke="hsl(195 100% 70% / 0.2)" strokeWidth="1.5" />
          {/* Radial dividers on core ring */}
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i * 36) * Math.PI / 180;
            return (
              <line key={i}
                x1={c + Math.cos(a) * r * 0.39} y1={c + Math.sin(a) * r * 0.39}
                x2={c + Math.cos(a) * r * 0.45} y2={c + Math.sin(a) * r * 0.45}
                stroke="hsl(195 50% 40% / 0.5)" strokeWidth="1.5"
              />
            );
          })}
        </svg>

        {/* CORE ENERGY - bright white-blue center */}
        <div
          className="absolute rounded-full animate-arc-pulse"
          style={{
            width: size * 0.34,
            height: size * 0.34,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, hsl(60 30% 95% / 0.95) 0%, hsl(180 60% 85% / 0.8) 25%, hsl(195 100% 65% / 0.5) 50%, hsl(195 100% 50% / 0.2) 70%, transparent 100%)`,
            boxShadow: `0 0 40px hsl(195 100% 70% / 0.6), 0 0 80px hsl(195 100% 50% / 0.3), 0 0 120px hsl(195 100% 50% / 0.15)`,
          }}
        />
        {/* Secondary haze */}
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.5,
            height: size * 0.5,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, hsl(195 100% 80% / 0.15) 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* ===== SIDE HUD PANELS ===== */}
      {/* Left */}
      <div className={`absolute left-8 top-1/2 -translate-y-1/2 transition-all duration-700 delay-200 ${entering ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0"}`}>
        <div className="space-y-3 w-36">
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">CORE TEMPERATURE</div>
            <div className="font-mono text-xs text-primary">847.3°C</div>
            <div className="w-full h-1 bg-secondary/50 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-primary/60 rounded-full" style={{ width: "72%" }} />
            </div>
          </div>
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">ENERGY OUTPUT</div>
            <div className="font-mono text-xs text-primary">3.6 GJ/s</div>
            <svg width="110" height="18" className="mt-1">
              {Array.from({ length: 28 }).map((_, i) => {
                const h = 3 + Math.sin(i * 0.6) * 3 + Math.random() * 3;
                return (
                  <rect key={i} x={i * 4} y={9 - h / 2} width="2" height={h} rx="0.5"
                    fill={`hsl(195 100% 60% / ${0.3 + Math.random() * 0.4})`}
                    style={{ animation: `pulse-glow ${1.5 + Math.random()}s ease-in-out infinite` }}
                  />
                );
              })}
            </svg>
          </div>
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">PALLADIUM CORE</div>
            <div className="font-mono text-xs text-primary">STABLE</div>
            <div className="font-mono text-[8px] text-muted-foreground mt-0.5">Toxicity: 0.0%</div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className={`absolute right-8 top-1/2 -translate-y-1/2 transition-all duration-700 delay-300 ${entering ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"}`}>
        <div className="space-y-3 w-36">
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">POWER LEVEL</div>
            <div className="font-mono text-lg text-primary">{powerLevel}%</div>
            <div className="w-full h-1.5 bg-secondary/50 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-primary/70 rounded-full transition-all duration-100" style={{ width: `${powerLevel}%` }} />
            </div>
          </div>
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">REACTOR STATUS</div>
            <div className="font-mono text-[9px] text-primary animate-pulse-glow">{DIAGNOSTICS[diagnosticStep]}</div>
          </div>
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">CONTAINMENT</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              <span className="font-mono text-[9px] text-primary">NOMINAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-500 ${entering ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
        <div className="flex items-center gap-6 font-mono text-[8px] text-muted-foreground tracking-widest">
          <span>STARK INDUSTRIES</span>
          <span className="text-primary/50">•</span>
          <span>ARC REACTOR MK II</span>
          <span className="text-primary/50">•</span>
          <span className="text-primary/70">ALL SYSTEMS NOMINAL</span>
        </div>
      </div>
    </div>
  );
};

export default ArcReactorDiagnosticMode;
