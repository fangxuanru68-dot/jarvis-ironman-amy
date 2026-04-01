import { useEffect, useState, useRef } from "react";

interface WelcomeProtocolOverlayProps {
  isActive: boolean;
  onComplete: () => void;
}

const WelcomeProtocolOverlay = ({ isActive, onComplete }: WelcomeProtocolOverlayProps) => {
  const [phase, setPhase] = useState(0); // 0: circle, 1: expand, 2: text1, 3: text2, 4: fade out
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!isActive) { setPhase(0); timerRef.current.forEach(clearTimeout); timerRef.current = []; return; }

    setPhase(1);
    timerRef.current.push(setTimeout(() => setPhase(2), 800));
    timerRef.current.push(setTimeout(() => setPhase(3), 2200));
    timerRef.current.push(setTimeout(() => setPhase(4), 4500));
    timerRef.current.push(setTimeout(() => onComplete(), 6000));

    return () => { timerRef.current.forEach(clearTimeout); timerRef.current = []; };
  }, [isActive, onComplete]);

  if (!isActive && phase === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[30]" style={{
      opacity: phase === 4 ? 0 : 1,
      transition: "opacity 1.5s ease-out",
    }}>
      {/* Dark cinematic background */}
      <div className="absolute inset-0" style={{ background: "hsl(220 30% 3% / 0.9)" }} />

      {/* Central glowing circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div style={{
          width: phase >= 2 ? "200px" : "40px",
          height: phase >= 2 ? "200px" : "40px",
          transition: "all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          opacity: phase >= 2 ? 0.15 : 0.8,
        }}>
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--primary) / 0.6)" strokeWidth="1" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="0.5" strokeDasharray="4 6" />
            <circle cx="100" cy="100" r="8" fill="hsl(var(--primary) / 0.5)" />
          </svg>
        </div>

        {/* Radial light expansion */}
        <div className="absolute" style={{
          width: phase >= 1 ? "500px" : "0px",
          height: phase >= 1 ? "500px" : "0px",
          borderRadius: "50%",
          background: "radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)",
          transition: "all 2s ease-out",
        }} />
      </div>

      {/* Text: HELLO */}
      {phase >= 2 && (
        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 text-center animate-fade-in-up">
          <div className="font-orbitron text-2xl tracking-[0.5em]" style={{
            color: "hsl(var(--primary) / 0.9)",
            textShadow: "0 0 30px hsl(var(--primary) / 0.4), 0 0 60px hsl(var(--primary) / 0.2)",
          }}>
            HELLO
          </div>
        </div>
      )}

      {/* Text: HOW CAN I ASSIST YOU TODAY */}
      {phase >= 3 && (
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 text-center animate-fade-in-up">
          <div className="font-mono text-xs tracking-[0.25em]" style={{
            color: "hsl(var(--primary) / 0.5)",
          }}>
            HOW CAN I ASSIST YOU TODAY
          </div>
        </div>
      )}

      {/* Soft pulse at center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full animate-pulse-glow"
        style={{
          background: "hsl(var(--primary) / 0.6)",
          boxShadow: "0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.2)",
          opacity: phase >= 2 ? 0 : 1,
          transition: "opacity 1s ease-out",
        }}
      />
    </div>
  );
};

export default WelcomeProtocolOverlay;
