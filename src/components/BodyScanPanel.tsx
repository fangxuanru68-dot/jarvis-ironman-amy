import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BodyScanPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const BodyScanPanel = ({ isOpen, onClose }: BodyScanPanelProps) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState<"scanning" | "analyzing" | "complete">("scanning");
  const [vitals, setVitals] = useState({
    heartRate: 72,
    bodyTemp: 36.6,
    bloodPressure: "120/80",
    oxygenSat: 98,
    hydration: 85,
    stress: 23,
  });

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setScanProgress(0);
      setScanPhase("scanning");
    }
  }, [isOpen]);

  // Scan animation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanPhase("analyzing");
          setTimeout(() => setScanPhase("complete"), 1500);
          return 100;
        }
        return prev + 0.8;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Simulate vitals fluctuation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setVitals(v => ({
        ...v,
        heartRate: 70 + Math.floor(Math.random() * 8),
        bodyTemp: +(36.4 + Math.random() * 0.4).toFixed(1),
        oxygenSat: 97 + Math.floor(Math.random() * 3),
        stress: 20 + Math.floor(Math.random() * 10),
        hydration: 82 + Math.floor(Math.random() * 8),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-30 flex flex-col overflow-hidden animate-slide-in-right"
      style={{
        width: "380px",
        background: "linear-gradient(135deg, hsl(220 30% 4% / 0.95), hsl(210 40% 6% / 0.92))",
        borderLeft: "1px solid hsl(195 100% 50% / 0.2)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <div className="font-orbitron text-[10px] tracking-[0.3em] text-primary/60">BIOMETRIC SCAN</div>
          <div className="font-mono text-[7px] text-muted-foreground tracking-wider mt-0.5">
            {scanPhase === "scanning" ? "SCANNING IN PROGRESS..." : scanPhase === "analyzing" ? "ANALYZING DATA..." : "SCAN COMPLETE"}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-sm border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
        >
          <X size={12} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="h-[2px] bg-border/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${scanProgress}%`,
              background: "linear-gradient(90deg, hsl(195 100% 50% / 0.3), hsl(195 100% 50% / 0.8))",
              boxShadow: "0 0 8px hsl(195 100% 50% / 0.5)",
            }}
          />
        </div>
        <div className="font-mono text-[7px] text-primary/50 text-right mt-0.5">{Math.round(scanProgress)}%</div>
      </div>

      {/* Body scan visualization */}
      <div className="flex-1 flex items-center justify-center relative px-4">
        <div className="relative w-full h-full max-h-[500px] flex items-center justify-center">
          {/* Body outline SVG */}
          <svg viewBox="0 0 200 500" className="h-full max-h-[420px] w-auto" style={{ filter: "drop-shadow(0 0 15px hsl(195 100% 50% / 0.3))" }}>
            {/* Grid lines behind body */}
            {Array.from({ length: 25 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 20} x2="200" y2={i * 20} stroke="hsl(195 100% 50% / 0.05)" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="500" stroke="hsl(195 100% 50% / 0.05)" strokeWidth="0.5" />
            ))}

            {/* Body silhouette */}
            <path
              d="M100,20 C115,20 125,35 125,50 C125,65 115,75 100,75 C85,75 75,65 75,50 C75,35 85,20 100,20 Z
                 M100,75 L100,80 M70,110 L55,170 L50,175 L40,172 M130,110 L145,170 L150,175 L160,172
                 M80,80 L70,110 L75,120 L80,115 L85,100 L100,95 L115,100 L120,115 L125,120 L130,110 L120,80
                 M80,80 L100,85 L120,80
                 M85,100 L80,180 L75,280 L80,285 L85,280 L90,180 L100,160 L110,180 L115,280 L120,285 L125,280 L120,180 L115,100
                 M75,280 L70,370 L65,440 L60,445 L55,442 L60,440 L65,370 L70,280
                 M125,280 L130,370 L135,440 L140,445 L145,442 L140,440 L135,370 L130,280"
              fill="none"
              stroke="hsl(195 100% 50% / 0.4)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Inner detail lines - skeletal/muscle hints */}
            <path
              d="M90,50 L95,48 M105,48 L110,50 M95,55 L100,57 L105,55 M95,62 L105,62
                 M90,100 L90,150 M110,100 L110,150
                 M95,120 L105,120 M95,140 L105,140
                 M85,200 L85,250 M115,200 L115,250
                 M75,300 L75,350 M125,300 L125,350"
              fill="none"
              stroke="hsl(195 100% 50% / 0.15)"
              strokeWidth="0.8"
            />

            {/* Scanning line */}
            <line
              x1="30" y1={scanProgress * 4.5} x2="170" y2={scanProgress * 4.5}
              stroke="hsl(195 100% 50% / 0.8)"
              strokeWidth="2"
              style={{
                filter: "drop-shadow(0 0 6px hsl(195 100% 50% / 0.8))",
                opacity: scanPhase === "scanning" ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            />
            {/* Scan glow area */}
            {scanPhase === "scanning" && (
              <rect
                x="30" y={Math.max(0, scanProgress * 4.5 - 30)} width="140" height="30"
                fill="url(#scanGlow)"
                opacity="0.3"
              />
            )}

            {/* Highlight points */}
            {scanPhase === "complete" && (
              <>
                {[
                  { cx: 100, cy: 50, label: "HEAD" },
                  { cx: 100, cy: 110, label: "CHEST" },
                  { cx: 55, cy: 170, label: "R.ARM" },
                  { cx: 145, cy: 170, label: "L.ARM" },
                  { cx: 100, cy: 200, label: "CORE" },
                  { cx: 80, cy: 350, label: "R.LEG" },
                  { cx: 120, cy: 350, label: "L.LEG" },
                ].map((pt, i) => (
                  <g key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                    <circle cx={pt.cx} cy={pt.cy} r="4" fill="none" stroke="hsl(195 100% 50% / 0.6)" strokeWidth="1">
                      <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={pt.cx} cy={pt.cy} r="1.5" fill="hsl(195 100% 50% / 0.8)" />
                    <text x={pt.cx + 8} y={pt.cy + 3} fill="hsl(195 100% 50% / 0.5)" fontSize="6" fontFamily="monospace">{pt.label}</text>
                  </g>
                ))}
              </>
            )}

            {/* Gradient defs */}
            <defs>
              <linearGradient id="scanGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(195 100% 50%)" stopOpacity="0" />
                <stop offset="100%" stopColor="hsl(195 100% 50%)" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Rotating rings around body */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="border border-primary/10 rounded-full"
              style={{
                width: "280px", height: "280px",
                animation: "spin 8s linear infinite",
              }}
            />
            <div
              className="absolute border border-primary/5 rounded-full"
              style={{
                width: "320px", height: "320px",
                animation: "spin 12s linear infinite reverse",
              }}
            />
          </div>
        </div>
      </div>

      {/* Vitals readout */}
      <div className="px-4 pb-4">
        <div className="font-orbitron text-[8px] tracking-[0.2em] text-primary/50 mb-2">VITALS READOUT</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "HEART RATE", value: `${vitals.heartRate}`, unit: "BPM", color: "hsl(0 70% 55%)" },
            { label: "BODY TEMP", value: `${vitals.bodyTemp}`, unit: "°C", color: "hsl(30 80% 55%)" },
            { label: "BLOOD P.", value: vitals.bloodPressure, unit: "mmHg", color: "hsl(195 100% 50%)" },
            { label: "O₂ SAT", value: `${vitals.oxygenSat}`, unit: "%", color: "hsl(120 60% 50%)" },
            { label: "HYDRATION", value: `${vitals.hydration}`, unit: "%", color: "hsl(210 80% 60%)" },
            { label: "STRESS", value: `${vitals.stress}`, unit: "LVL", color: "hsl(45 80% 55%)" },
          ].map((v, i) => (
            <div key={i} className="bg-card/30 border border-border/20 rounded-sm p-2">
              <div className="font-mono text-[6px] text-muted-foreground tracking-wider">{v.label}</div>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="font-orbitron text-sm" style={{ color: v.color }}>{v.value}</span>
                <span className="font-mono text-[6px] text-muted-foreground">{v.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Status summary */}
        {scanPhase === "complete" && (
          <div className="mt-3 p-2 bg-primary/5 border border-primary/20 rounded-sm animate-fade-in">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-[8px] text-primary tracking-wider">ALL SYSTEMS NOMINAL</span>
            </div>
            <div className="font-mono text-[7px] text-muted-foreground mt-1">
              No anomalies detected. Subject vitals within optimal parameters.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyScanPanel;
