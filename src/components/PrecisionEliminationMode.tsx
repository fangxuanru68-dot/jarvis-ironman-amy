import { useEffect, useState } from "react";

interface PrecisionEliminationModeProps {
  isActive: boolean;
  rightEyePos?: { x: number; y: number } | null;
}

const PrecisionEliminationMode = ({ isActive, rightEyePos }: PrecisionEliminationModeProps) => {
  const [tick, setTick] = useState(0);
  const [smoothEye, setSmoothEye] = useState<{ x: number; y: number }>({ x: 0.68, y: 0.32 });

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(id);
  }, [isActive]);

  // Smooth tracking of eye coordinates
  useEffect(() => {
    if (!rightEyePos) return;
    setSmoothEye(prev => ({
      x: prev.x + (rightEyePos.x - prev.x) * 0.25,
      y: prev.y + (rightEyePos.y - prev.y) * 0.25,
    }));
  }, [rightEyePos]);

  if (!isActive) return null;

  const eyeX = smoothEye.x * 100;
  const eyeY = smoothEye.y * 100;
  const locked = !!rightEyePos;

  // Animated bars
  const bar = (seed: number) => 60 + ((Math.sin(tick * 0.05 + seed) + 1) / 2) * 35;

  return (
    <div className="fixed inset-0 pointer-events-none z-[28]">
      {/* Tactical red/orange tint */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, hsl(15 70% 12% / 0.35), hsl(0 70% 6% / 0.55))",
      }} />

      {/* Scanlines */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent 0, transparent 3px, hsl(15 90% 60% / 0.4) 3px, hsl(15 90% 60% / 0.4) 4px)",
      }} />

      {/* Helmet vignette frame */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 50%, hsl(0 80% 5% / 0.85) 100%)",
      }} />

      {/* Top header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="font-orbitron text-[11px] tracking-[0.5em] animate-hud-flicker"
             style={{ color: "hsl(15 90% 60%)", textShadow: "0 0 18px hsl(15 90% 50% / 0.7)" }}>
          PRECISION ELIMINATION MODE
        </div>
        <div className="font-mono text-[8px] tracking-[0.4em]" style={{ color: "hsl(15 70% 65% / 0.7)" }}>
          STARK TACTICAL // COMBAT HELMET HUD
        </div>
      </div>

      {/* Top corner brackets */}
      <div className="absolute top-2 left-2 w-10 h-10 border-l-2 border-t-2" style={{ borderColor: "hsl(15 90% 60% / 0.7)" }} />
      <div className="absolute top-2 right-2 w-10 h-10 border-r-2 border-t-2" style={{ borderColor: "hsl(15 90% 60% / 0.7)" }} />
      <div className="absolute bottom-2 left-2 w-10 h-10 border-l-2 border-b-2" style={{ borderColor: "hsl(15 90% 60% / 0.7)" }} />
      <div className="absolute bottom-2 right-2 w-10 h-10 border-r-2 border-b-2" style={{ borderColor: "hsl(15 90% 60% / 0.7)" }} />

      {/* ==== LEFT WEAPON RESERVE PANEL ==== */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-[180px] flex flex-col gap-2">
        <WeaponPanel title="WEAPON RESERVE" status="READY" value={`${Math.floor(bar(1))}%`} barPct={bar(1)} blink={false} />
        <WeaponPanel title="MISSILE SYSTEM" status="ARMED" value="08 / 12" barPct={66} blink />
        <WeaponPanel title="TARGET LOCK" status={locked ? "ACQUIRED" : "SEARCHING"} value={locked ? "100%" : `${Math.floor(bar(3))}%`} barPct={locked ? 100 : bar(3)} blink={!locked} />
        <WeaponPanel title="POWER OUTPUT" status="ONLINE" value={`${(bar(2) / 10).toFixed(1)} GW`} barPct={bar(2)} blink={false} />
        <WeaponPanel title="AIM ASSIST" status="ONLINE" value="AUTO" barPct={88} blink={false} />
        <WeaponPanel title="FIRE CONTROL" status="STANDBY" value="SAFE" barPct={45} blink />
        <WeaponPanel title="ARMOR STATUS" status="NOMINAL" value={`${Math.floor(bar(5))}%`} barPct={bar(5)} blink={false} />
      </div>

      {/* ==== RIGHT SIDE GAUGES / DATA ==== */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-[160px] flex flex-col gap-3 items-end">
        {/* Mini circular analysis */}
        <svg viewBox="0 0 100 100" className="w-24 h-24">
          <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(15 80% 55% / 0.3)" strokeWidth="1" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(15 90% 60%)" strokeWidth="2"
                  strokeDasharray={`${bar(7) * 2.6} 999`} transform="rotate(-90 50 50)" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="hsl(15 70% 50% / 0.4)" strokeWidth="0.5"
                  strokeDasharray="2 4" style={{ transform: `rotate(${tick * 2}deg)`, transformOrigin: "center" }} />
          <text x="50" y="48" textAnchor="middle" fontSize="11" fill="hsl(15 90% 70%)"
                fontFamily="Orbitron" fontWeight="700">{Math.floor(bar(7))}%</text>
          <text x="50" y="62" textAnchor="middle" fontSize="6" fill="hsl(15 70% 65% / 0.7)" fontFamily="monospace" letterSpacing="2">THREAT</text>
        </svg>

        <div className="font-mono text-[8px] tracking-[0.25em] text-right space-y-1" style={{ color: "hsl(15 80% 65% / 0.85)" }}>
          <div>RANGE.... {Math.floor(120 + bar(9))} M</div>
          <div>WIND..... {(bar(11) / 30).toFixed(1)} M/S</div>
          <div>ALT...... {Math.floor(20 + bar(13) / 5)} M</div>
          <div className="animate-hud-flicker">TRAJECTORY: SOLVED</div>
          <div>BALLISTIC: NOMINAL</div>
        </div>

        {/* Vertical gauge */}
        <div className="flex gap-1 mt-2">
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} className="w-1.5 rounded-sm" style={{
              height: `${20 + ((Math.sin(tick * 0.1 + i) + 1) / 2) * 30}px`,
              background: `hsl(15 90% ${50 + i * 3}% / ${0.4 + (i / 8) * 0.5})`,
              boxShadow: `0 0 6px hsl(15 90% 55% / 0.5)`,
            }} />
          ))}
        </div>
      </div>

      {/* ==== RIGHT EYE TRACKING LOCK ==== */}
      <div className="absolute" style={{
        left: `${eyeX}%`, top: `${eyeY}%`,
        transform: "translate(-50%, -50%)",
        transition: "left 0.1s linear, top 0.1s linear",
      }}>
        <svg viewBox="0 0 240 240" className="w-44 h-44">
          {/* Outer rotating arcs */}
          <g style={{ transformOrigin: "center", animation: "rotate-slow 12s linear infinite" }}>
            <circle cx="120" cy="120" r="105" fill="none"
                    stroke="hsl(15 90% 60% / 0.7)" strokeWidth="1.5"
                    strokeDasharray="40 30 12 18 8 22" />
          </g>
          <g style={{ transformOrigin: "center", animation: "rotate-reverse 9s linear infinite" }}>
            <circle cx="120" cy="120" r="88" fill="none"
                    stroke="hsl(15 80% 55% / 0.55)" strokeWidth="1"
                    strokeDasharray="6 8 14 6" />
          </g>

          {/* Tick marks */}
          {Array.from({ length: 36 }).map((_, i) => {
            const a = (i / 36) * Math.PI * 2;
            const r1 = 72, r2 = i % 3 === 0 ? 80 : 76;
            const x1 = 120 + Math.cos(a) * r1, y1 = 120 + Math.sin(a) * r1;
            const x2 = 120 + Math.cos(a) * r2, y2 = 120 + Math.sin(a) * r2;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                         stroke="hsl(15 90% 60% / 0.8)" strokeWidth={i % 3 === 0 ? 1.5 : 0.7} />;
          })}

          {/* Crosshair brackets — corners */}
          {[
            { x: 60, y: 60, dx: 1, dy: 1 },
            { x: 180, y: 60, dx: -1, dy: 1 },
            { x: 60, y: 180, dx: 1, dy: -1 },
            { x: 180, y: 180, dx: -1, dy: -1 },
          ].map((c, i) => (
            <g key={i} style={{ animation: locked ? "pulse-glow 1.4s ease-in-out infinite" : undefined }}>
              <line x1={c.x} y1={c.y} x2={c.x + c.dx * 18} y2={c.y} stroke="hsl(15 95% 65%)" strokeWidth="2.5" />
              <line x1={c.x} y1={c.y} x2={c.x} y2={c.y + c.dy * 18} stroke="hsl(15 95% 65%)" strokeWidth="2.5" />
            </g>
          ))}

          {/* Center crosshair */}
          <line x1="120" y1="100" x2="120" y2="115" stroke="hsl(15 95% 70%)" strokeWidth="1.5" />
          <line x1="120" y1="125" x2="120" y2="140" stroke="hsl(15 95% 70%)" strokeWidth="1.5" />
          <line x1="100" y1="120" x2="115" y2="120" stroke="hsl(15 95% 70%)" strokeWidth="1.5" />
          <line x1="125" y1="120" x2="140" y2="120" stroke="hsl(15 95% 70%)" strokeWidth="1.5" />
          <circle cx="120" cy="120" r="3" fill="hsl(15 95% 70%)" />

          {/* Scan pulse */}
          <circle cx="120" cy="120" r={40 + (tick * 1.5) % 60} fill="none"
                  stroke="hsl(15 90% 60%)"
                  strokeWidth="1"
                  opacity={Math.max(0, 1 - ((tick * 1.5) % 60) / 60)} />
        </svg>

        {/* Eye label */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap font-mono text-[9px] tracking-[0.25em] animate-hud-flicker"
             style={{ color: "hsl(15 95% 65%)", textShadow: "0 0 10px hsl(15 90% 50% / 0.8)" }}>
          {locked ? "▶ RIGHT EYE LOCK ACQUIRED" : "▶ SCANNING..."}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 font-mono text-[9px] tracking-[0.3em]"
           style={{ color: "hsl(15 80% 65%)" }}>
        <div className={locked ? "" : "animate-hud-flicker"}>● TARGET TRACKING ACTIVE</div>
        <div>● WEAPON RESERVE: READY</div>
        <div>● AIM ASSIST: ONLINE</div>
      </div>

      {/* Side thin tech lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <line x1="0" y1="20%" x2="12%" y2="20%" stroke="hsl(15 80% 60% / 0.4)" strokeWidth="0.5" />
        <line x1="88%" y1="20%" x2="100%" y2="20%" stroke="hsl(15 80% 60% / 0.4)" strokeWidth="0.5" />
        <line x1="0" y1="80%" x2="12%" y2="80%" stroke="hsl(15 80% 60% / 0.4)" strokeWidth="0.5" />
        <line x1="88%" y1="80%" x2="100%" y2="80%" stroke="hsl(15 80% 60% / 0.4)" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

const WeaponPanel = ({ title, status, value, barPct, blink }: {
  title: string; status: string; value: string; barPct: number; blink: boolean;
}) => (
  <div className="border px-2 py-1.5"
       style={{
         borderColor: "hsl(15 80% 50% / 0.5)",
         background: "linear-gradient(135deg, hsl(0 60% 8% / 0.7), hsl(15 50% 10% / 0.5))",
         boxShadow: "inset 0 0 10px hsl(15 80% 30% / 0.2)",
       }}>
    <div className="flex justify-between items-center">
      <div className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "hsl(15 90% 70%)" }}>{title}</div>
      <div className={`font-mono text-[8px] tracking-wider ${blink ? "animate-hud-flicker" : ""}`}
           style={{ color: blink ? "hsl(40 90% 60%)" : "hsl(15 90% 65%)" }}>
        {status}
      </div>
    </div>
    <div className="mt-1 h-1 w-full" style={{ background: "hsl(15 30% 15% / 0.8)" }}>
      <div className="h-full transition-all duration-300" style={{
        width: `${Math.min(100, barPct)}%`,
        background: "linear-gradient(90deg, hsl(15 90% 55%), hsl(30 95% 65%))",
        boxShadow: "0 0 6px hsl(15 90% 55% / 0.7)",
      }} />
    </div>
    <div className="mt-1 flex justify-between font-mono text-[7px] tracking-wider" style={{ color: "hsl(15 60% 70% / 0.7)" }}>
      <span>{value}</span>
      <span>● {String(Math.floor(barPct)).padStart(3, "0")}</span>
    </div>
  </div>
);

export default PrecisionEliminationMode;
