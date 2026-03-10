import { useEffect, useState } from "react";

const HudRightPanel = ({ visible, side = "right" }: { visible: boolean; side?: "right" | "left" }) => {
  const [heartRate, setHeartRate] = useState(72);
  const [scanAngle, setScanAngle] = useState(0);
  const [dataStream, setDataStream] = useState<string[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalBars, setSignalBars] = useState(4);
  const [targetLock, setTargetLock] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const anim = setInterval(() => setScanAngle(prev => (prev + 1.5) % 360), 30);
    return () => clearInterval(anim);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setHeartRate(68 + Math.floor(Math.random() * 12));
      setBatteryLevel(80 + Math.floor(Math.random() * 15));
      setSignalBars(3 + Math.floor(Math.random() * 2));
      setTargetLock(prev => (prev + 1) % 100);
    }, 1500);
    return () => clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const lines = [
      "SYS.INIT OK", "FREQ 2.4GHz", "LAT 34.0522", "LNG -118.243",
      "ALT 120M", "HDG 045°", "SPD 0 KTS", "TEMP 22.4°C",
      "HUM 45%", "PRES 1013hPa", "MAG N 12°", "GYRO CAL OK",
      "ACC ±0.01G", "PWR 3.2GJ/s", "SHIELD UP", "COMM ENCR",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      setDataStream(prev => {
        const next = [...prev, lines[idx % lines.length]];
        idx++;
        return next.length > 6 ? next.slice(-6) : next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`fixed ${side === "right" ? "right-3" : "left-[170px]"} top-14 bottom-16 z-10 pointer-events-none animate-fade-in flex flex-col gap-4 w-[200px]`}>
      
      {/* CT HEART SCAN */}
      <div className="flex flex-col items-end">
        <div className="font-mono text-[8px] tracking-[0.2em] text-primary/80 mb-1">CT HEART SCAN</div>
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.6" />
            <line
              x1="50" y1="50" x2="50" y2="8"
              stroke="hsl(195 100% 50% / 0.7)"
              strokeWidth="1.2"
              style={{ transform: `rotate(${scanAngle}deg)`, transformOrigin: "50px 50px" }}
            />
            <path
              d={`M 50 50 L ${50 + 42 * Math.sin((scanAngle - 30) * Math.PI / 180)} ${50 - 42 * Math.cos((scanAngle - 30) * Math.PI / 180)} A 42 42 0 0 1 ${50 + 42 * Math.sin(scanAngle * Math.PI / 180)} ${50 - 42 * Math.cos(scanAngle * Math.PI / 180)} Z`}
              fill="hsl(195 100% 50% / 0.1)"
            />
            <circle cx="62" cy="35" r="2.5" fill="hsl(195 100% 50% / 0.9)" className="animate-pulse-glow" />
            <circle cx="40" cy="58" r="2" fill="hsl(195 100% 50% / 0.6)" className="animate-pulse-glow" />
            <circle cx="55" cy="65" r="1.5" fill="hsl(195 100% 50% / 0.7)" className="animate-pulse-glow" />
            <line x1="44" y1="50" x2="56" y2="50" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="0.6" />
            <line x1="50" y1="44" x2="50" y2="56" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="0.6" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-orbitron text-[10px] text-primary/90">{heartRate}</span>
            <span className="font-mono text-[6px] text-primary/60">BPM</span>
          </div>
        </div>
      </div>

      {/* Battery */}
      <div className="flex flex-col items-end gap-1">
        <div className="font-mono text-[8px] tracking-[0.2em] text-primary/80">POWER CELL</div>
        <div className="flex items-center gap-1.5">
          <div className="w-24 h-4 border border-primary/50 rounded-sm relative overflow-hidden">
            <div
              className="h-full rounded-sm transition-all duration-1000"
              style={{
                width: `${batteryLevel}%`,
                background: "linear-gradient(90deg, hsl(195 100% 50% / 0.4), hsl(195 100% 50% / 0.8))",
              }}
            />
            {[25, 50, 75].map(p => (
              <div key={p} className="absolute top-0 bottom-0 w-px bg-background/60" style={{ left: `${p}%` }} />
            ))}
          </div>
          <span className="font-orbitron text-[10px] text-primary/90">{batteryLevel}</span>
        </div>
      </div>

      {/* Signal */}
      <div className="flex flex-col items-end gap-1">
        <div className="font-mono text-[8px] tracking-[0.2em] text-primary/80">SIGNAL</div>
        <div className="flex items-end gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="w-2 rounded-sm transition-all duration-500"
              style={{
                height: `${5 + i * 4}px`,
                background: i <= signalBars ? "hsl(195 100% 50% / 0.8)" : "hsl(195 100% 50% / 0.15)",
              }}
            />
          ))}
          <span className="font-mono text-[7px] text-primary/70 ml-1">ENCR</span>
        </div>
      </div>

      {/* Targeting reticle */}
      <div className="flex flex-col items-end">
        <div className="font-mono text-[8px] tracking-[0.2em] text-primary/80 mb-1">TARGET SYS</div>
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-full h-full" style={{ transform: `rotate(${-scanAngle * 0.5}deg)` }}>
            <circle cx="40" cy="40" r="35" fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1" />
            <circle cx="40" cy="40" r="25" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.8" strokeDasharray="3 3" />
            <path d="M 15 25 L 15 15 L 25 15" fill="none" stroke="hsl(195 100% 50% / 0.7)" strokeWidth="1.5" />
            <path d="M 55 15 L 65 15 L 65 25" fill="none" stroke="hsl(195 100% 50% / 0.7)" strokeWidth="1.5" />
            <path d="M 15 55 L 15 65 L 25 65" fill="none" stroke="hsl(195 100% 50% / 0.7)" strokeWidth="1.5" />
            <path d="M 55 65 L 65 65 L 65 55" fill="none" stroke="hsl(195 100% 50% / 0.7)" strokeWidth="1.5" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/80" style={{ boxShadow: "0 0 6px hsl(195 100% 50% / 0.6)" }} />
          </div>
        </div>
      </div>

      {/* Data stream */}
      <div className="flex flex-col items-end gap-0.5 mt-auto">
        <div className="font-mono text-[8px] tracking-[0.2em] text-primary/80 mb-0.5">DATA STREAM</div>
        {dataStream.map((line, i) => (
          <div
            key={`${line}-${i}`}
            className="font-mono text-[7px] text-primary/60 animate-fade-in"
            style={{ opacity: 0.4 + (i / dataStream.length) * 0.6 }}
          >
            &gt; {line}
          </div>
        ))}
        <div className="w-14 h-px bg-primary/35 mt-1" />
      </div>

      {/* Arc gauge */}
      <div className="flex flex-col items-end">
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 60 60" className="w-full h-full">
            <path d="M 10 45 A 25 25 0 1 1 50 45" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="2.5" />
            <path d="M 10 45 A 25 25 0 1 1 50 45" fill="none" stroke="hsl(195 100% 50% / 0.7)" strokeWidth="2.5"
              strokeDasharray={`${targetLock * 1.3} 200`} className="transition-all duration-500" />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = -210 + i * 25;
              const rad = (angle * Math.PI) / 180;
              return (
                <line key={i}
                  x1={30 + 23 * Math.cos(rad)} y1={30 + 23 * Math.sin(rad)}
                  x2={30 + 26 * Math.cos(rad)} y2={30 + 26 * Math.sin(rad)}
                  stroke="hsl(195 100% 50% / 0.5)" strokeWidth="0.7" />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-orbitron text-[9px] text-primary/80">{targetLock}%</span>
            <span className="font-mono text-[5px] text-primary/50">LOCK</span>
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex flex-col items-end gap-1 mt-auto">
        {[
          { label: "NAV", status: "ACTIVE" },
          { label: "THERMAL", status: "SCAN" },
          { label: "IR", status: "ON" },
          { label: "FLIR", status: "STANDBY" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="font-mono text-[7px] text-muted-foreground/70">{item.label}</span>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse-glow"
              style={{ backgroundColor: "hsl(195 100% 50% / 0.7)", animationDelay: `${i * 0.4}s` }} />
            <span className="font-mono text-[7px] text-primary/60">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HudRightPanel;
