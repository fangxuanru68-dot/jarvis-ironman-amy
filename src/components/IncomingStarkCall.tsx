import { useEffect, useState } from "react";
import { Phone, PhoneOff, Volume2, Mic } from "lucide-react";

interface Props {
  isActive: boolean;
  offenseCount: number;
  onClose: () => void;
}

const IncomingStarkCall = ({ isActive, offenseCount, onClose }: Props) => {
  const [phase, setPhase] = useState<"ringing" | "connected" | "ended">("ringing");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive) { setPhase("ringing"); setElapsed(0); return; }
    // Auto-accept after 4s
    const acceptT = setTimeout(() => setPhase("connected"), 4000);
    return () => clearTimeout(acceptT);
  }, [isActive]);

  useEffect(() => {
    if (phase !== "connected") return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    // Auto end after 18s
    const endT = setTimeout(() => { setPhase("ended"); setTimeout(onClose, 1500); }, 18000);
    return () => { clearInterval(t); clearTimeout(endT); };
  }, [phase, onClose]);

  if (!isActive) return null;

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, hsl(220 60% 8% / 0.85) 0%, hsl(220 80% 2% / 0.98) 80%)",
          backdropFilter: "blur(20px)",
        }}
      />

      {/* Scanning grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(hsl(195 100% 50% / 0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(195 100% 50% / 0.6) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Top status bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-4 border-b border-primary/30 bg-background/40 font-mono text-[10px] text-primary tracking-[0.3em]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          STARK SECURE LINK // PRIORITY-01
        </div>
        <div>{phase === "ringing" ? "INBOUND SIGNAL" : phase === "connected" ? `LIVE · ${mm}:${ss}` : "SIGNAL TERMINATED"}</div>
      </div>

      {/* Card */}
      <div className="relative w-[440px] bg-background/85 border border-primary/50 rounded-lg p-8 shadow-[0_0_80px_hsl(195_100%_50%/0.35)]">
        {/* Corner brackets */}
        <div className="absolute -top-px -left-px w-8 h-8 border-l-2 border-t-2 border-primary" />
        <div className="absolute -top-px -right-px w-8 h-8 border-r-2 border-t-2 border-primary" />
        <div className="absolute -bottom-px -left-px w-8 h-8 border-l-2 border-b-2 border-primary" />
        <div className="absolute -bottom-px -right-px w-8 h-8 border-r-2 border-b-2 border-primary" />

        <div className="text-center">
          <div className="font-mono text-[10px] tracking-[0.4em] text-primary/60 mb-2">
            {phase === "connected" ? "CONNECTED CALL" : phase === "ended" ? "CALL ENDED" : "INCOMING CALL"}
          </div>
          <div className="font-orbitron text-[22px] tracking-[0.2em] text-primary mb-1">
            ANTHONY E. STARK
          </div>
          <div className="font-mono text-[10px] tracking-widest text-primary/50">
            CEO · STARK INDUSTRIES
          </div>
        </div>

        {/* Avatar with pulsing rings */}
        <div className="relative flex items-center justify-center my-8" style={{ height: 200 }}>
          {phase === "ringing" && (
            <>
              <div className="absolute rounded-full border-2 border-primary/40" style={{ width: 200, height: 200, animation: "call-ring 1.6s ease-out infinite" }} />
              <div className="absolute rounded-full border-2 border-primary/30" style={{ width: 200, height: 200, animation: "call-ring 1.6s ease-out infinite 0.4s" }} />
              <div className="absolute rounded-full border border-primary/20" style={{ width: 200, height: 200, animation: "call-ring 1.6s ease-out infinite 0.8s" }} />
            </>
          )}
          {phase === "connected" && (
            <>
              <div className="absolute rounded-full border border-primary/40 animate-pulse" style={{ width: 220, height: 220 }} />
              <div className="absolute rounded-full border border-primary/30" style={{ width: 260, height: 260, animation: "spin 12s linear infinite" }}>
                {[0, 90, 180, 270].map(a => (
                  <div key={a} className="absolute w-2 h-2 rounded-full bg-primary" style={{ top: "50%", left: "50%", transform: `rotate(${a}deg) translateY(-130px) translateX(-4px)`, boxShadow: "0 0 8px hsl(195 100% 50%)" }} />
                ))}
              </div>
            </>
          )}
          <div
            className="relative w-40 h-40 rounded-full border-2 border-primary flex items-center justify-center overflow-hidden"
            style={{ background: "radial-gradient(circle, hsl(195 80% 25%) 0%, hsl(220 60% 8%) 80%)", boxShadow: "0 0 40px hsl(195 100% 50% / 0.6)" }}
          >
            <div className="font-orbitron text-6xl text-primary drop-shadow-[0_0_10px_hsl(195_100%_60%)]">TS</div>
          </div>
        </div>

        {/* Message / actions */}
        {phase === "ringing" && (
          <div className="text-center space-y-4">
            <div className="font-mono text-[11px] text-primary/80 tracking-wider">
              INCIDENT REPORT DELIVERED · PHONE STRIKES × {offenseCount}
            </div>
            <div className="text-primary/60 text-xs italic">"Auto-answering in 4 seconds..."</div>
            <div className="flex justify-center gap-6 pt-2">
              <button
                onClick={onClose}
                className="w-14 h-14 rounded-full bg-red-600/80 hover:bg-red-500 flex items-center justify-center transition-all shadow-[0_0_20px_hsl(0_80%_50%/0.5)]"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => setPhase("connected")}
                className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-all shadow-[0_0_20px_hsl(195_100%_50%/0.6)] animate-pulse"
              >
                <Phone className="w-6 h-6 text-background" />
              </button>
            </div>
          </div>
        )}

        {phase === "connected" && (
          <div className="space-y-3">
            <div className="border-t border-primary/20 pt-3 font-mono text-[11px] space-y-1.5 text-primary">
              <div className="flex justify-between"><span className="text-primary/50">CALLER</span><span>T. STARK</span></div>
              <div className="flex justify-between"><span className="text-primary/50">CHANNEL</span><span>ENCRYPTED · AES-256</span></div>
              <div className="flex justify-between"><span className="text-primary/50">DURATION</span><span>{mm}:{ss}</span></div>
              <div className="flex justify-between"><span className="text-primary/50">SIGNAL</span><span>▮▮▮▮▮ 99%</span></div>
            </div>
            <div className="border border-primary/30 bg-primary/5 rounded-sm p-3 text-primary/90 text-sm italic leading-relaxed">
              "Kid — J.A.R.V.I.S. just pinged me. Three phone offences in one session? Come on, Pete. Book. Face. Now. We'll talk when I land."
              <div className="text-right text-[10px] mt-2 text-primary/50 tracking-widest not-italic">— T.S.</div>
            </div>
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="p-2 border border-primary/30 rounded-full text-primary/70"><Mic className="w-4 h-4" /></div>
              <div className="p-2 border border-primary/30 rounded-full text-primary/70"><Volume2 className="w-4 h-4" /></div>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-red-600/80 hover:bg-red-500 flex items-center justify-center transition-all shadow-[0_0_16px_hsl(0_80%_50%/0.5)]"
              >
                <PhoneOff className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {phase === "ended" && (
          <div className="text-center font-mono text-[11px] text-primary/60 tracking-widest py-6">
            LINE CLOSED · REPORT ARCHIVED
          </div>
        )}
      </div>

      <style>{`
        @keyframes call-ring {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default IncomingStarkCall;
