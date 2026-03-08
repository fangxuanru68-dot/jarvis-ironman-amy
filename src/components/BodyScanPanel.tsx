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
          <svg viewBox="0 0 300 600" className="h-full max-h-[420px] w-auto" style={{ filter: "drop-shadow(0 0 15px hsl(195 100% 50% / 0.3))" }}>
            {/* Grid lines behind body */}
            {Array.from({ length: 30 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 20} x2="300" y2={i * 20} stroke="hsl(195 100% 50% / 0.05)" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 15 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="600" stroke="hsl(195 100% 50% / 0.05)" strokeWidth="0.5" />
            ))}

            {/* Iron Man Armor Silhouette */}
            {/* Helmet */}
            <path
              d="M150,18 C165,18 178,25 185,38 L188,48 L190,62 L188,75 L185,82 
                 C183,86 180,90 176,93 L172,95 L168,96 L160,97 L150,98 L140,97 L132,96 L128,95 L124,93
                 C120,90 117,86 115,82 L112,75 L110,62 L112,48 L115,38 C122,25 135,18 150,18 Z"
              fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.5"
            />
            {/* Helmet face plate */}
            <path
              d="M130,45 L132,40 L140,36 L150,34 L160,36 L168,40 L170,45 L170,55 L168,62 L165,68 L160,72 L150,75 L140,72 L135,68 L132,62 L130,55 Z"
              fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8"
            />
            {/* Eyes */}
            <path d="M135,50 L140,47 L148,48 L148,52 L140,53 Z" fill="hsl(195 100% 50% / 0.15)" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="0.6" />
            <path d="M165,50 L160,47 L152,48 L152,52 L160,53 Z" fill="hsl(195 100% 50% / 0.15)" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="0.6" />
            {/* Mouth slit */}
            <path d="M140,65 L145,67 L150,68 L155,67 L160,65" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.6" />
            {/* Helmet side details */}
            <path d="M112,55 L108,50 L108,62 L112,68" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            <path d="M188,55 L192,50 L192,62 L188,68" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />

            {/* Neck */}
            <path d="M135,98 L132,105 L130,112 L130,118 L170,118 L170,112 L168,105 L165,98" fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="1.2" />
            <path d="M133,103 L167,103 M132,108 L168,108 M131,113 L169,113" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />

            {/* Shoulders & Upper torso */}
            <path
              d="M130,118 L118,120 L100,125 L85,132 L75,140 L70,148 
                 M170,118 L182,120 L200,125 L215,132 L225,140 L230,148"
              fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.5"
            />
            {/* Shoulder armor plates */}
            <path d="M85,132 L78,128 L68,135 L65,145 L70,148 L80,142 Z" fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1" />
            <path d="M215,132 L222,128 L232,135 L235,145 L230,148 L220,142 Z" fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1" />

            {/* Chest plate */}
            <path
              d="M130,118 L125,130 L118,150 L115,170 L118,195 L125,210 L135,220 L150,225 L165,220 L175,210 L182,195 L185,170 L182,150 L175,130 L170,118"
              fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.5"
            />
            {/* Arc reactor */}
            <circle cx="150" cy="160" r="18" fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.2" />
            <circle cx="150" cy="160" r="12" fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="0.8" />
            <circle cx="150" cy="160" r="6" fill="hsl(195 100% 50% / 0.15)" stroke="hsl(195 100% 50% / 0.6)" strokeWidth="0.8">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Chest plate details */}
            <path d="M130,135 L135,155 L140,145 L150,142 L160,145 L165,155 L170,135" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.7" />
            <path d="M125,180 L135,178 L142,175 M175,180 L165,178 L158,175" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.7" />
            <path d="M120,195 L130,200 L140,205 M180,195 L170,200 L160,205" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.7" />

            {/* Upper arms */}
            <path
              d="M70,148 L65,160 L60,180 L58,200 L60,215 L63,225
                 M230,148 L235,160 L240,180 L242,200 L240,215 L237,225"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3"
            />
            {/* Upper arm armor segments */}
            <path d="M68,155 L58,158 L55,170 L58,180 L65,178" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            <path d="M232,155 L242,158 L245,170 L242,180 L235,178" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />

            {/* Elbow joints */}
            <circle cx="62" cy="225" r="8" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            <circle cx="238" cy="225" r="8" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />

            {/* Forearms */}
            <path
              d="M63,233 L60,250 L55,270 L52,290 L50,305 L50,310
                 M237,233 L240,250 L245,270 L248,290 L250,305 L250,310"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3"
            />
            {/* Forearm armor plates */}
            <path d="M60,245 L50,248 L48,265 L52,275 L58,272" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            <path d="M240,245 L250,248 L252,265 L248,275 L242,272" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            {/* Repulsor circles on palms */}
            <circle cx="48" cy="318" r="5" fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="0.8" />
            <circle cx="252" cy="318" r="5" fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="0.8" />

            {/* Hands */}
            <path
              d="M50,310 L48,320 L45,328 L42,325 L44,318 M48,320 L46,330 L43,328 M48,320 L50,330 L48,332 M50,310 L53,322 L55,328 L53,330
                 M250,310 L252,320 L255,328 L258,325 L256,318 M252,320 L254,330 L257,328 M252,320 L250,330 L252,332 M250,310 L247,322 L245,328 L247,330"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="0.8"
            />

            {/* Waist / Ab section */}
            <path
              d="M125,210 L120,225 L118,240 L120,255 L125,260 L150,265 L175,260 L180,255 L182,240 L180,225 L175,210"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3"
            />
            {/* Ab plate lines */}
            <path d="M140,215 L140,255 M160,215 L160,255 M135,230 L165,230 M135,245 L165,245" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />

            {/* Hip / Codpiece area */}
            <path
              d="M125,260 L118,270 L115,285 L120,295 L135,300 L150,303 L165,300 L180,295 L185,285 L182,270 L175,260"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3"
            />

            {/* Upper legs / Thighs */}
            <path
              d="M135,300 L128,320 L122,345 L120,370 L122,385
                 M165,300 L172,320 L178,345 L180,370 L178,385"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3"
            />
            {/* Thigh armor plates */}
            <path d="M130,310 L118,315 L115,335 L120,350 L125,348" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            <path d="M170,310 L182,315 L185,335 L180,350 L175,348" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />

            {/* Knee joints */}
            <path d="M118,378 L115,385 L115,395 L118,400 L128,402 L130,395 L128,385 Z" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            <path d="M182,378 L185,385 L185,395 L182,400 L172,402 L170,395 L172,385 Z" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />

            {/* Lower legs / Shins */}
            <path
              d="M122,400 L118,420 L115,445 L113,470 L112,485
                 M178,400 L182,420 L185,445 L187,470 L188,485"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3"
            />
            {/* Shin armor plates */}
            <path d="M120,410 L110,415 L108,440 L112,460 L116,455" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            <path d="M180,410 L190,415 L192,440 L188,460 L184,455" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />

            {/* Feet / Boots */}
            <path
              d="M112,485 L110,495 L108,505 L105,515 L100,520 L95,522 L93,520 L95,515 L100,510 L108,500 L110,490
                 M188,485 L190,495 L192,505 L195,515 L200,520 L205,522 L207,520 L205,515 L200,510 L192,500 L190,490"
              fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="1.2"
            />
            {/* Boot sole detail */}
            <path d="M95,518 L105,518 M205,518 L195,518" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.5" />

            {/* Scanning line */}
            <line
              x1="40" y1={scanProgress * 5.5} x2="260" y2={scanProgress * 5.5}
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
                x="40" y={Math.max(0, scanProgress * 5.5 - 30)} width="220" height="30"
                fill="url(#scanGlow)"
                opacity="0.3"
              />
            )}

            {/* Highlight points */}
            {scanPhase === "complete" && (
              <>
                {[
                  { cx: 150, cy: 50, label: "HELMET" },
                  { cx: 150, cy: 160, label: "ARC REACTOR" },
                  { cx: 62, cy: 190, label: "R.ARM" },
                  { cx: 238, cy: 190, label: "L.ARM" },
                  { cx: 150, cy: 240, label: "CORE" },
                  { cx: 48, cy: 318, label: "R.REPULSOR" },
                  { cx: 252, cy: 318, label: "L.REPULSOR" },
                  { cx: 125, cy: 390, label: "R.LEG" },
                  { cx: 175, cy: 390, label: "L.LEG" },
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
