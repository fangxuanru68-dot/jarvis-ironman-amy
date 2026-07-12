import { useEffect, useState } from "react";

interface Props {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  interimText: string;
  lastUserText: string;
  lastAssistantText: string;
  onExit: () => void;
}

const LiveModeOverlay = ({ isActive, isListening, isSpeaking, interimText, lastUserText, lastAssistantText, onExit }: Props) => {
  const [elapsed, setElapsed] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(24).fill(0.2));

  useEffect(() => {
    if (!isActive) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => {
      const active = isListening || isSpeaking;
      setBars(Array(24).fill(0).map(() => active ? 0.25 + Math.random() * 0.75 : 0.1 + Math.random() * 0.1));
    }, 90);
    return () => clearInterval(t);
  }, [isActive, isListening, isSpeaking]);

  if (!isActive) return null;

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const status = isSpeaking ? "J.A.R.V.I.S. SPEAKING" : isListening ? "LISTENING" : "STANDBY";
  const statusColor = isSpeaking ? "hsl(45, 100%, 60%)" : isListening ? "hsl(160, 100%, 55%)" : "hsl(195, 100%, 60%)";

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{
          background: "radial-gradient(ellipse at center, hsl(220 60% 6% / 0.85) 0%, hsl(220 80% 2% / 0.98) 80%)",
          backdropFilter: "blur(14px)",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `linear-gradient(hsl(195 100% 50% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(195 100% 50% / 0.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top HUD bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 border-b border-primary/30 bg-background/40">
        <div className="flex items-center gap-3 font-mono text-xs text-primary tracking-widest">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "hsl(0 100% 60%)" }} />
          <span>LIVE CHANNEL // ENCRYPTED</span>
          <span className="text-primary/50">| STARK SECURE LINE</span>
        </div>
        <div className="font-mono text-xs text-primary/80 tracking-widest">
          CALL DURATION <span className="text-primary ml-2">{mm}:{ss}</span>
        </div>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-16 left-4 w-10 h-10 border-l-2 border-t-2 border-primary/60" />
      <div className="absolute top-16 right-4 w-10 h-10 border-r-2 border-t-2 border-primary/60" />
      <div className="absolute bottom-4 left-4 w-10 h-10 border-l-2 border-b-2 border-primary/60" />
      <div className="absolute bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 border-primary/60" />

      {/* Center reactor */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
        <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>
          {/* Rotating rings */}
          <div className="absolute inset-0 rounded-full border border-primary/30" style={{ animation: "spin 22s linear infinite" }}>
            {[0, 72, 144, 216, 288].map(a => (
              <div key={a} className="absolute w-2 h-2 rounded-full bg-primary"
                style={{ top: "50%", left: "50%", transform: `rotate(${a}deg) translateY(-170px) translateX(-4px)`, boxShadow: "0 0 8px hsl(195 100% 50%)" }} />
            ))}
          </div>
          <div className="absolute rounded-full border border-primary/40" style={{ inset: 30, animation: "spin 14s linear infinite reverse" }} />
          <div className="absolute rounded-full border border-primary/50" style={{ inset: 60, animation: "spin 9s linear infinite" }} />

          {/* Pulsing core */}
          <div
            className="absolute rounded-full"
            style={{
              inset: 90,
              background: `radial-gradient(circle, ${statusColor} 0%, hsl(195 100% 40% / 0.6) 40%, transparent 75%)`,
              boxShadow: `0 0 80px ${statusColor}, 0 0 160px ${statusColor}`,
              animation: isSpeaking || isListening ? "pulse 1.2s ease-in-out infinite" : "pulse 3s ease-in-out infinite",
            }}
          />
          <div className="absolute rounded-full bg-white/90" style={{ inset: 140, boxShadow: `0 0 40px ${statusColor}` }} />

          {/* Status text */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-xs tracking-[0.3em] px-4 py-1 border border-primary/40 bg-background/60"
            style={{ color: statusColor, textShadow: `0 0 10px ${statusColor}` }}>
            {status}
          </div>
        </div>

        {/* Waveform */}
        <div className="flex items-end gap-1 h-16">
          {bars.map((b, i) => (
            <div key={i} className="w-1.5 rounded-full transition-all duration-75"
              style={{ height: `${b * 100}%`, background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
          ))}
        </div>

        {/* Caption area */}
        <div className="w-[min(720px,90vw)] min-h-[80px] border border-primary/30 bg-background/50 p-4 font-mono text-sm">
          {isListening && interimText ? (
            <div className="text-primary/90">
              <span className="text-primary/50 tracking-widest text-[10px] mr-2">YOU //</span>
              {interimText}<span className="animate-pulse">▊</span>
            </div>
          ) : isSpeaking && lastAssistantText ? (
            <div className="text-primary">
              <span className="text-primary/50 tracking-widest text-[10px] mr-2">JARVIS //</span>
              {lastAssistantText}
            </div>
          ) : lastUserText || lastAssistantText ? (
            <div className="space-y-2">
              {lastUserText && <div className="text-primary/70"><span className="text-primary/40 tracking-widest text-[10px] mr-2">YOU //</span>{lastUserText}</div>}
              {lastAssistantText && <div className="text-primary"><span className="text-primary/50 tracking-widest text-[10px] mr-2">JARVIS //</span>{lastAssistantText}</div>}
            </div>
          ) : (
            <div className="text-primary/50 tracking-widest text-xs">AWAITING VOICE INPUT, SIR. THE LINE IS OPEN.</div>
          )}
        </div>
      </div>

      {/* Left telemetry */}
      <div className="absolute top-24 left-6 font-mono text-[10px] text-primary/70 space-y-1 tracking-wider">
        <div>◉ MIC INPUT ...... <span className={isListening ? "text-primary" : "text-primary/40"}>{isListening ? "ACTIVE" : "MUTED"}</span></div>
        <div>◉ TTS OUTPUT ..... <span className={isSpeaking ? "text-primary" : "text-primary/40"}>{isSpeaking ? "STREAMING" : "IDLE"}</span></div>
        <div>◉ ENCRYPTION ..... <span className="text-primary">AES-256</span></div>
        <div>◉ BARGE-IN ....... <span className="text-primary">ENABLED</span></div>
        <div>◉ LANG DETECT .... <span className="text-primary">AUTO</span></div>
      </div>

      {/* Right telemetry */}
      <div className="absolute top-24 right-6 font-mono text-[10px] text-primary/70 space-y-1 tracking-wider text-right">
        <div>UPLINK ....... STARK-SAT-07</div>
        <div>LATENCY ...... 42 MS</div>
        <div>SIGNAL ....... ▮▮▮▮▮ 98%</div>
        <div>PROTOCOL ..... J.A.R.V.I.S. v9.3</div>
        <div>SESSION ...... {mm}:{ss}</div>
      </div>

      {/* Exit control */}
      <button
        onClick={onExit}
        className="pointer-events-auto absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-2 border border-red-500/60 bg-red-950/40 hover:bg-red-900/50 font-mono text-xs tracking-widest text-red-300 hover:text-red-100 transition-colors"
        style={{ boxShadow: "0 0 20px hsl(0 80% 40% / 0.4)" }}
      >
        ⏻ END CALL — SAY "MODE END"
      </button>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.85; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
      `}</style>
    </div>
  );
};

export default LiveModeOverlay;
