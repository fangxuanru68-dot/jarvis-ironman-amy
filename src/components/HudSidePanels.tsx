import { useEffect, useState } from "react";
import ArcReactor from "./ArcReactor";
import BottomLeftHudRadar from "./BottomLeftHudRadar";
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
      <div className={`fixed left-5 top-[155px] z-10 pointer-events-none animate-fade-in-up w-40 p-1 ${panelHighlight("storage")}`} style={scaleStyle(s.storageScale)}>
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
      <div className={`fixed left-5 top-[230px] z-10 pointer-events-none animate-fade-in-up flex items-center gap-3 p-1 ${panelHighlight("power")}`} style={scaleStyle(s.powerScale)}>
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

      {/* Weather */}
      <div className={`fixed left-5 top-[315px] z-10 pointer-events-none animate-fade-in-up p-1 ${panelHighlight("weather")}`} style={scaleStyle(s.weatherScale)}>
        <div className="font-mono text-[7px] text-primary/50 tracking-widest mb-0.5">WEATHER</div>
        <div className="font-orbitron text-lg text-primary leading-none">{temp}°C</div>
        <div className="font-mono text-[7px] text-muted-foreground mt-0.5">PARTLY CLOUDY</div>
        <div className="font-mono text-[7px] text-muted-foreground">WIND: 12 KM/H · HUM: 65%</div>
      </div>

      {/* Uptime */}
      <div className="fixed left-5 top-[385px] z-10 pointer-events-none animate-fade-in-up">
        <div className="font-mono text-[7px] text-primary/50 tracking-widest mb-0.5">UPTIME</div>
        <div className="font-mono text-[9px] text-primary">{uptimeHours}h {uptimeMins}m</div>
      </div>

      {/* Communication */}
      <div className="fixed left-5 top-[415px] z-10 pointer-events-none animate-fade-in-up">
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

      {/* System status */}
      <div className="fixed left-5 top-[480px] z-10 pointer-events-none animate-fade-in-up w-40">
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

      {/* Radar - bottom left, cinematic style */}
      <div className={`fixed left-3 bottom-14 z-10 pointer-events-none animate-fade-in-up p-1 ${panelHighlight("radar")}`} style={scaleStyle(s.radarScale)}>
        <div className="relative w-28 h-28">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full" style={{
            background: "radial-gradient(circle, hsl(195 100% 50% / 0.08) 0%, transparent 70%)",
          }} />
          <svg viewBox="0 0 120 120" className="w-full h-full">
            {/* Background fill */}
            <circle cx="60" cy="60" r="55" fill="hsl(195 100% 10% / 0.3)" />
            {/* Concentric rings */}
            <circle cx="60" cy="60" r="55" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="1.5" />
            <circle cx="60" cy="60" r="44" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.8" />
            <circle cx="60" cy="60" r="33" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.8" />
            <circle cx="60" cy="60" r="22" fill="none" stroke="hsl(195 100% 50% / 0.12)" strokeWidth="0.5" />
            <circle cx="60" cy="60" r="11" fill="none" stroke="hsl(195 100% 50% / 0.1)" strokeWidth="0.5" />
            {/* Cross lines */}
            <line x1="60" y1="5" x2="60" y2="115" stroke="hsl(195 100% 50% / 0.08)" strokeWidth="0.5" />
            <line x1="5" y1="60" x2="115" y2="60" stroke="hsl(195 100% 50% / 0.08)" strokeWidth="0.5" />
            <line x1="21" y1="21" x2="99" y2="99" stroke="hsl(195 100% 50% / 0.05)" strokeWidth="0.5" />
            <line x1="99" y1="21" x2="21" y2="99" stroke="hsl(195 100% 50% / 0.05)" strokeWidth="0.5" />
            {/* Degree tick marks */}
            {Array.from({ length: 36 }).map((_, i) => {
              const a = (i * 10) * Math.PI / 180;
              const inner = i % 3 === 0 ? 50 : 53;
              return (
                <line key={i}
                  x1={60 + Math.cos(a) * inner} y1={60 + Math.sin(a) * inner}
                  x2={60 + Math.cos(a) * 55} y2={60 + Math.sin(a) * 55}
                  stroke={`hsl(195 100% 50% / ${i % 3 === 0 ? 0.4 : 0.15})`}
                  strokeWidth={i % 3 === 0 ? 1 : 0.5}
                />
              );
            })}
            {/* Sweep line with gradient */}
            <defs>
              <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(195 100% 50% / 0)" />
                <stop offset="100%" stopColor="hsl(195 100% 50% / 0.8)" />
              </linearGradient>
            </defs>
            <line x1="60" y1="60" x2="60" y2="5" stroke="url(#sweepGrad)" strokeWidth="2" className="origin-center animate-rotate-slow" />
            {/* Sweep cone / trail */}
            <path d={`M 60 60 L 60 5 A 55 55 0 0 0 ${60 - 55 * Math.sin(30 * Math.PI / 180)} ${60 - 55 * Math.cos(30 * Math.PI / 180)} Z`}
              fill="hsl(195 100% 50% / 0.06)" className="origin-center animate-rotate-slow" />
            {/* Blips */}
            <circle cx="72" cy="38" r="2.5" fill="hsl(195 100% 60% / 0.9)" className="animate-pulse-glow" />
            <circle cx="72" cy="38" r="5" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.5" className="animate-pulse-glow" />
            <circle cx="42" cy="70" r="2" fill="hsl(195 100% 50% / 0.6)" className="animate-pulse-glow" style={{ animationDelay: "0.5s" }} />
            <circle cx="42" cy="70" r="4" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.5" className="animate-pulse-glow" style={{ animationDelay: "0.5s" }} />
            <circle cx="80" cy="65" r="1.5" fill="hsl(195 100% 50% / 0.4)" className="animate-pulse-glow" style={{ animationDelay: "1s" }} />
            {/* Center dot */}
            <circle cx="60" cy="60" r="2" fill="hsl(195 100% 70% / 0.8)" />
            <circle cx="60" cy="60" r="4" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.5" />
          </svg>
          {/* Labels */}
          <div className="absolute -right-8 top-1 font-mono text-[5px] text-primary/40">N</div>
          <div className="absolute -right-8 bottom-1 font-mono text-[5px] text-primary/40">S</div>
        </div>
        <div className="font-mono text-[6px] text-primary/40 tracking-widest mt-0.5 text-center">PROXIMITY SCAN</div>
      </div>

      <div className="fixed left-5 bottom-2 z-10 pointer-events-none">
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
