import { useEffect, useState } from "react";

interface EdithModeProps {
  isActive: boolean;
  fireLockWarning?: boolean;
}

const ORBITS = [
  { rx: 320, ry: 90, rot: 0 },
  { rx: 360, ry: 110, rot: 35 },
  { rx: 280, ry: 130, rot: -25 },
  { rx: 400, ry: 80, rot: 70 },
];

const NODES = Array.from({ length: 26 }).map((_, i) => ({
  id: i,
  cx: (i * 137) % 100,
  cy: (i * 79) % 100,
  delay: (i * 0.13) % 3,
}));

const FACE_DETECTIONS = [
  { x: 18, y: 28, w: 10, h: 14, id: "ID-04A2", conf: 98, name: "PETER PARKER", flag: "TRUSTED" },
  { x: 64, y: 22, w: 8, h: 12, id: "ID-7711", conf: 87, name: "UNKNOWN", flag: "ANALYZING" },
  { x: 42, y: 60, w: 9, h: 13, id: "ID-2B19", conf: 93, name: "UNKNOWN", flag: "OBSERVING" },
];

const EdithMode = ({ isActive, fireLockWarning = false }: EdithModeProps) => {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (isActive) {
      const t = setTimeout(() => setMounted(true), 30);
      return () => clearTimeout(t);
    }
    setMounted(false);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setTick((t) => t + 1), 600);
    return () => clearInterval(id);
  }, [isActive]);

  if (!isActive) return null;

  const drone = 40 + ((tick * 7) % 55);
  const targeting = 60 + ((tick * 5) % 35);
  const idScan = 20 + ((tick * 11) % 75);

  return (
    <div
      className={`fixed inset-0 z-[60] pointer-events-none transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
      style={{ fontFamily: "'Rajdhani', 'Orbitron', sans-serif" }}
    >
      {/* dim wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,20,40,0.35)_0%,rgba(0,0,0,0.55)_100%)]" />

      {/* faint global grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.18]" preserveAspectRatio="none">
        <defs>
          <pattern id="edith-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgb(180,230,255)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="edith-globe" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(120,210,255,0.22)" />
            <stop offset="100%" stopColor="rgba(120,210,255,0)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#edith-grid)" />
      </svg>

      {/* faux world map fragments */}
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
        <g fill="rgba(180,230,255,0.35)">
          {Array.from({ length: 220 }).map((_, i) => {
            const x = (i * 53) % 1000;
            const y = (i * 91) % 600;
            const s = ((i * 17) % 5) + 1;
            return <rect key={i} x={x} y={y} width={s} height={s} />;
          })}
        </g>
        {/* satellite orbit ellipses */}
        <g fill="none" stroke="rgba(180,230,255,0.5)" strokeWidth="0.8">
          {ORBITS.map((o, i) => (
            <g key={i} style={{ transformOrigin: "500px 300px", animation: `edith-spin ${30 + i * 8}s linear infinite ${i % 2 ? "reverse" : ""}` }}>
              <ellipse cx={500} cy={300} rx={o.rx} ry={o.ry} transform={`rotate(${o.rot} 500 300)`} />
              <circle cx={500 + o.rx} cy={300} r={3} fill="rgba(255,215,120,0.9)" transform={`rotate(${o.rot} 500 300)`} />
            </g>
          ))}
        </g>
      </svg>

      {/* slow scan line */}
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" style={{ top: `${(tick * 4) % 100}%`, animation: "edith-scan 6s linear infinite" }} />

      {/* pulsing nodes */}
      {NODES.map((n) => (
        <span
          key={n.id}
          className="absolute w-1.5 h-1.5 rounded-full bg-cyan-200"
          style={{
            left: `${n.cx}%`,
            top: `${n.cy}%`,
            boxShadow: "0 0 8px 2px rgba(160,230,255,0.8)",
            animation: `edith-node-pulse 2.4s ease-in-out ${n.delay}s infinite`,
          }}
        />
      ))}

      {/* facial recognition boxes removed per user request */}

      {/* TOP STATUS BAR */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-6 px-6 py-2 border border-cyan-200/30 bg-[rgba(8,18,32,0.35)] backdrop-blur-sm text-[11px] tracking-[0.25em] text-cyan-100">
        <span className="flex items-center gap-2"><Dot color="cyan" /> EDITH ONLINE</span>
        <span className="flex items-center gap-2"><Dot color="cyan" /> GLOBAL NETWORK CONNECTED</span>
        <span className="flex items-center gap-2"><Dot color="amber" /> STARK ACCESS GRANTED</span>
        <span className="flex items-center gap-2"><Dot color="cyan" /> SECURITY LEVEL: HIGH</span>
      </div>

      {/* CENTER COMMAND CORE */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[420px] h-[420px] flex items-center justify-center" style={{ animation: "edith-fade-in 1s ease-out both" }}>
          <svg className="absolute inset-0" viewBox="-100 -100 200 200">
            <defs>
              <radialGradient id="edith-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(220,245,255,0.9)" />
                <stop offset="60%" stopColor="rgba(140,210,255,0.25)" />
                <stop offset="100%" stopColor="rgba(140,210,255,0)" />
              </radialGradient>
            </defs>
            <circle cx="0" cy="0" r="60" fill="url(#edith-core)" style={{ animation: "edith-core-pulse 3.2s ease-in-out infinite" }} />
            <g fill="none" strokeWidth="0.6">
              <circle r="92" stroke="rgba(200,235,255,0.5)" strokeDasharray="2 6" style={{ transformOrigin: "center", animation: "edith-spin 22s linear infinite" }} />
              <circle r="78" stroke="rgba(255,215,120,0.45)" strokeDasharray="14 6" style={{ transformOrigin: "center", animation: "edith-spin 30s linear infinite reverse" }} />
              <circle r="62" stroke="rgba(200,235,255,0.7)" />
              <circle r="48" stroke="rgba(200,235,255,0.4)" strokeDasharray="3 3" style={{ transformOrigin: "center", animation: "edith-spin 16s linear infinite" }} />
            </g>
            {/* tick marks */}
            <g stroke="rgba(200,235,255,0.7)" strokeWidth="0.7">
              {Array.from({ length: 60 }).map((_, i) => {
                const a = (i / 60) * Math.PI * 2;
                const r1 = 92, r2 = i % 5 === 0 ? 84 : 88;
                return <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} />;
              })}
            </g>
          </svg>
          <div className="relative text-center select-none">
            <div className="text-cyan-50 text-xl tracking-[0.4em] font-light drop-shadow-[0_0_12px_rgba(180,230,255,0.8)]">EDITH</div>
            <div className="text-cyan-100/80 text-[10px] tracking-[0.35em] mt-1">SYSTEM ONLINE</div>
            <div className="mt-3 text-amber-200/80 text-[10px] tracking-[0.3em]">ACCESS LEVEL</div>
            <div className="text-cyan-50 text-sm tracking-[0.3em]">PETER PARKER</div>
          </div>
        </div>
      </div>

      {/* LEFT PANEL - DRONE NETWORK */}
      <Panel title="DRONE NETWORK" className="left-6 top-1/2 -translate-y-1/2" delay={0.4}>
        <Row label="DRONE SWARM" status="STANDBY" pct={drone} dot="cyan" />
        <Row label="TARGETING SYSTEM" status="READY" pct={targeting} dot="amber" />
        <Row label="SATELLITE LINK" status="ACTIVE" pct={92} dot="cyan" />
        <Row label="REMOTE ACCESS" status="ENABLED" pct={88} dot="cyan" />
        <div className="mt-3 pt-3 border-t border-cyan-200/15 text-[9px] tracking-widest text-cyan-100/60">
          <div className="flex justify-between"><span>SWARM SIZE</span><span className="text-cyan-50">248 UNITS</span></div>
          <div className="flex justify-between"><span>UPLINK</span><span className="text-cyan-50">STARK-SAT-04</span></div>
          <div className="flex justify-between"><span>LATENCY</span><span className="text-cyan-50">12 MS</span></div>
        </div>
      </Panel>

      {/* RIGHT PANEL - SURVEILLANCE */}
      <Panel title="SURVEILLANCE SYSTEM" className="right-6 top-1/2 -translate-y-1/2" delay={0.55} align="right">
        <Row label="FACIAL RECOGNITION" status="ACTIVE" pct={94} dot="cyan" />
        <Row label="IDENTITY SCAN" status="RUNNING" pct={idScan} dot="amber" />
        <Row label="THREAT ANALYSIS" status="LOW" pct={22} dot="cyan" />
        <Row label="VISUAL FEED" status="LIVE" pct={100} dot="cyan" />
        <div className="mt-3 pt-3 border-t border-cyan-200/15 text-[9px] tracking-widest text-cyan-100/60">
          <div className="flex justify-between"><span>FACES TRACKED</span><span className="text-cyan-50">{3 + (tick % 4)}</span></div>
          <div className="flex justify-between"><span>DATABASE</span><span className="text-cyan-50">STARK GLOBAL</span></div>
          <div className="flex justify-between"><span>FEEDS</span><span className="text-cyan-50">17 ACTIVE</span></div>
        </div>
      </Panel>

      {/* floating data window */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3 text-[10px] tracking-widest text-cyan-100/80">
        <Chip>UPLINK 99.2%</Chip>
        <Chip>NODES 248</Chip>
        <Chip color="amber">STARK LEGACY</Chip>
        <Chip>ENC AES-512</Chip>
        <Chip>PING 11MS</Chip>
      </div>

      {/* FIRE LOCK WARNING */}
      {fireLockWarning && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ animation: "edith-fade-in 0.3s ease-out" }}>
          <div className="absolute inset-0 bg-red-900/10" />
          <div className="relative border-2 border-red-300/80 bg-[rgba(40,8,8,0.55)] backdrop-blur-sm px-10 py-6 text-center">
            <div className="text-red-200 tracking-[0.5em] text-xl">FIRE CONTROL LOCKED</div>
            <div className="text-cyan-100/80 tracking-[0.3em] text-xs mt-2">SIMULATION ONLY</div>
            <div className="text-amber-200/80 tracking-[0.3em] text-[10px] mt-1">CONFIRMATION REQUIRED</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes edith-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes edith-core-pulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes edith-scan { 0% { top: -2%; } 100% { top: 102%; } }
        @keyframes edith-node-pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes edith-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes edith-slide-left {
          from { opacity: 0; transform: translate(-30px, -50%); }
          to { opacity: 1; transform: translate(0, -50%); }
        }
        @keyframes edith-slide-right {
          from { opacity: 0; transform: translate(30px, -50%); }
          to { opacity: 1; transform: translate(0, -50%); }
        }
        @keyframes edith-bar { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
};

const Dot = ({ color }: { color: "cyan" | "amber" }) => (
  <span
    className="inline-block w-1.5 h-1.5 rounded-full"
    style={{
      background: color === "amber" ? "rgb(255,215,120)" : "rgb(180,230,255)",
      boxShadow: `0 0 6px ${color === "amber" ? "rgba(255,215,120,0.9)" : "rgba(180,230,255,0.9)"}`,
      animation: "edith-bar 1.6s ease-in-out infinite",
    }}
  />
);

const Panel = ({
  title,
  children,
  className = "",
  delay = 0,
  align = "left",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  align?: "left" | "right";
}) => (
  <div
    className={`absolute w-[280px] border border-cyan-200/25 bg-[rgba(8,18,32,0.45)] backdrop-blur-sm p-4 ${className}`}
    style={{
      animation: `${align === "right" ? "edith-slide-right" : "edith-slide-left"} 0.9s ease-out ${delay}s both`,
      boxShadow: "0 0 30px rgba(120,210,255,0.08), inset 0 0 20px rgba(120,210,255,0.04)",
    }}
  >
    <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-200/20">
      <span className="text-[10px] tracking-[0.3em] text-cyan-100">{title}</span>
      <span className="text-[9px] tracking-widest text-amber-200/70">STARK</span>
    </div>
    {children}
  </div>
);

const Row = ({ label, status, pct, dot }: { label: string; status: string; pct: number; dot: "cyan" | "amber" }) => (
  <div className="mb-2.5">
    <div className="flex items-center justify-between text-[10px] tracking-widest mb-1">
      <span className="flex items-center gap-2 text-cyan-100/85"><Dot color={dot} />{label}</span>
      <span className={dot === "amber" ? "text-amber-200/90" : "text-cyan-50"}>{status}</span>
    </div>
    <div className="h-[3px] w-full bg-cyan-200/10 overflow-hidden">
      <div
        className="h-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: dot === "amber"
            ? "linear-gradient(90deg, rgba(255,215,120,0.5), rgba(255,215,120,1))"
            : "linear-gradient(90deg, rgba(180,230,255,0.4), rgba(220,245,255,1))",
          boxShadow: dot === "amber" ? "0 0 6px rgba(255,215,120,0.6)" : "0 0 6px rgba(180,230,255,0.6)",
        }}
      />
    </div>
  </div>
);

const Chip = ({ children, color = "cyan" }: { children: React.ReactNode; color?: "cyan" | "amber" }) => (
  <span
    className="px-2.5 py-1 border bg-[rgba(8,18,32,0.45)] backdrop-blur-sm"
    style={{
      borderColor: color === "amber" ? "rgba(255,215,120,0.45)" : "rgba(180,230,255,0.3)",
      color: color === "amber" ? "rgb(255,225,170)" : "rgb(220,245,255)",
    }}
  >
    {children}
  </span>
);

export default EdithMode;
