import { useEffect, useState } from "react";
import ArcReactor from "./ArcReactor";
import starkLogo from "@/assets/stark-logo.png";

const HudSidePanels = () => {
  const [time, setTime] = useState(new Date());
  const [powerLevel, setPowerLevel] = useState(97);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [temp] = useState(Math.floor(18 + Math.random() * 10));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      setPowerLevel(95 + Math.floor(Math.random() * 5));
      setCpuUsage(35 + Math.floor(Math.random() * 30));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
  const day = time.getDate();
  const weekday = time.toLocaleDateString("en-US", { weekday: "long" });
  const monthYear = time.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <>
      {/* ===== LEFT SIDE - floating HUD elements ===== */}

      {/* Top-left: Stark Logo */}
      <div className="fixed left-4 top-4 z-10 pointer-events-none animate-fade-in-up">
        <img src={starkLogo} alt="Stark Industries" className="h-8 w-auto opacity-70 invert" />
      </div>

      {/* Left: Date block (large day number like movie) */}
      <div className="fixed left-5 top-16 z-10 pointer-events-none animate-fade-in-up">
        <div className="font-orbitron text-4xl text-primary/90 leading-none">{day}</div>
        <div className="font-mono text-[9px] text-primary/60 tracking-widest">{weekday}</div>
        <div className="font-mono text-[8px] text-muted-foreground">{monthYear}</div>
      </div>

      {/* Left: Time */}
      <div className="fixed left-5 top-[140px] z-10 pointer-events-none animate-fade-in-up">
        <div className="font-orbitron text-xl text-primary tracking-wider">{formatTime(time)}</div>
        <div className="font-mono text-[7px] text-muted-foreground tracking-widest mt-0.5">
          {time.toLocaleTimeString("en-US", { hour12: false, second: "2-digit" }).split(":")[2]}s
        </div>
      </div>

      {/* Left: JARVIS Arc Reactor */}
      <div className="fixed left-2 top-[200px] z-10 pointer-events-none animate-fade-in-up">
        <ArcReactor size={100} isActive />
      </div>

      {/* Left: CPU/System circular gauge */}
      <div className="fixed left-6 top-[330px] z-10 pointer-events-none animate-fade-in-up">
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(195 100% 50% / 0.1)" strokeWidth="2.5" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(195 100% 50% / 0.6)" strokeWidth="2.5"
              strokeDasharray={`${cpuUsage * 0.942} 94.2`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-[7px] text-primary/60">CPU</span>
            <span className="font-orbitron text-[10px] text-primary">{cpuUsage}%</span>
          </div>
        </div>
      </div>

      {/* Left: Power bar */}
      <div className="fixed left-5 top-[420px] z-10 pointer-events-none animate-fade-in-up w-32">
        <div className="font-mono text-[7px] text-primary/50 tracking-widest mb-1">POWER</div>
        <div className="flex items-end gap-[2px] h-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-1 rounded-sm transition-all duration-500"
              style={{
                height: `${Math.min(100, (powerLevel / 100) * (i + 1) * 10)}%`,
                background: "hsl(195 100% 50% / 0.5)",
                opacity: (i / 10) < (powerLevel / 100) ? 1 : 0.15,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="font-mono text-[7px] text-muted-foreground">0</span>
          <span className="font-orbitron text-[8px] text-primary">{powerLevel}%</span>
        </div>
      </div>

      {/* Left: Weather */}
      <div className="fixed left-5 top-[500px] z-10 pointer-events-none animate-fade-in-up">
        <div className="font-mono text-[7px] text-primary/50 tracking-widest mb-1">WEATHER</div>
        <div className="font-orbitron text-lg text-primary leading-none">{temp}°</div>
        <div className="font-mono text-[7px] text-muted-foreground mt-0.5">PARTLY CLOUDY</div>
        <div className="font-mono text-[7px] text-muted-foreground">WIND 12 KM/H</div>
      </div>

      {/* Left bottom: System stats */}
      <div className="fixed left-5 bottom-16 z-10 pointer-events-none animate-fade-in-up w-36">
        {[
          { label: "ARC REACTOR", value: "ONLINE" },
          { label: "COMMS", value: "ENCRYPTED" },
          { label: "FLIGHT SYS", value: "STANDBY" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 mb-1">
            <div className="w-1 h-1 rounded-full bg-primary/60 animate-pulse-glow" style={{ animationDelay: `${i * 0.4}s` }} />
            <span className="font-mono text-[7px] text-muted-foreground">{item.label}:</span>
            <span className="font-mono text-[7px] text-primary/80">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Left bottom: Uptime */}
      <div className="fixed left-5 bottom-4 z-10 pointer-events-none">
        <div className="font-mono text-[7px] text-muted-foreground/40 tracking-widest">STARK INDUSTRIES</div>
      </div>

      {/* ===== CENTER floating data (subtle, near face area) ===== */}

      {/* Top center: status bar */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse-glow" />
            <span className="font-mono text-[8px] text-primary/60">SYSTEM ONLINE</span>
          </div>
          <span className="font-mono text-[7px] text-muted-foreground/40">|</span>
          <span className="font-mono text-[8px] text-muted-foreground/50">ALL NOMINAL</span>
          <span className="font-mono text-[7px] text-muted-foreground/40">|</span>
          <span className="font-mono text-[8px] text-muted-foreground/50">AC LINE: {powerLevel}%</span>
        </div>
      </div>

      {/* Center-bottom floating data */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-fade-in-up">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[7px] text-muted-foreground/40">ENCRYPTED CHANNEL</span>
          <span className="font-mono text-[7px] text-muted-foreground/30">·</span>
          <span className="font-mono text-[7px] text-muted-foreground/40">SECURE</span>
        </div>
      </div>

      {/* ===== RIGHT SIDE floating data (above chat panel) ===== */}

      {/* Right: Circular gauges row */}
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

      {/* Right: Telemetry floating */}
      <div className="fixed right-[340px] top-16 z-10 pointer-events-none animate-fade-in-up">
        <div className="space-y-0.5">
          {[
            "REPULSOR: STANDBY",
            "UNIBEAM: CHARGED",
            "FLIGHT: READY",
          ].map((line, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-0.5 h-0.5 rounded-full bg-primary/50" />
              <span className="font-mono text-[6px] text-muted-foreground/60">{line}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HudSidePanels;
