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
      // Power-up animation
      const powerInterval = setInterval(() => {
        setPowerLevel(p => {
          if (p >= 100) { clearInterval(powerInterval); return 100; }
          return p + 2;
        });
      }, 30);
      // Diagnostic steps
      const stepInterval = setInterval(() => {
        setDiagnosticStep(s => {
          if (s >= DIAGNOSTICS.length - 1) { clearInterval(stepInterval); return s; }
          return s + 1;
        });
      }, 1500);
      setTimeout(() => setEntering(false), 800);
      return () => { clearInterval(powerInterval); clearInterval(stepInterval); };
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

  return (
    <div
      className={`fixed inset-0 z-[45] flex items-center justify-center transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-0"}`}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Subtle dark overlay - not solid, keeps system background visible */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      {/* Title */}
      <div className={`absolute top-8 left-1/2 -translate-x-1/2 text-center z-10 transition-all duration-1000 ${entering ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}`}>
        <div className="font-orbitron text-[10px] tracking-[0.5em] text-primary/60 mb-1">ARC REACTOR</div>
        <div className="font-orbitron text-sm tracking-[0.3em] text-primary/90">DIAGNOSTIC MODE</div>
      </div>

      {/* ===== MAIN REACTOR ===== */}
      <div
        className={`relative transition-all duration-1000 ${entering ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}
        style={{ width: size, height: size }}
      >
        {/* Ambient glow behind reactor */}
        <div
          className="absolute inset-0 rounded-full animate-arc-pulse"
          style={{
            background: `radial-gradient(circle, hsl(195 100% 60% / 0.15) 0%, hsl(195 100% 50% / 0.05) 40%, transparent 70%)`,
            filter: `blur(20px)`,
          }}
        />

        {/* RING 6 - Outermost diagnostic frame */}
        <svg width={size} height={size} className="absolute" style={{ animation: "rotate-slow 60s linear infinite" }}>
          <circle cx={c} cy={c} r={r - 4} fill="none" stroke="hsl(195 100% 50% / 0.08)" strokeWidth="1" />
          <circle cx={c} cy={c} r={r - 8} fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" strokeDasharray="2 12" />
          {/* Outer tick marks */}
          {Array.from({ length: 72 }).map((_, i) => {
            const a = (i * 5) * Math.PI / 180;
            const len = i % 9 === 0 ? 12 : i % 3 === 0 ? 7 : 3;
            return (
              <line key={i}
                x1={c + Math.cos(a) * (r - 8)} y1={c + Math.sin(a) * (r - 8)}
                x2={c + Math.cos(a) * (r - 8 - len)} y2={c + Math.sin(a) * (r - 8 - len)}
                stroke={`hsl(195 100% 50% / ${i % 9 === 0 ? 0.6 : i % 3 === 0 ? 0.3 : 0.12})`}
                strokeWidth={i % 9 === 0 ? 1.5 : 0.5}
              />
            );
          })}
        </svg>

        {/* RING 5 - Outer diagnostic ring with arcs */}
        <svg width={size} height={size} className="absolute" style={{ animation: "rotate-reverse 45s linear infinite" }}>
          <circle cx={c} cy={c} r={r * 0.88} fill="none" stroke="hsl(195 100% 50% / 0.12)" strokeWidth="8" />
          <circle cx={c} cy={c} r={r * 0.88} fill="none" stroke="hsl(195 100% 60% / 0.35)" strokeWidth="1.5" />
          {/* Segmented arcs */}
          {Array.from({ length: 6 }).map((_, i) => {
            const start = i * 60 + 5;
            const end = start + 45;
            const sr = r * 0.88;
            const x1 = c + Math.cos(start * Math.PI / 180) * sr;
            const y1 = c + Math.sin(start * Math.PI / 180) * sr;
            const x2 = c + Math.cos(end * Math.PI / 180) * sr;
            const y2 = c + Math.sin(end * Math.PI / 180) * sr;
            return (
              <path key={i}
                d={`M ${x1} ${y1} A ${sr} ${sr} 0 0 1 ${x2} ${y2}`}
                fill="none" stroke={`hsl(195 100% 70% / ${0.15 + (i % 3) * 0.1})`} strokeWidth="6" strokeLinecap="round"
              />
            );
          })}
          {/* Scanning sweep - bright arc that rotates */}
          {(() => {
            const sr = r * 0.88;
            const x1 = c + Math.cos(0) * sr;
            const y1 = c + Math.sin(0) * sr;
            const x2 = c + Math.cos(30 * Math.PI / 180) * sr;
            const y2 = c + Math.sin(30 * Math.PI / 180) * sr;
            return (
              <path
                d={`M ${x1} ${y1} A ${sr} ${sr} 0 0 1 ${x2} ${y2}`}
                fill="none" stroke="hsl(195 100% 80% / 0.5)" strokeWidth="3" strokeLinecap="round"
              />
            );
          })()}
        </svg>

        {/* RING 4 - Mid mechanical ring with panels */}
        <svg width={size} height={size} className="absolute" style={{ animation: "rotate-slow 35s linear infinite" }}>
          <circle cx={c} cy={c} r={r * 0.72} fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="2" />
          <circle cx={c} cy={c} r={r * 0.72} fill="none" stroke="hsl(195 100% 70% / 0.08)" strokeWidth="14" />
          {/* Panel segments */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30) * Math.PI / 180;
            const a2 = (i * 30 + 20) * Math.PI / 180;
            const ri = r * 0.66;
            const ro = r * 0.78;
            return (
              <g key={i}>
                <line
                  x1={c + Math.cos(a) * ri} y1={c + Math.sin(a) * ri}
                  x2={c + Math.cos(a) * ro} y2={c + Math.sin(a) * ro}
                  stroke="hsl(195 100% 50% / 0.3)" strokeWidth="1"
                />
                {/* Small panel rectangles */}
                <rect
                  x={c + Math.cos(a2) * (r * 0.72) - 4}
                  y={c + Math.sin(a2) * (r * 0.72) - 2}
                  width="8" height="4" rx="1"
                  fill={`hsl(195 100% 60% / ${i % 3 === 0 ? 0.5 : 0.2})`}
                  style={{
                    animation: `pulse-glow ${2 + i * 0.3}s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              </g>
            );
          })}
          {/* Detailed tick marks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i * 6) * Math.PI / 180;
            const inner = r * 0.68;
            const outer = r * (i % 5 === 0 ? 0.76 : 0.72);
            return (
              <line key={`t${i}`}
                x1={c + Math.cos(a) * inner} y1={c + Math.sin(a) * inner}
                x2={c + Math.cos(a) * outer} y2={c + Math.sin(a) * outer}
                stroke={`hsl(195 100% 50% / ${i % 5 === 0 ? 0.5 : 0.15})`}
                strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
              />
            );
          })}
        </svg>

        {/* RING 3 - Inner bright ring */}
        <svg width={size} height={size} className="absolute" style={{ animation: "rotate-reverse 25s linear infinite" }}>
          <circle cx={c} cy={c} r={r * 0.55} fill="none" stroke="hsl(195 100% 60% / 0.5)" strokeWidth="2.5" />
          <circle cx={c} cy={c} r={r * 0.55} fill="none" stroke="hsl(195 100% 80% / 0.08)" strokeWidth="8" />
          {/* Energy arc segments */}
          {Array.from({ length: 3 }).map((_, i) => {
            const start = i * 120;
            const end = start + 90;
            const sr = r * 0.55;
            const x1 = c + Math.cos(start * Math.PI / 180) * sr;
            const y1 = c + Math.sin(start * Math.PI / 180) * sr;
            const x2 = c + Math.cos(end * Math.PI / 180) * sr;
            const y2 = c + Math.sin(end * Math.PI / 180) * sr;
            return (
              <path key={i}
                d={`M ${x1} ${y1} A ${sr} ${sr} 0 0 1 ${x2} ${y2}`}
                fill="none" stroke="hsl(195 100% 80% / 0.35)" strokeWidth="4" strokeLinecap="round"
              />
            );
          })}
          {/* Technical nodes */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30) * Math.PI / 180;
            return (
              <circle key={i}
                cx={c + Math.cos(a) * r * 0.55}
                cy={c + Math.sin(a) * r * 0.55}
                r={i % 3 === 0 ? 3 : 1.5}
                fill={`hsl(195 100% ${i % 3 === 0 ? 70 : 50}% / ${i % 3 === 0 ? 0.7 : 0.3})`}
              />
            );
          })}
        </svg>

        {/* RING 2 - Inner detail ring */}
        <svg width={size} height={size} className="absolute" style={{ animation: "rotate-slow 18s linear infinite" }}>
          <circle cx={c} cy={c} r={r * 0.42} fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="1" strokeDasharray="5 5" />
          {/* Small bars */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45) * Math.PI / 180;
            return (
              <line key={i}
                x1={c + Math.cos(a) * r * 0.38} y1={c + Math.sin(a) * r * 0.38}
                x2={c + Math.cos(a) * r * 0.46} y2={c + Math.sin(a) * r * 0.46}
                stroke="hsl(195 100% 60% / 0.5)" strokeWidth="2" strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* RING 1 - Innermost ring */}
        <svg width={size} height={size} className="absolute" style={{ animation: "rotate-reverse 12s linear infinite" }}>
          <circle cx={c} cy={c} r={r * 0.3} fill="none" stroke="hsl(195 100% 70% / 0.4)" strokeWidth="1.5" />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i * 60) * Math.PI / 180;
            return (
              <line key={i}
                x1={c + Math.cos(a) * r * 0.27} y1={c + Math.sin(a) * r * 0.27}
                x2={c + Math.cos(a) * r * 0.33} y2={c + Math.sin(a) * r * 0.33}
                stroke="hsl(195 100% 70% / 0.6)" strokeWidth="1.5" strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* TRIANGULAR CORE STRUCTURE */}
        <svg width={size} height={size} className="absolute">
          {/* Triangle pointing up */}
          {(() => {
            const tr = r * 0.18;
            const points = [0, 1, 2].map(i => {
              const a = (i * 120 - 90) * Math.PI / 180;
              return `${c + Math.cos(a) * tr},${c + Math.sin(a) * tr}`;
            }).join(" ");
            return (
              <>
                <polygon points={points} fill="none" stroke="hsl(195 100% 80% / 0.6)" strokeWidth="2" strokeLinejoin="round" />
                <polygon points={points} fill="hsl(195 100% 70% / 0.08)" />
                {/* Inner smaller triangle */}
                {(() => {
                  const tr2 = r * 0.1;
                  const pts2 = [0, 1, 2].map(i => {
                    const a = (i * 120 - 90) * Math.PI / 180;
                    return `${c + Math.cos(a) * tr2},${c + Math.sin(a) * tr2}`;
                  }).join(" ");
                  return (
                    <>
                      <polygon points={pts2} fill="none" stroke="hsl(195 100% 90% / 0.5)" strokeWidth="1.5" strokeLinejoin="round" />
                      <polygon points={pts2} fill="hsl(195 100% 80% / 0.12)" />
                    </>
                  );
                })()}
                {/* Connecting lines from triangle vertices to inner ring */}
                {[0, 1, 2].map(i => {
                  const a = (i * 120 - 90) * Math.PI / 180;
                  return (
                    <line key={i}
                      x1={c + Math.cos(a) * tr}
                      y1={c + Math.sin(a) * tr}
                      x2={c + Math.cos(a) * r * 0.27}
                      y2={c + Math.sin(a) * r * 0.27}
                      stroke="hsl(195 100% 70% / 0.3)" strokeWidth="1" strokeDasharray="3 3"
                    />
                  );
                })}
              </>
            );
          })()}
        </svg>

        {/* CORE ENERGY GLOW */}
        <div
          className="absolute rounded-full animate-arc-pulse"
          style={{
            width: size * 0.15,
            height: size * 0.15,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, hsl(195 100% 95% / 0.7) 0%, hsl(195 100% 70% / 0.4) 30%, hsl(195 100% 50% / 0.15) 60%, transparent 100%)`,
            boxShadow: `0 0 30px hsl(195 100% 60% / 0.5), 0 0 60px hsl(195 100% 50% / 0.3), 0 0 100px hsl(195 100% 50% / 0.15)`,
          }}
        />
        {/* Secondary core haze */}
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.25,
            height: size * 0.25,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, hsl(195 100% 80% / 0.2) 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* ===== SIDE HUD PANELS ===== */}

      {/* Left diagnostic panel */}
      <div className={`absolute left-8 top-1/2 -translate-y-1/2 transition-all duration-1000 delay-300 ${entering ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0"}`}>
        <div className="space-y-4 w-40">
          {/* Core temp */}
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">CORE TEMPERATURE</div>
            <div className="font-mono text-xs text-primary">847.3°C</div>
            <div className="w-full h-1 bg-secondary/50 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-primary/60 rounded-full" style={{ width: "72%", transition: "width 2s" }} />
            </div>
          </div>
          {/* Energy output */}
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">ENERGY OUTPUT</div>
            <div className="font-mono text-xs text-primary">3.6 GJ/s</div>
            {/* Mini waveform */}
            <svg width="120" height="20" className="mt-1">
              {Array.from({ length: 30 }).map((_, i) => {
                const h = 4 + Math.sin(i * 0.5) * 3 + Math.random() * 4;
                return (
                  <rect key={i} x={i * 4} y={10 - h / 2} width="2" height={h} rx="0.5"
                    fill={`hsl(195 100% 60% / ${0.3 + Math.random() * 0.4})`}
                    style={{ animation: `pulse-glow ${1.5 + Math.random()}s ease-in-out infinite`, animationDelay: `${i * 0.05}s` }}
                  />
                );
              })}
            </svg>
          </div>
          {/* Palladium level */}
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">PALLADIUM CORE</div>
            <div className="font-mono text-xs text-primary">STABLE</div>
            <div className="font-mono text-[8px] text-muted-foreground mt-0.5">Toxicity: 0.0%</div>
          </div>
          {/* Containment */}
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">CONTAINMENT FIELD</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              <span className="font-mono text-[9px] text-primary">NOMINAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right diagnostic panel */}
      <div className={`absolute right-8 top-1/2 -translate-y-1/2 transition-all duration-1000 delay-500 ${entering ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"}`}>
        <div className="space-y-4 w-40">
          {/* Power level */}
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">POWER LEVEL</div>
            <div className="font-mono text-lg text-primary">{powerLevel}%</div>
            <div className="w-full h-1.5 bg-secondary/50 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-primary/70 rounded-full transition-all duration-100" style={{ width: `${powerLevel}%` }} />
            </div>
          </div>
          {/* Reactor status */}
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">REACTOR STATUS</div>
            <div className="font-mono text-[9px] text-primary animate-pulse-glow">
              {DIAGNOSTICS[diagnosticStep]}
            </div>
          </div>
          {/* Magnetic flux */}
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">MAGNETIC FLUX</div>
            <div className="font-mono text-xs text-primary">12.4 T</div>
            {/* Mini circular gauge */}
            <svg width="40" height="40" className="mt-1 mx-auto">
              <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="2" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(195 100% 60% / 0.5)" strokeWidth="2"
                strokeDasharray={`${16 * 2 * Math.PI * 0.78} ${16 * 2 * Math.PI}`}
                transform="rotate(-90 20 20)" strokeLinecap="round"
              />
              <text x="20" y="23" textAnchor="middle" className="font-mono" fontSize="8" fill="hsl(195 100% 70%)">78%</text>
            </svg>
          </div>
          {/* Vibranium shield */}
          <div className="border border-border/30 rounded-sm bg-card/20 backdrop-blur-sm p-2">
            <div className="font-orbitron text-[7px] tracking-[0.2em] text-muted-foreground mb-1">EM SHIELD</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              <span className="font-mono text-[9px] text-primary">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${entering ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
        <div className="flex items-center gap-6 font-mono text-[8px] text-muted-foreground tracking-widest">
          <span>STARK INDUSTRIES</span>
          <span className="text-primary/50">•</span>
          <span>ARC REACTOR MK II</span>
          <span className="text-primary/50">•</span>
          <span className="text-primary/70">ALL SYSTEMS NOMINAL</span>
          <span className="text-primary/50">•</span>
          <span>TYPE "MODE END" TO EXIT</span>
        </div>
      </div>

      {/* Technical labels around reactor */}
      {[
        { label: "N-FIELD", angle: -45, dist: 0.96 },
        { label: "FLUX-A", angle: 45, dist: 0.96 },
        { label: "COOLANT", angle: 135, dist: 0.96 },
        { label: "SHIELD", angle: -135, dist: 0.96 },
      ].map(({ label, angle, dist }) => {
        const a = angle * Math.PI / 180;
        const x = 50 + Math.cos(a) * dist * 48;
        const y = 50 + Math.sin(a) * dist * 48;
        return (
          <div
            key={label}
            className="absolute font-mono text-[7px] text-primary/40 tracking-wider"
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

export default ArcReactorDiagnosticMode;
