import { useEffect, useState } from "react";

const HudOverlay = () => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) => d.toLocaleTimeString("en-US", { hour12: false });
  const formatDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

  return (
    <>
      {/* Top left HUD */}
      <div className="fixed top-4 left-4 z-10 animate-hud-flicker pointer-events-none">
        <div className="border border-border/30 px-3 py-2 rounded-sm bg-card/30 backdrop-blur-sm">
          <div className="font-orbitron text-[10px] tracking-[0.3em] text-muted-foreground uppercase">J.A.R.V.I.S</div>
          <div className="font-mono text-xs text-primary mt-1">{formatTime(time)}</div>
          <div className="font-mono text-[10px] text-muted-foreground">{formatDate(time)}</div>
        </div>
      </div>

      {/* Top right HUD */}
      <div className="fixed top-4 right-4 z-10 animate-hud-flicker pointer-events-none">
        <div className="border border-border/30 px-3 py-2 rounded-sm bg-card/30 backdrop-blur-sm text-right">
          <div className="font-orbitron text-[10px] tracking-[0.2em] text-primary">SYSTEM ONLINE</div>
          <div className="flex items-center gap-2 mt-1 justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="font-mono text-[10px] text-muted-foreground">ALL SYSTEMS NOMINAL</span>
          </div>
        </div>
      </div>

      {/* Corner brackets */}
      <div className="fixed top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-primary/20 pointer-events-none z-10" />
      <div className="fixed top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-primary/20 pointer-events-none z-10" />
      <div className="fixed bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-primary/20 pointer-events-none z-10" />
      <div className="fixed bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-primary/20 pointer-events-none z-10" />

      {/* Scan line */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
      </div>
    </>
  );
};

export default HudOverlay;
