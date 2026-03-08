import { useEffect, useState } from "react";
import ArcReactor from "./ArcReactor";
import starkLogo from "@/assets/stark-logo.png";
import type { ResizablePanel } from "@/hooks/useGestureResize";

interface HudSidePanelsProps {
  scales?: {
    chatScale: number;
    weatherScale: number;
    radarScale: number;
    powerScale: number;
    storageScale: number;
  };
  activePanel?: ResizablePanel | null;
  isResizing?: boolean;
}

const HudSidePanels = ({ scales, activePanel, isResizing }: HudSidePanelsProps) => {
  const [time, setTime] = useState(new Date());
  const [powerLevel, setPowerLevel] = useState(97);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [memUsage, setMemUsage] = useState(67);
  const [temp] = useState(Math.floor(18 + Math.random() * 10));
  const [diskTotal] = useState(500);
  const [diskFree] = useState(Math.floor(150 + Math.random() * 100));
  const [uptimeHours] = useState(Math.floor(Math.random() * 200));
  const [uptimeMins] = useState(Math.floor(Math.random() * 60));

  const s = scales || { chatScale: 1, weatherScale: 1, radarScale: 1, powerScale: 1, storageScale: 1 };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      setPowerLevel(95 + Math.floor(Math.random() * 5));
      setCpuUsage(35 + Math.floor(Math.random() * 30));
      setMemUsage(55 + Math.floor(Math.random() * 25));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const day = time.getDate().toString().padStart(2, "0");
  const weekday = time.toLocaleDateString("en-US", { weekday: "short" });
  const month = time.toLocaleDateString("en-US", { month: "long" });

  const panelHighlight = (panel: ResizablePanel) =>
    activePanel === panel ? "ring-1 ring-primary/50 rounded-sm bg-primary/5" : "";

  const scaleStyle = (scale: number) => ({
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    transition: isResizing ? "none" : "transform 0.3s ease-out",
  });

  return (
    <>
      {/* ===== TOP BAR: Logo + Date + Time ===== */}
      <div className="fixed left-4 top-3 z-10 pointer-events-none animate-fade-in-up flex items-center gap-4">
        <img src={starkLogo} alt="Stark Industries" className="h-7 w-auto opacity-70 invert" />
        <div className="flex items-baseline gap-1.5">
          <span className="font-orbitron text-2xl text-primary/90 leading-none">{day}</span>
          <div className="flex flex-col">
            <span className="font-mono text-[8px] text-primary/60 tracking-widest leading-tight">{month}</span>
            <span className="font-mono text-[7px] text-muted-foreground leading-tight">{weekday}</span>
          </div>
        </div>
        <div className="font-orbitron text-sm text-primary/80 tracking-wider">{formatTime(time)}</div>
      </div>

      {/* ===== LEFT SIDE ===== */}

      {/* JARVIS Arc Reactor */}
      <div className="fixed left-2 top-12 z-10 pointer-events-none animate-fade-in-up">
        <ArcReactor size={110} isActive />
      </div>

      {/* Storage / Capacity */}
      <div className={`fixed left-5 top-[170px] z-10 pointer-events-none animate-fade-in-up w-40 p-1 ${panelHighlight("storage")}`} style={scaleStyle(s.storageScale)}>
        <div className="font-mono text-[7px] text-primary/50 tracking-widest mb-1">PRIMARY STORAGE</div>
        <div className="flex items-center gap-2">
          <div className="font-mono text-[8px] text-muted-foreground">Full Capacity:</div>
          <div className="font-orbitron text-[9px] text-primary">{diskTotal} G</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="font-mono text-[8px] text-muted-foreground">Free Capacity:</div>
          <div className="font-orbitron text-[9px] text-primary">{diskFree} G</div>
        </div>
        <div className="h-[3px] bg-border/20 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-primary/50 rounded-full transition-all" style={{ width: `${((diskTotal - diskFree) / diskTotal) * 100}%` }} />
        </div>
      </div>

      {/* Power circular gauge */}
      <div className={`fixed left-5 top-[255px] z-10 pointer-events-none animate-fade-in-up flex items-center gap-3 p-1 ${panelHighlight("power")}`} style={scaleStyle(s.powerScale)}>
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(195 100% 50% / 0.1)" strokeWidth="2.5" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(195 100% 50% / 0.6)" strokeWidth="2.5"
              strokeDasharray={`${powerLevel * 0.942} 94.2`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-[6px] text-primary/50">Power</span>
            <span className="font-orbitron text-[10px] text-primary">{powerLevel}%</span>
            <span className="font-mono text-[5px] text-muted-foreground">High</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[7px] text-muted-foreground w-7">CPU</span>
            <div className="w-16 h-[3px] bg-border/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary/50 rounded-full transition-all duration-1000" style={{ width: `${cpuUsage}%` }} />
            </div>
            <span className="font-mono text-[7px] text-primary w-7 text-right">{cpuUsage}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[7px] text-muted-foreground w-7">MEM</span>
            <div className="w-16 h-[3px] bg-border/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary/50 rounded-full transition-all duration-1000" style={{ width: `${memUsage}%` }} />
            </div>
            <span className="font-mono text-[7px] text-primary w-7 text-right">{memUsage}%</span>
          </div>
        </div>
      </div>

      {/* Radar */}
      <div className={`fixed left-5 top-[350px] z-10 pointer-events-none animate-fade-in-up p-1 ${panelHighlight("radar")}`} style={scaleStyle(s.radarScale)}>
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(195 100% 50% / 0.12)" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="hsl(195 100% 50% / 0.08)" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="hsl(195 100% 50% / 0.08)" strokeWidth="0.5" />
            <line x1="50" y1="5" x2="50" y2="95" stroke="hsl(195 100% 50% / 0.06)" strokeWidth="0.5" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="hsl(195 100% 50% / 0.06)" strokeWidth="0.5" />
            <line x1="50" y1="50" x2="50" y2="5" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1" className="origin-center animate-rotate-slow" />
            <circle cx="62" cy="35" r="2" fill="hsl(195 100% 50% / 0.8)" className="animate-pulse-glow" />
            <circle cx="38" cy="58" r="1.5" fill="hsl(195 100% 50% / 0.4)" className="animate-pulse-glow" />
          </svg>
        </div>
      </div>

      {/* Weather */}
      <div className={`fixed left-5 top-[460px] z-10 pointer-events-none animate-fade-in-up p-1 ${panelHighlight("weather")}`} style={scaleStyle(s.weatherScale)}>
        <div className="font-mono text-[7px] text-primary/50 tracking-widest mb-0.5">WEATHER</div>
        <div className="font-orbitron text-lg text-primary leading-none">{temp}°C</div>
        <div className="font-mono text-[7px] text-muted-foreground mt-0.5">PARTLY CLOUDY</div>
        <div className="font-mono text-[7px] text-muted-foreground">WIND: 12 KM/H · HUM: 65%</div>
      </div>

      {/* Uptime */}
      <div className="fixed left-5 top-[540px] z-10 pointer-events-none animate-fade-in-up">
        <div className="font-mono text-[7px] text-primary/50 tracking-widest mb-0.5">UPTIME</div>
        <div className="font-mono text-[9px] text-primary">{uptimeHours}h {uptimeMins}m</div>
      </div>

      {/* Communication */}
      <div className="fixed left-5 top-[580px] z-10 pointer-events-none animate-fade-in-up">
        <div className="font-mono text-[7px] text-primary/50 tracking-widest mb-0.5">COMMUNICATION</div>
        <div className="flex flex-col gap-0.5">
          {["S.H.I.E.L.D. NET", "STARK SAT-7", "LOCAL MESH"].map((ch, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-primary/60 animate-pulse-glow" style={{ animationDelay: `${i * 0.3}s` }} />
              <span className="font-mono text-[7px] text-muted-foreground">{ch}</span>
              <span className="font-mono text-[6px] text-primary/50 ml-auto">ACTIVE</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom left: System status */}
      <div className="fixed left-5 bottom-12 z-10 pointer-events-none animate-fade-in-up w-40">
        {[
          { label: "ARC REACTOR", value: "ONLINE" },
          { label: "REPULSOR", value: "STANDBY" },
          { label: "FLIGHT SYS", value: "READY" },
          { label: "COMMS", value: "ENCRYPTED" },
          { label: "WEAPONS", value: "LOCKED" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1 h-1 rounded-full bg-primary/60 animate-pulse-glow" style={{ animationDelay: `${i * 0.3}s` }} />
            <span className="font-mono text-[6px] text-muted-foreground">{item.label}:</span>
            <span className="font-mono text-[6px] text-primary/70">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="fixed left-5 bottom-4 z-10 pointer-events-none">
        <div className="font-mono text-[6px] text-muted-foreground/30 tracking-widest">STARK INDUSTRIES · J.A.R.V.I.S v3.2.1</div>
      </div>

      {/* ===== CENTER ===== */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse-glow" />
            <span className="font-mono text-[7px] text-primary/60">SYSTEM ONLINE</span>
          </div>
          <span className="font-mono text-[6px] text-muted-foreground/30">|</span>
          <span className="font-mono text-[7px] text-muted-foreground/50">ALL NOMINAL</span>
          <span className="font-mono text-[6px] text-muted-foreground/30">|</span>
          <span className="font-mono text-[7px] text-muted-foreground/50">AC LINE: {powerLevel}%</span>
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[6px] text-muted-foreground/30">ENCRYPTED CHANNEL · SECURE</span>
        </div>
      </div>

      {/* ===== RIGHT data widgets ===== */}
      <div className="fixed right-[340px] top-4 z-10 pointer-events-none animate-fade-in-up">
        <div className="flex gap-2">
          {[
            { label: "ARC", value: 97 },
            { label: "SYS", value: 82 },
            { label: "NET", value: 91 },
          ].map((ring) => (
            <div key={ring.label} className="relative w-10 h-10">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(195 100% 50% / 0.08)" strokeWidth="2" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="2"
                  strokeDasharray={`${ring.value * 0.88} 88`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-[5px] text-primary/50">{ring.label}</span>
                <span className="font-orbitron text-[7px] text-primary/80">{ring.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed right-[340px] top-16 z-10 pointer-events-none animate-fade-in-up">
        <div className="space-y-0.5">
          {["REPULSOR: STANDBY", "UNIBEAM: CHARGED", "FLIGHT: READY"].map((line, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-0.5 h-0.5 rounded-full bg-primary/50" />
              <span className="font-mono text-[6px] text-muted-foreground/60">{line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Gesture resize indicator ===== */}
      {activePanel && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fade-in">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-primary/30">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[9px] text-primary tracking-wider">
              RESIZE: {activePanel.toUpperCase()} · {Math.round((s[`${activePanel}Scale` as keyof typeof s] as number) * 100)}%
            </span>
            <span className="font-mono text-[7px] text-muted-foreground ml-1">
              👆POINT · 🖐️PALM↕ · 👍+/👊-
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default HudSidePanels;
