import { useEffect, useState } from "react";

const HudRightPanel = ({ visible }: { visible: boolean }) => {
  const [heartRate, setHeartRate] = useState(72);
  const [scanAngle, setScanAngle] = useState(0);
  const [dataStream, setDataStream] = useState<string[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalBars, setSignalBars] = useState(4);
  const [targetLock, setTargetLock] = useState(0);

  // Rotating scan
  useEffect(() => {
    if (!visible) return;
    const anim = setInterval(() => setScanAngle(prev => (prev + 1.5) % 360), 30);
    return () => clearInterval(anim);
  }, [visible]);

  // Fluctuating data
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

  // Scrolling data stream
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
    <div className="fixed right-3 top-14 bottom-16 z-10 pointer-events-none animate-fade-in flex flex-col gap-4 w-[200px]">
      
      {/* CT HEART SCAN label + rotating circle */}
      <div className="flex flex-col items-end">
        <div className="font-mono text-[7px] tracking-[0.2em] text-primary/50 mb-1">CT HEART SCAN</div>
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer dashed ring */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.8" strokeDasharray="4 3" />
            {/* Middle ring */}
            <circle cx="50" cy="50" r="38" fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="0.5" />
            {/* Inner ring */}
            <circle cx="50" cy="50" r="28" fill="none" stroke="hsl(195 100% 50% / 0.1)" strokeWidth="0.5" />
            {/* Rotating sweep */}
            <line
              x1="50" y1="50" x2="50" y2="8"
              stroke="hsl(195 100% 50% / 0.5)"
              strokeWidth="1"
              style={{ transform: `rotate(${scanAngle}deg)`, transformOrigin: "50px 50px" }}
            />
            {/* Sweep trail */}
            <path
              d={`M 50 50 L ${50 + 42 * Math.sin((scanAngle - 30) * Math.PI / 180)} ${50 - 42 * Math.cos((scanAngle - 30) * Math.PI / 180)} A 42 42 0 0 1 ${50 + 42 * Math.sin(scanAngle * Math.PI / 180)} ${50 - 42 * Math.cos(scanAngle * Math.PI / 180)} Z`}
              fill="hsl(195 100% 50% / 0.06)"
            />
            {/* Data points */}
            <circle cx="62" cy="35" r="2" fill="hsl(195 100% 50% / 0.7)" className="animate-pulse-glow" />
            <circle cx="40" cy="58" r="1.5" fill="hsl(195 100% 50% / 0.4)" className="animate-pulse-glow" />
            <circle cx="55" cy="65" r="1" fill="hsl(195 100% 50% / 0.5)" className="animate-pulse-glow" />
            {/* Crosshair */}
            <line x1="45" y1="50" x2="55" y2="50" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.5" />
            <line x1="50" y1="45" x2="50" y2="55" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.5" />
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-orbitron text-[8px] text-primary/70">{heartRate}</span>
            <span className="font-mono text-[5px] text-primary/40">BPM</span>
          </div>
        </div>
      </div>

      {/* Battery / Power indicator */}
      <div className="flex flex-col items-end gap-1">
        <div className="font-mono text-[7px] tracking-[0.2em] text-primary/50">POWER CELL</div>
        <div className="flex items-center gap-1.5">
          <div className="w-20 h-3 border border-primary/30 rounded-sm relative overflow-hidden">
            <div
              className="h-full rounded-sm transition-all duration-1000"
              style={{
                width: `${batteryLevel}%`,
                background: "linear-gradient(90deg, hsl(195 100% 50% / 0.3), hsl(195 100% 50% / 0.6))",
              }}
            />
            {/* Segments */}
            {[25, 50, 75].map(p => (
              <div key={p} className="absolute top-0 bottom-0 w-px bg-background/50" style={{ left: `${p}%` }} />
            ))}
          </div>
          <span className="font-orbitron text-[8px] text-primary/70">{batteryLevel}</span>
        </div>
        {/* Battery nub */}
        <div className="w-1.5 h-1 bg-primary/20 rounded-sm self-end mr-[70px] -mt-1.5" />
      </div>

      {/* Signal strength */}
      <div className="flex flex-col items-end gap-1">
        <div className="font-mono text-[7px] tracking-[0.2em] text-primary/50">SIGNAL</div>
        <div className="flex items-end gap-0.5">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="w-1.5 rounded-sm transition-all duration-500"
              style={{
                height: `${4 + i * 3}px`,
                background: i <= signalBars ? "hsl(195 100% 50% / 0.6)" : "hsl(195 100% 50% / 0.1)",
              }}
            />
          ))}
          <span className="font-mono text-[6px] text-primary/50 ml-1">ENCR</span>
        </div>
      </div>

      {/* Targeting reticle */}
      <div className="flex flex-col items-end">
        <div className="font-mono text-[7px] tracking-[0.2em] text-primary/50 mb-1">TARGET SYS</div>
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 80 80" className="w-full h-full" style={{ transform: `rotate(${-scanAngle * 0.5}deg)` }}>
            <circle cx="40" cy="40" r="35" fill="none" stroke="hsl(195 100% 50% / 0.2)" strokeWidth="0.8" />
            <circle cx="40" cy="40" r="25" fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
            {/* Corner brackets */}
            <path d="M 15 25 L 15 15 L 25 15" fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1" />
            <path d="M 55 15 L 65 15 L 65 25" fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1" />
            <path d="M 15 55 L 15 65 L 25 65" fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1" />
            <path d="M 55 65 L 65 65 L 65 55" fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-primary/60" style={{ boxShadow: "0 0 4px hsl(195 100% 50% / 0.4)" }} />
          </div>
        </div>
      </div>

      {/* Scrolling data stream */}
      <div className="flex flex-col items-end gap-0.5 mt-auto">
        <div className="font-mono text-[7px] tracking-[0.2em] text-primary/50 mb-0.5">DATA STREAM</div>
        {dataStream.map((line, i) => (
          <div
            key={`${line}-${i}`}
            className="font-mono text-[6px] text-primary/40 animate-fade-in"
            style={{ opacity: 0.3 + (i / dataStream.length) * 0.7 }}
          >
            &gt; {line}
          </div>
        ))}
        <div className="w-12 h-px bg-primary/20 mt-1" />
      </div>

      {/* Rotating arc gauge */}
      <div className="flex flex-col items-end">
        <div className="relative w-14 h-14">
          <svg viewBox="0 0 60 60" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 10 45 A 25 25 0 1 1 50 45"
              fill="none"
              stroke="hsl(195 100% 50% / 0.1)"
              strokeWidth="2"
            />
            {/* Filled arc */}
            <path
              d="M 10 45 A 25 25 0 1 1 50 45"
              fill="none"
              stroke="hsl(195 100% 50% / 0.5)"
              strokeWidth="2"
              strokeDasharray={`${targetLock * 1.3} 200`}
              className="transition-all duration-500"
            />
            {/* Tick marks */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = -210 + i * 25;
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={30 + 23 * Math.cos(rad)}
                  y1={30 + 23 * Math.sin(rad)}
                  x2={30 + 26 * Math.cos(rad)}
                  y2={30 + 26 * Math.sin(rad)}
                  stroke="hsl(195 100% 50% / 0.3)"
                  strokeWidth="0.5"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-orbitron text-[7px] text-primary/60">{targetLock}%</span>
            <span className="font-mono text-[4px] text-primary/30">LOCK</span>
          </div>
        </div>
      </div>

      {/* Bottom status indicators */}
      <div className="flex flex-col items-end gap-0.5 mt-auto">
        {[
          { label: "NAV", status: "ACTIVE" },
          { label: "THERMAL", status: "SCAN" },
          { label: "IR", status: "ON" },
          { label: "FLIR", status: "STANDBY" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="font-mono text-[6px] text-muted-foreground/50">{item.label}</span>
            <div
              className="w-1 h-1 rounded-full animate-pulse-glow"
              style={{
                backgroundColor: "hsl(195 100% 50% / 0.5)",
                animationDelay: `${i * 0.4}s`,
              }}
            />
            <span className="font-mono text-[6px] text-primary/40">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HudRightPanel;
