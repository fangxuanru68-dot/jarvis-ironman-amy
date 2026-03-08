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
      className="fixed top-0 right-0 bottom-0 z-30 flex flex-col overflow-hidden animate-slide-in-right pointer-events-auto"
      style={{
        width: "380px",
        background: "transparent",
      }}
    >
      {/* Semi-transparent header area */}
      <div
        style={{
          background: "linear-gradient(180deg, hsl(220 30% 4% / 0.85) 0%, transparent 100%)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <div className="font-orbitron text-[10px] tracking-[0.3em] text-primary/60">ARMOR DIAGNOSTIC</div>
            <div className="font-mono text-[7px] text-muted-foreground tracking-wider mt-0.5">
              {scanPhase === "scanning" ? "SCANNING MARK II..." : scanPhase === "analyzing" ? "ANALYZING SYSTEMS..." : "DIAGNOSTIC COMPLETE"}
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
      </div>

      {/* Body scan visualization - transparent background */}
      <div className="flex-1 flex items-center justify-center relative px-2">
        <div className="relative w-full h-full max-h-[480px] flex items-center justify-center">
          <svg viewBox="0 0 400 750" className="h-full max-h-[460px] w-auto" style={{ filter: "drop-shadow(0 0 20px hsl(195 100% 50% / 0.25))" }}>

            {/* ===== IRON MAN MARK II ARMOR ===== */}
            
            {/* --- HELMET --- */}
            {/* Main helmet shell - wider at cheeks, tapered top */}
            <path
              d="M200,22 
                 C212,22 224,26 233,34 L240,44 L244,58 L245,72 L243,85 
                 L240,92 L236,98 L230,103 L224,106 L218,108 L210,110 L200,111 
                 L190,110 L182,108 L176,106 L170,103 L164,98 L160,92 L157,85 
                 L155,72 L156,58 L160,44 L167,34 C176,26 188,22 200,22 Z"
              fill="none" stroke="hsl(195 100% 50% / 0.55)" strokeWidth="1.8"
            />
            {/* Helmet center ridge */}
            <path d="M200,22 L200,70" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.8" />
            {/* Forehead plate */}
            <path d="M175,35 L185,30 L200,28 L215,30 L225,35 L220,42 L200,40 L180,42 Z" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            {/* Face plate outline */}
            <path
              d="M172,52 L178,44 L190,40 L200,38 L210,40 L222,44 L228,52 
                 L228,68 L225,78 L220,86 L212,92 L200,95 L188,92 L180,86 
                 L175,78 L172,68 Z"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1"
            />
            {/* Eyes - angular slits like Mark II */}
            <path d="M178,58 L185,54 L196,55 L196,61 L186,63 Z" fill="hsl(195 100% 50% / 0.12)" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="0.8" />
            <path d="M222,58 L215,54 L204,55 L204,61 L214,63 Z" fill="hsl(195 100% 50% / 0.12)" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="0.8" />
            {/* Mouth area - horizontal slats */}
            <path d="M185,78 L190,80 L200,81 L210,80 L215,78" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.6" />
            <path d="M187,82 L193,84 L200,85 L207,84 L213,82" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.5" />
            <path d="M189,86 L195,87 L200,88 L205,87 L211,86" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
            {/* Jaw lines */}
            <path d="M172,68 L168,72 L165,80 L164,88 L166,95 L170,100" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            <path d="M228,68 L232,72 L235,80 L236,88 L234,95 L230,100" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            {/* Ear / side vents */}
            <path d="M155,62 L150,58 L148,65 L150,75 L155,78" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            <path d="M245,62 L250,58 L252,65 L250,75 L245,78" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />

            {/* --- NECK --- */}
            <path d="M182,111 L178,118 L175,128 L175,138 L225,138 L225,128 L222,118 L218,111" fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="1.2" />
            {/* Neck segments */}
            <path d="M180,116 L220,116 M178,122 L222,122 M176,128 L224,128 M175,134 L225,134" fill="none" stroke="hsl(195 100% 50% / 0.12)" strokeWidth="0.5" />

            {/* --- SHOULDERS --- */}
            {/* Left shoulder */}
            <path
              d="M175,138 L160,140 L140,146 L118,156 L105,168 L95,182 L90,195"
              fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.8"
            />
            {/* Right shoulder */}
            <path
              d="M225,138 L240,140 L260,146 L282,156 L295,168 L305,182 L310,195"
              fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.8"
            />
            {/* Shoulder armor plates - layered like the reference */}
            <path d="M140,146 L130,140 L115,148 L108,162 L105,175 L110,178 L120,170 L130,158 Z" fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1" />
            <path d="M118,156 L108,152 L96,160 L92,178 L95,185 L102,180 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.8" />
            <path d="M260,146 L270,140 L285,148 L292,162 L295,175 L290,178 L280,170 L270,158 Z" fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1" />
            <path d="M282,156 L292,152 L304,160 L308,178 L305,185 L298,180 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.8" />

            {/* --- CHEST / TORSO --- */}
            <path
              d="M175,138 L168,150 L158,175 L152,200 L150,220 L152,245 L158,265 L168,278 L185,288 L200,292 L215,288 L232,278 L242,265 L248,245 L250,220 L248,200 L242,175 L232,150 L225,138"
              fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.8"
            />
            {/* Upper chest plates - pectoral shapes */}
            <path d="M175,148 L170,160 L168,175 L175,180 L190,178 L198,172 L198,160 L190,150 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.8" />
            <path d="M225,148 L230,160 L232,175 L225,180 L210,178 L202,172 L202,160 L210,150 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.8" />
            {/* Chest plate center line */}
            <path d="M200,138 L200,292" fill="none" stroke="hsl(195 100% 50% / 0.08)" strokeWidth="0.5" />

            {/* Arc Reactor - center chest */}
            <circle cx="200" cy="198" r="22" fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.5" />
            <circle cx="200" cy="198" r="16" fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1" />
            <circle cx="200" cy="198" r="10" fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="0.8" />
            <circle cx="200" cy="198" r="5" fill="hsl(195 100% 50% / 0.2)" stroke="hsl(195 100% 50% / 0.7)" strokeWidth="0.8">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Arc reactor spokes */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line key={`spoke${i}`}
                  x1={200 + Math.cos(rad) * 10} y1={198 + Math.sin(rad) * 10}
                  x2={200 + Math.cos(rad) * 16} y2={198 + Math.sin(rad) * 16}
                  stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.6"
                />
              );
            })}

            {/* Lower chest / rib area plates */}
            <path d="M160,210 L170,215 L185,218 M240,210 L230,215 L215,218" fill="none" stroke="hsl(195 100% 50% / 0.18)" strokeWidth="0.6" />
            <path d="M155,230 L168,235 L185,238 M245,230 L232,235 L215,238" fill="none" stroke="hsl(195 100% 50% / 0.18)" strokeWidth="0.6" />

            {/* --- UPPER ARMS (Bicep armor) --- */}
            {/* Left upper arm */}
            <path
              d="M90,195 L85,210 L80,230 L78,250 L78,268 L80,280 L82,288"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.5"
            />
            {/* Left bicep inner */}
            <path
              d="M105,190 L100,205 L96,225 L94,245 L94,265 L95,280 L96,288"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1"
            />
            {/* Left bicep armor plate */}
            <path d="M88,208 L76,212 L74,232 L78,248 L86,244 L90,228 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.8" />
            
            {/* Right upper arm */}
            <path
              d="M310,195 L315,210 L320,230 L322,250 L322,268 L320,280 L318,288"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.5"
            />
            <path
              d="M295,190 L300,205 L304,225 L306,245 L306,265 L305,280 L304,288"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1"
            />
            <path d="M312,208 L324,212 L326,232 L322,248 L314,244 L310,228 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.8" />

            {/* --- ELBOW JOINTS --- */}
            <path d="M78,282 L75,290 L75,300 L78,306 L96,306 L96,300 L94,290 L90,282" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            <path d="M322,282 L325,290 L325,300 L322,306 L304,306 L304,300 L306,290 L310,282" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            {/* Joint circles */}
            <circle cx="87" cy="294" r="5" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.6" />
            <circle cx="313" cy="294" r="5" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.6" />

            {/* --- FOREARMS --- */}
            <path
              d="M78,306 L74,325 L70,348 L66,370 L64,388 L62,400"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.5"
            />
            <path
              d="M96,306 L92,325 L88,348 L85,370 L83,388 L82,400"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1"
            />
            {/* Left forearm armor plates */}
            <path d="M76,318 L64,322 L60,345 L64,365 L72,362 L78,340 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.8" />
            
            <path
              d="M322,306 L326,325 L330,348 L334,370 L336,388 L338,400"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.5"
            />
            <path
              d="M304,306 L308,325 L312,348 L315,370 L317,388 L318,400"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1"
            />
            <path d="M324,318 L336,322 L340,345 L336,365 L328,362 L322,340 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.8" />

            {/* --- HANDS / GAUNTLETS --- */}
            {/* Left hand - fingers slightly spread, fist-like */}
            <path
              d="M62,400 L60,408 L58,415 L55,420 L52,418 L54,412 L57,405
                 M60,408 L57,418 L54,424 L51,422
                 M60,408 L58,420 L56,426 L53,425
                 M62,400 L62,412 L61,420 L60,426 L57,425
                 M82,400 L80,408 L78,415 L76,420 L78,422 L80,418"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="0.8"
            />
            {/* Left repulsor */}
            <circle cx="70" cy="408" r="6" fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="0.8">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>
            
            {/* Right hand */}
            <path
              d="M338,400 L340,408 L342,415 L345,420 L348,418 L346,412 L343,405
                 M340,408 L343,418 L346,424 L349,422
                 M340,408 L342,420 L344,426 L347,425
                 M338,400 L338,412 L339,420 L340,426 L343,425
                 M318,400 L320,408 L322,415 L324,420 L322,422 L320,418"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="0.8"
            />
            <circle cx="330" cy="408" r="6" fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="0.8">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>

            {/* --- WAIST / ABDOMEN --- */}
            <path
              d="M168,278 L162,295 L158,310 L158,325 L162,335 L175,340 L200,344 L225,340 L238,335 L242,325 L242,310 L238,295 L232,278"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.5"
            />
            {/* Ab segment lines */}
            <path d="M185,280 L185,335 M215,280 L215,335" fill="none" stroke="hsl(195 100% 50% / 0.12)" strokeWidth="0.5" />
            <path d="M172,295 L228,295 M170,310 L230,310 M168,325 L232,325" fill="none" stroke="hsl(195 100% 50% / 0.1)" strokeWidth="0.5" />

            {/* --- HIP / CODPIECE --- */}
            <path
              d="M175,340 L165,352 L158,368 L160,382 L172,390 L200,396 L228,390 L240,382 L242,368 L235,352 L225,340"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.5"
            />
            {/* Codpiece center */}
            <path d="M192,365 L200,395 L208,365" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.6" />
            {/* Hip joint circles */}
            <circle cx="168" cy="375" r="6" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.6" />
            <circle cx="232" cy="375" r="6" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.6" />

            {/* --- THIGHS --- */}
            {/* Left thigh outer */}
            <path
              d="M172,390 L165,410 L158,435 L153,462 L150,485 L150,500"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.5"
            />
            {/* Left thigh inner */}
            <path
              d="M192,394 L188,410 L183,435 L180,462 L178,485 L178,500"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1"
            />
            {/* Left thigh armor plate */}
            <path d="M166,405 L152,410 L148,438 L152,465 L160,460 L164,435 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.8" />
            
            {/* Right thigh */}
            <path
              d="M228,390 L235,410 L242,435 L247,462 L250,485 L250,500"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.5"
            />
            <path
              d="M208,394 L212,410 L217,435 L220,462 L222,485 L222,500"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1"
            />
            <path d="M234,405 L248,410 L252,438 L248,465 L240,460 L236,435 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.8" />

            {/* --- KNEES --- */}
            <path d="M148,495 L145,505 L145,518 L148,525 L178,525 L180,518 L180,505 L178,495" fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1" />
            <path d="M155,500 L155,520 M170,500 L170,520" fill="none" stroke="hsl(195 100% 50% / 0.12)" strokeWidth="0.5" />
            {/* Knee cap */}
            <path d="M155,502 L160,498 L168,498 L172,502 L172,515 L168,520 L160,520 L155,515 Z" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.7" />
            
            <path d="M222,495 L220,505 L220,518 L222,525 L252,525 L255,518 L255,505 L252,495" fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1" />
            <path d="M230,500 L230,520 M245,500 L245,520" fill="none" stroke="hsl(195 100% 50% / 0.12)" strokeWidth="0.5" />
            <path d="M228,502 L233,498 L242,498 L247,502 L247,515 L242,520 L233,520 L228,515 Z" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.7" />

            {/* --- SHINS / CALVES --- */}
            <path
              d="M148,525 L145,545 L142,570 L140,595 L138,615 L137,630"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.5"
            />
            <path
              d="M178,525 L176,545 L174,570 L172,595 L171,615 L170,630"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1"
            />
            {/* Left shin plate */}
            <path d="M146,538 L134,542 L130,570 L134,600 L142,596 L148,568 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.8" />
            {/* Left calf plate */}
            <path d="M174,540 L180,544 L182,568 L180,595 L174,592 Z" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.6" />
            
            <path
              d="M252,525 L255,545 L258,570 L260,595 L262,615 L263,630"
              fill="none" stroke="hsl(195 100% 50% / 0.45)" strokeWidth="1.5"
            />
            <path
              d="M222,525 L224,545 L226,570 L228,595 L229,615 L230,630"
              fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1"
            />
            <path d="M254,538 L266,542 L270,570 L266,600 L258,596 L252,568 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.8" />
            <path d="M226,540 L220,544 L218,568 L220,595 L226,592 Z" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.6" />

            {/* --- BOOTS --- */}
            {/* Left boot */}
            <path
              d="M137,630 L135,642 L133,655 L130,665 L125,672 L118,678 L112,680 L110,678 
                 L112,674 L118,668 L125,660 L130,650 L133,640
                 M170,630 L168,642 L166,655 L165,665 L164,672 L163,676 L162,678"
              fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="1.3"
            />
            {/* Boot ankle armor */}
            <path d="M136,632 L130,635 L128,648 L132,658 L138,655 L140,642 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            {/* Boot sole */}
            <path d="M112,678 L125,680 L140,678 L155,676 L162,678 L162,682 L155,684 L130,684 L112,682 Z" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />
            
            {/* Right boot */}
            <path
              d="M263,630 L265,642 L267,655 L270,665 L275,672 L282,678 L288,680 L290,678 
                 L288,674 L282,668 L275,660 L270,650 L267,640
                 M230,630 L232,642 L234,655 L235,665 L236,672 L237,676 L238,678"
              fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="1.3"
            />
            <path d="M264,632 L270,635 L272,648 L268,658 L262,655 L260,642 Z" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.7" />
            <path d="M288,678 L275,680 L260,678 L245,676 L238,678 L238,682 L245,684 L270,684 L288,682 Z" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" />

            {/* ===== SCANNING LINE ===== */}
            <line
              x1="50" y1={scanProgress * 7} x2="350" y2={scanProgress * 7}
              stroke="hsl(195 100% 50% / 0.8)"
              strokeWidth="2"
              style={{
                filter: "drop-shadow(0 0 8px hsl(195 100% 50% / 0.8))",
                opacity: scanPhase === "scanning" ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            />
            {scanPhase === "scanning" && (
              <rect
                x="50" y={Math.max(0, scanProgress * 7 - 40)} width="300" height="40"
                fill="url(#scanGlow)" opacity="0.25"
              />
            )}

            {/* ===== HIGHLIGHT POINTS ===== */}
            {scanPhase === "complete" && (
              <>
                {[
                  { cx: 200, cy: 55, label: "HELMET" },
                  { cx: 200, cy: 198, label: "ARC REACTOR" },
                  { cx: 87, cy: 240, label: "R.ARM" },
                  { cx: 313, cy: 240, label: "L.ARM" },
                  { cx: 200, cy: 310, label: "CORE" },
                  { cx: 70, cy: 408, label: "R.REPULSOR" },
                  { cx: 330, cy: 408, label: "L.REPULSOR" },
                  { cx: 163, cy: 500, label: "R.LEG" },
                  { cx: 237, cy: 500, label: "L.LEG" },
                ].map((pt, i) => (
                  <g key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                    <circle cx={pt.cx} cy={pt.cy} r="5" fill="none" stroke="hsl(195 100% 50% / 0.6)" strokeWidth="1">
                      <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={pt.cx} cy={pt.cy} r="2" fill="hsl(195 100% 50% / 0.8)" />
                    <text x={pt.cx + 10} y={pt.cy + 4} fill="hsl(195 100% 50% / 0.5)" fontSize="7" fontFamily="monospace">{pt.label}</text>
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
        </div>
      </div>

      {/* Vitals readout - semi-transparent bottom */}
      <div
        className="px-4 pb-4 pt-2"
        style={{
          background: "linear-gradient(0deg, hsl(220 30% 4% / 0.9) 0%, hsl(220 30% 4% / 0.7) 70%, transparent 100%)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="font-orbitron text-[8px] tracking-[0.2em] text-primary/50 mb-2">ARMOR STATUS</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "POWER", value: `${vitals.oxygenSat}`, unit: "%", color: "hsl(195 100% 50%)" },
            { label: "INTEGRITY", value: `${vitals.hydration}`, unit: "%", color: "hsl(195 80% 60%)" },
            { label: "REACTOR", value: `${vitals.bodyTemp}`, unit: "GW", color: "hsl(195 100% 70%)" },
            { label: "THRUST", value: `${vitals.heartRate}`, unit: "%", color: "hsl(200 90% 55%)" },
            { label: "WEAPONS", value: vitals.bloodPressure, unit: "RDY", color: "hsl(195 100% 50%)" },
            { label: "SHIELDS", value: `${vitals.stress}`, unit: "LVL", color: "hsl(210 80% 60%)" },
          ].map((v, i) => (
            <div key={i} className="bg-card/20 border border-primary/10 rounded-sm p-2">
              <div className="font-mono text-[6px] text-muted-foreground tracking-wider">{v.label}</div>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="font-orbitron text-sm" style={{ color: v.color }}>{v.value}</span>
                <span className="font-mono text-[6px] text-muted-foreground">{v.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {scanPhase === "complete" && (
          <div className="mt-3 p-2 bg-primary/5 border border-primary/20 rounded-sm animate-fade-in">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[8px] text-primary tracking-wider">ALL SYSTEMS NOMINAL</span>
            </div>
            <div className="font-mono text-[7px] text-muted-foreground mt-1">
              Mark II armor integrity at optimal levels. All subsystems online.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyScanPanel;
