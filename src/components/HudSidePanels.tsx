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
    d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <>
      {/* ===== LEFT PANEL ===== */}
      <div className="fixed left-3 top-0 bottom-0 z-10 pointer-events-none flex flex-col justify-between py-4 w-48 animate-fade-in-up">
        {/* Top: Logo + JARVIS title */}
        <div className="flex flex-col items-center gap-2">
          <img src={starkLogo} alt="Stark Industries" className="h-10 w-auto opacity-90 invert" />
          <ArcReactor size={80} isActive />
          <div className="text-center">
            <div className="font-orbitron text-[11px] tracking-[0.3em] text-primary">J.A.R.V.I.S</div>
            <div className="font-mono text-[7px] text-muted-foreground tracking-wider">ONLINE · v3.2.1</div>
          </div>
        </div>

        {/* Middle: Time + Weather + Radar */}
        <div className="flex flex-col gap-3">
          {/* Time & Date */}
          <div className="border border-border/20 bg-card/20 backdrop-blur-sm rounded-sm p-2 text-center">
            <div className="font-orbitron text-base text-primary tracking-wider">{formatTime(time)}</div>
            <div className="font-mono text-[8px] text-muted-foreground">
              {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>

          {/* Weather */}
          <div className="border border-border/20 bg-card/20 backdrop-blur-sm rounded-sm p-2">
            <div className="font-mono text-[8px] text-primary/60 tracking-widest mb-1">WEATHER</div>
            <div className="flex items-center gap-2">
              <div className="font-orbitron text-lg text-primary">{temp}°C</div>
              <div className="flex flex-col">
                <span className="font-mono text-[7px] text-muted-foreground">PARTLY CLOUDY</span>
                <span className="font-mono text-[7px] text-muted-foreground">WIND: 12 KM/H</span>
                <span className="font-mono text-[7px] text-muted-foreground">HUM: 65%</span>
              </div>
            </div>
          </div>

          {/* Radar */}
          <div className="relative w-24 h-24 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-rotate-slow">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="hsl(195 100% 50% / 0.1)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="hsl(195 100% 50% / 0.1)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="hsl(195 100% 50% / 0.1)" strokeWidth="0.5" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="hsl(195 100% 50% / 0.08)" strokeWidth="0.5" />
              <line x1="5" y1="50" x2="95" y2="50" stroke="hsl(195 100% 50% / 0.08)" strokeWidth="0.5" />
            </svg>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <line x1="50" y1="50" x2="50" y2="5" stroke="hsl(195 100% 50% / 0.6)" strokeWidth="1" className="origin-center animate-rotate-slow" />
              <circle cx="62" cy="35" r="2" fill="hsl(195 100% 50% / 0.8)" className="animate-pulse-glow" />
              <circle cx="38" cy="58" r="1.5" fill="hsl(195 100% 50% / 0.5)" className="animate-pulse-glow" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 text-center font-mono text-[7px] text-primary/50 tracking-widest">RADAR</div>
          </div>
        </div>

        {/* Bottom: Power + System stats */}
        <div className="flex flex-col gap-3">
          {/* Power gauge */}
          <div className="border border-border/20 bg-card/20 backdrop-blur-sm rounded-sm p-2">
            <div className="font-mono text-[8px] text-primary/60 tracking-widest mb-1">POWER OUTPUT</div>
            <div className="flex items-end gap-0.5 h-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all duration-500"
                  style={{
                    height: `${Math.min(100, (powerLevel / 100) * (i + 1) * 8.5)}%`,
                    background: i < 9 ? "hsl(195 100% 50% / 0.6)" : i < 11 ? "hsl(35 100% 50% / 0.6)" : "hsl(0 72% 51% / 0.6)",
                    opacity: (i / 12) < (powerLevel / 100) ? 1 : 0.15,
                  }}
                />
              ))}
            </div>
            <div className="font-orbitron text-[10px] text-primary mt-1">{powerLevel}%</div>
          </div>

          {/* System stats */}
          <div className="border border-border/20 bg-card/20 backdrop-blur-sm rounded-sm p-2 space-y-1.5">
            <div className="font-mono text-[8px] text-primary/60 tracking-widest">SYSTEM</div>
            {[
              { label: "CPU", value: cpuUsage },
              { label: "MEM", value: 67 },
              { label: "NET", value: 89 },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-between font-mono text-[8px]">
                  <span className="text-muted-foreground">{stat.label}</span>
                  <span className="text-primary">{stat.value}%</span>
                </div>
                <div className="h-[2px] bg-border/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 rounded-full transition-all duration-1000" style={{ width: `${stat.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Uptime */}
          <div className="font-mono text-[7px] text-muted-foreground/50 text-center tracking-widest">
            STARK INDUSTRIES · ENCRYPTED
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL (data widgets only, no chat) ===== */}
      <div className="fixed right-[340px] top-14 z-10 pointer-events-none flex flex-col gap-3 w-40 animate-fade-in-up">
        {/* Circular progress rings */}
        <div className="flex gap-2 justify-center">
          {[
            { label: "ARC", value: 97, color: "hsl(195 100% 50%)" },
            { label: "SYS", value: 82, color: "hsl(35 100% 50%)" },
            { label: "NET", value: 91, color: "hsl(150 80% 50%)" },
          ].map((ring) => (
            <div key={ring.label} className="relative w-11 h-11">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(195 100% 50% / 0.1)" strokeWidth="2" />
                <circle cx="18" cy="18" r="15" fill="none" stroke={ring.color} strokeWidth="2" strokeDasharray={`${ring.value * 0.942} 94.2`} strokeLinecap="round" opacity="0.7" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-[6px] text-primary/70">{ring.label}</span>
                <span className="font-orbitron text-[7px] text-primary">{ring.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Waveform */}
        <div className="border border-border/20 bg-card/20 backdrop-blur-sm rounded-sm p-2">
          <div className="font-mono text-[8px] text-primary/60 tracking-widest mb-1">AUDIO FREQ</div>
          <div className="flex items-center justify-center gap-[2px] h-8">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="w-[2px] bg-primary/50 rounded-full animate-pulse-glow"
                style={{
                  height: `${4 + Math.sin(i * 0.5 + Date.now() * 0.001) * 10 + Math.random() * 4}px`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Telemetry */}
        <div className="border border-border/20 bg-card/20 backdrop-blur-sm rounded-sm p-2 space-y-1">
          <div className="font-mono text-[8px] text-primary/60 tracking-widest">TELEMETRY</div>
          {[
            "REPULSOR: STANDBY",
            "UNIBEAM: CHARGED",
            "FLIGHT: READY",
            "COMMS: ENCRYPTED",
          ].map((line, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-primary/60 animate-pulse-glow" style={{ animationDelay: `${i * 0.3}s` }} />
              <span className="font-mono text-[7px] text-muted-foreground">{line}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HudSidePanels;
