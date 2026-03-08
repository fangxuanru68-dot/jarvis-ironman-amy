import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ironmanMk2 from "@/assets/ironman-mk2-nobg.png";

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
          {/* Iron Man image */}
          <div className="relative h-full max-h-[440px]">
            <img
              src={ironmanMk2}
              alt="Iron Man Mark II"
              className="h-full max-h-[440px] w-auto object-contain"
              style={{
                filter: "drop-shadow(0 0 20px hsl(195 100% 50% / 0.3)) brightness(0.7) contrast(1.1)",
                mixBlendMode: "screen",
              }}
            />
            {/* Blue holographic tint overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(180deg, hsl(195 100% 50% / 0.08), hsl(195 100% 50% / 0.15))",
                mixBlendMode: "color",
              }}
            />
            {/* Scanning line */}
            {scanPhase === "scanning" && (
              <div
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  top: `${scanProgress}%`,
                  height: "2px",
                  background: "hsl(195 100% 50% / 0.8)",
                  boxShadow: "0 0 12px 3px hsl(195 100% 50% / 0.6), 0 0 30px 6px hsl(195 100% 50% / 0.3)",
                  transition: "top 50ms linear",
                }}
              />
            )}
            {/* Scan glow trail */}
            {scanPhase === "scanning" && (
              <div
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  top: `${Math.max(0, scanProgress - 8)}%`,
                  height: "8%",
                  background: "linear-gradient(180deg, transparent, hsl(195 100% 50% / 0.15))",
                }}
              />
            )}
            {/* Highlight points after scan */}
            {scanPhase === "complete" && (
              <>
                {[
                  { x: "50%", y: "6%", label: "HELMET" },
                  { x: "50%", y: "28%", label: "ARC REACTOR" },
                  { x: "18%", y: "35%", label: "R.ARM" },
                  { x: "82%", y: "35%", label: "L.ARM" },
                  { x: "50%", y: "42%", label: "CORE" },
                  { x: "14%", y: "56%", label: "R.REPULSOR" },
                  { x: "86%", y: "56%", label: "L.REPULSOR" },
                  { x: "38%", y: "70%", label: "R.LEG" },
                  { x: "62%", y: "70%", label: "L.LEG" },
                  { x: "35%", y: "92%", label: "R.BOOT" },
                  { x: "65%", y: "92%", label: "L.BOOT" },
                ].map((pt, i) => (
                  <div
                    key={i}
                    className="absolute animate-fade-in flex items-center gap-1"
                    style={{
                      left: pt.x,
                      top: pt.y,
                      transform: "translate(-50%, -50%)",
                      animationDelay: `${i * 0.12}s`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full border border-primary/60"
                      style={{
                        boxShadow: "0 0 6px hsl(195 100% 50% / 0.5)",
                        animation: "pulse 2s ease-in-out infinite",
                      }}
                    >
                      <div className="w-1 h-1 rounded-full bg-primary/80 m-auto mt-[2px]" />
                    </div>
                    <span className="font-mono text-[6px] text-primary/50 whitespace-nowrap">{pt.label}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Rotating rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="border border-primary/10 rounded-full"
              style={{ width: "280px", height: "280px", animation: "spin 8s linear infinite" }}
            />
            <div
              className="absolute border border-primary/5 rounded-full"
              style={{ width: "320px", height: "320px", animation: "spin 12s linear infinite reverse" }}
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
