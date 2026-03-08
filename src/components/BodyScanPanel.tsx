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
          <svg viewBox="0 0 400 750" className="h-full max-h-[420px] w-auto" style={{ filter: "drop-shadow(0 0 15px hsl(195 100% 50% / 0.3))" }}>
            {/* Grid lines */}
            {Array.from({ length: 38 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 20} x2="400" y2={i * 20} stroke="hsl(195 100% 50% / 0.04)" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="750" stroke="hsl(195 100% 50% / 0.04)" strokeWidth="0.5" />
            ))}

            {/* === HELMET === */}
            {/* Main helmet shape */}
            <path d="M200,22 C220,22 238,30 248,45 L253,58 L255,75 L253,90 L248,100 C244,106 238,112 232,116 L224,119 L200,122 L176,119 L168,116 C162,112 156,106 152,100 L147,90 L145,75 L147,58 L152,45 C162,30 180,22 200,22 Z"
              fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.5" />
            {/* Face plate */}
            <path d="M175,50 L178,44 L188,40 L200,38 L212,40 L222,44 L225,50 L226,62 L224,72 L220,80 L214,86 L200,90 L186,86 L180,80 L176,72 L174,62 Z"
              fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            {/* Eyes */}
            <path d="M180,56 L186,52 L196,53 L196,58 L186,59 Z" fill="hsl(195 100% 50% / 0.12)" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="0.7" />
            <path d="M220,56 L214,52 L204,53 L204,58 L214,59 Z" fill="hsl(195 100% 50% / 0.12)" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="0.7" />
            {/* Mouth slit */}
            <path d="M186,78 L192,81 L200,82 L208,81 L214,78" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.6" />
            {/* Helmet side vents */}
            <path d="M148,68 L142,62 L142,78 L148,85" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            <path d="M252,68 L258,62 L258,78 L252,85" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            {/* Helmet chin */}
            <path d="M185,90 L190,96 L200,98 L210,96 L215,90" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.6" />

            {/* === NECK === */}
            <path d="M180,122 L176,130 L174,140 L174,148 L226,148 L226,140 L224,130 L220,122" fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="1.2" />
            <path d="M178,128 L222,128 M176,135 L224,135 M175,142 L225,142" fill="none" stroke="hsl(195 100% 50% / 0.12)" strokeWidth="0.5" />

            {/* === SHOULDERS === */}
            {/* Left shoulder */}
            <path d="M174,148 L158,150 L135,156 L112,166 L95,178 L85,192" fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.5" />
            {/* Right shoulder */}
            <path d="M226,148 L242,150 L265,156 L288,166 L305,178 L315,192" fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.5" />
            {/* Shoulder armor plates */}
            <path d="M112,166 L100,160 L85,170 L80,185 L85,192 L98,184 Z" fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1" />
            <path d="M288,166 L300,160 L315,170 L320,185 L315,192 L302,184 Z" fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1" />
            {/* Shoulder cap details */}
            <path d="M105,170 L90,175 L85,185" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.6" />
            <path d="M295,170 L310,175 L315,185" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.6" />

            {/* === CHEST PLATE === */}
            <path d="M174,148 L168,162 L160,185 L156,210 L158,240 L165,260 L178,275 L200,282 L222,275 L235,260 L242,240 L244,210 L240,185 L232,162 L226,148"
              fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.5" />
            {/* Chest plate inner lines - pectoral plates */}
            <path d="M174,160 L180,175 L188,180 L200,178 L212,180 L220,175 L226,160" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            <path d="M170,190 L180,195 L190,192 M230,190 L220,195 L210,192" fill="none" stroke="hsl(195 100% 50% / 0.18)" strokeWidth="0.6" />
            {/* V-shape chest detail */}
            <path d="M178,158 L190,190 L200,195 L210,190 L222,158" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.7" />

            {/* Arc Reactor */}
            <circle cx="200" cy="205" r="22" fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.2" />
            <circle cx="200" cy="205" r="15" fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="0.8" />
            <circle cx="200" cy="205" r="8" fill="hsl(195 100% 50% / 0.15)" stroke="hsl(195 100% 50% / 0.6)" strokeWidth="0.8">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Reactor glow ring */}
            <circle cx="200" cy="205" r="26" fill="none" stroke="hsl(195 100% 50% / 0.1)" strokeWidth="2">
              <animate attributeName="r" values="26;28;26" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite" />
            </circle>

            {/* Lower chest / rib plates */}
            <path d="M162,225 L175,230 L188,228 M238,225 L225,230 L212,228" fill="none" stroke="hsl(195 100% 50% / 0.18)" strokeWidth="0.6" />
            <path d="M160,240 L175,245 L190,242 M240,240 L225,245 L210,242" fill="none" stroke="hsl(195 100% 50% / 0.18)" strokeWidth="0.6" />

            {/* === UPPER ARMS (Biceps) === */}
            <path d="M85,192 L78,210 L72,235 L68,260 L70,280 L74,295"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3" />
            <path d="M315,192 L322,210 L328,235 L332,260 L330,280 L326,295"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3" />
            {/* Bicep armor segments */}
            <path d="M82,200 L68,205 L64,225 L68,245 L76,240" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            <path d="M318,200 L332,205 L336,225 L332,245 L324,240" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            {/* Bicep inner plate */}
            <path d="M80,215 L72,218 L70,232 L74,242" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
            <path d="M320,215 L328,218 L330,232 L326,242" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />

            {/* === ELBOW JOINTS === */}
            <circle cx="74" cy="295" r="10" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            <circle cx="74" cy="295" r="5" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
            <circle cx="326" cy="295" r="10" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            <circle cx="326" cy="295" r="5" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />

            {/* === FOREARMS === */}
            <path d="M74,305 L70,325 L64,350 L58,375 L54,395 L52,405"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3" />
            <path d="M326,305 L330,325 L336,350 L342,375 L346,395 L348,405"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3" />
            {/* Forearm armor plates */}
            <path d="M72,315 L58,320 L54,345 L58,365 L66,360" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            <path d="M328,315 L342,320 L346,345 L342,365 L334,360" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            {/* Forearm inner detail */}
            <path d="M68,330 L60,334 L58,350 L62,362" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
            <path d="M332,330 L340,334 L342,350 L338,362" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />

            {/* === REPULSOR PALMS === */}
            <circle cx="50" cy="412" r="7" fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="0.8" />
            <circle cx="50" cy="412" r="3" fill="hsl(195 100% 50% / 0.15)" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="0.6">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="350" cy="412" r="7" fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="0.8" />
            <circle cx="350" cy="412" r="3" fill="hsl(195 100% 50% / 0.15)" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="0.6">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
            </circle>

            {/* === HANDS / FISTS === */}
            <path d="M52,405 L50,415 L46,422 L44,428 L46,430 L50,426 L52,420 L54,425 L52,430 L54,432 L56,428 L56,418 L58,424 L60,428 L58,430"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="0.8" />
            <path d="M348,405 L350,415 L354,422 L356,428 L354,430 L350,426 L348,420 L346,425 L348,430 L346,432 L344,428 L344,418 L342,424 L340,428 L342,430"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="0.8" />

            {/* === WAIST / ABS === */}
            <path d="M165,260 L158,278 L155,300 L158,320 L165,330 L200,338 L235,330 L242,320 L245,300 L242,278 L235,260"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3" />
            {/* Ab segment lines */}
            <path d="M188,270 L188,325 M212,270 L212,325" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
            <path d="M180,288 L220,288 M178,305 L222,305 M180,318 L220,318" fill="none" stroke="hsl(195 100% 50% / 0.12)" strokeWidth="0.5" />

            {/* === HIP / CODPIECE === */}
            <path d="M165,330 L155,345 L150,365 L155,380 L172,388 L200,392 L228,388 L245,380 L250,365 L245,345 L235,330"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3" />
            {/* Hip joint circles */}
            <circle cx="162" cy="370" r="8" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.6" />
            <circle cx="238" cy="370" r="8" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.6" />

            {/* === THIGHS === */}
            <path d="M172,388 L162,412 L154,445 L150,478 L152,500"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3" />
            <path d="M228,388 L238,412 L246,445 L250,478 L248,500"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3" />
            {/* Thigh armor plates */}
            <path d="M166,400 L148,408 L144,435 L150,458 L158,452" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            <path d="M234,400 L252,408 L256,435 L250,458 L242,452" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            {/* Inner thigh detail */}
            <path d="M160,420 L152,425 L150,445 L154,460" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
            <path d="M240,420 L248,425 L250,445 L246,460" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />

            {/* === KNEE JOINTS === */}
            <path d="M148,492 L144,500 L143,512 L146,520 L158,522 L162,514 L160,500 Z" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            <path d="M252,492 L256,500 L257,512 L254,520 L242,522 L238,514 L240,500 Z" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            {/* Knee cap circle */}
            <circle cx="153" cy="508" r="5" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.5" />
            <circle cx="247" cy="508" r="5" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.5" />

            {/* === SHINS === */}
            <path d="M152,522 L148,545 L144,575 L140,605 L138,625"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3" />
            <path d="M248,522 L252,545 L256,575 L260,605 L262,625"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.3" />
            {/* Shin armor plates */}
            <path d="M150,535 L136,542 L132,572 L138,598 L144,592" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            <path d="M250,535 L264,542 L268,572 L262,598 L256,592" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            {/* Calf detail */}
            <path d="M146,550 L138,555 L136,580 L140,598" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
            <path d="M254,550 L262,555 L264,580 L260,598" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />

            {/* === FEET / BOOTS === */}
            <path d="M138,625 L136,638 L134,650 L130,660 L124,668 L118,672 L115,670 L118,664 L124,655 L132,642 L134,632"
              fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="1.2" />
            <path d="M262,625 L264,638 L266,650 L270,660 L276,668 L282,672 L285,670 L282,664 L276,655 L268,642 L266,632"
              fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="1.2" />
            {/* Boot toe plate */}
            <path d="M118,668 L126,668 L132,665 M282,668 L274,668 L268,665" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.6" />
            {/* Boot sole */}
            <path d="M116,670 L128,670 M284,670 L272,670" fill="none" stroke="hsl(195 100% 50% / 0.18)" strokeWidth="0.5" />

            {/* === SCANNING LINE === */}
            <line
              x1="50" y1={scanProgress * 6.8} x2="350" y2={scanProgress * 6.8}
              stroke="hsl(195 100% 50% / 0.8)"
              strokeWidth="2"
              style={{
                filter: "drop-shadow(0 0 6px hsl(195 100% 50% / 0.8))",
                opacity: scanPhase === "scanning" ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            />
            {scanPhase === "scanning" && (
              <rect
                x="50" y={Math.max(0, scanProgress * 6.8 - 30)} width="300" height="30"
                fill="url(#scanGlow)"
                opacity="0.3"
              />
            )}

            {/* === HIGHLIGHT POINTS === */}
            {scanPhase === "complete" && (
              <>
                {[
                  { cx: 200, cy: 60, label: "HELMET" },
                  { cx: 200, cy: 205, label: "ARC REACTOR" },
                  { cx: 74, cy: 240, label: "R.ARM" },
                  { cx: 326, cy: 240, label: "L.ARM" },
                  { cx: 200, cy: 305, label: "CORE" },
                  { cx: 50, cy: 412, label: "R.REPULSOR" },
                  { cx: 350, cy: 412, label: "L.REPULSOR" },
                  { cx: 153, cy: 508, label: "R.LEG" },
                  { cx: 247, cy: 508, label: "L.LEG" },
                  { cx: 128, cy: 668, label: "R.BOOT" },
                  { cx: 272, cy: 668, label: "L.BOOT" },
                ].map((pt, i) => (
                  <g key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.12}s` }}>
                    <circle cx={pt.cx} cy={pt.cy} r="4" fill="none" stroke="hsl(195 100% 50% / 0.6)" strokeWidth="1">
                      <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={pt.cx} cy={pt.cy} r="1.5" fill="hsl(195 100% 50% / 0.8)" />
                    <text x={pt.cx + 10} y={pt.cy + 3} fill="hsl(195 100% 50% / 0.5)" fontSize="7" fontFamily="monospace">{pt.label}</text>
                  </g>
                ))}
              </>
            )}

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
