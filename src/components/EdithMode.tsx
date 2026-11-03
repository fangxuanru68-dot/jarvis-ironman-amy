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
      className={`fixed inset-0 z-[5] pointer-events-none transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
      style={{ fontFamily: "'Rajdhani', 'Orbitron', sans-serif" }}
    >
      {/* glasses-lens frame: thin corners only, centre stays clear */}
      <div className="absolute inset-3 rounded-[28px] border border-cyan-200/10" />
      {["left-3 top-3 border-l border-t","right-3 top-3 border-r border-t","left-3 bottom-3 border-l border-b","right-3 bottom-3 border-r border-b"].map(c => <span key={c} className={`absolute h-10 w-10 border-amber-200/50 ${c}`} />)}
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" style={{ animation: "edith-scan 7s linear infinite" }} />

      {/* compact top line */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center" style={{ animation: "edith-fade-in .8s ease-out both" }}>
        <div className="text-[10px] tracking-[0.5em] text-cyan-50/90">E.D.I.T.H. · EVEN DEAD, I'M THE HERO</div>
        <div className="mt-1 text-[9px] tracking-[0.35em] text-amber-200/70">ACCESS LEVEL: PETER PARKER · STARK INDUSTRIES</div>
      </div>

      {/* left column: everything stays clear of the chat on the right */}
      <div className="absolute left-5 top-16 bottom-16 w-[230px] flex flex-col gap-3 overflow-hidden">
        <div className="relative mx-auto h-24 w-24">
          <svg className="absolute inset-0" viewBox="-50 -50 100 100" fill="none">
            <circle r="46" stroke="rgba(200,235,255,.5)" strokeDasharray="2 5" style={{ transformOrigin: "center", animation: "edith-spin 20s linear infinite" }} />
            <circle r="38" stroke="rgba(255,215,120,.5)" strokeDasharray="10 5" style={{ transformOrigin: "center", animation: "edith-spin 28s linear infinite reverse" }} />
            <circle r="26" fill="rgba(160,225,255,.18)" style={{ animation: "edith-core-pulse 3s ease-in-out infinite" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xs tracking-[0.3em] text-cyan-50">EDITH</span><span className="text-[7px] tracking-widest text-cyan-100/70">ONLINE</span></div>
        </div>
        <Panel title="DRONE ARMADA" delay={0.3}>
          <Row label="STARK DRONES" status="DOCKED" pct={drone} dot="cyan" />
          <Row label="ORBITAL SAT" status="LINKED" pct={92} dot="cyan" />
          <Row label="STRIKE AUTH" status="LOCKED" pct={0} dot="amber" />
        </Panel>
        <Panel title="INTEL & SURVEILLANCE" delay={0.45}>
          <Row label="FACE ID" status="STANDBY" pct={idScan} dot="cyan" />
          <Row label="PHONE / COMMS" status="PASSIVE" pct={60} dot="cyan" />
          <Row label="ILLUSION CHECK" status={tick % 10 < 5 ? "SCANNING" : "NO DRONE PROJECTION"} pct={targeting} dot="amber" />
        </Panel>
        <div className="text-[9px] tracking-widest text-cyan-100/60 leading-5">
          <div>UPLINK STARK-SAT-04 · 12MS</div>
          <div>OWNERSHIP: TRANSFERRED BY T. STARK</div>
          <div className="text-amber-200/70">FIRE CONTROL: SIMULATION ONLY</div>
        </div>
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
    className={`relative w-full border border-cyan-200/20 bg-[rgba(8,18,32,0.35)] backdrop-blur-sm p-3 ${className}`}
    style={{
      animation: `edith-fade-in 0.8s ease-out ${delay}s both`,
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
