import { useEffect, useState } from "react";

interface StudyModeProps {
  isActive: boolean;
  faceVisible: boolean;
  handVisible: boolean;
  onRemind: (text: string) => void;
}

const REMINDERS_AWAY = [
  "Eyes on your work, sir. Focus.",
  "Sir, your attention appears to have drifted. Kindly return to the task.",
  "Head up, sir. The books will not read themselves.",
];
const REMINDERS_PHONE = [
  "Sir, I detect a phone in your grip. Kindly set it down.",
  "That device is not on your study plan, sir.",
  "Put the phone away, sir. Discipline is the sharpest tool.",
];

const StudyMode = ({ isActive, faceVisible, handVisible, onRemind }: StudyModeProps) => {
  const [seconds, setSeconds] = useState(0);
  const [focusScore, setFocusScore] = useState(100);
  const [distractions, setDistractions] = useState(0);
  const [lastAlert, setLastAlert] = useState<string>("");
  const [awayMs, setAwayMs] = useState(0);
  const [phoneMs, setPhoneMs] = useState(0);

  // Session timer
  useEffect(() => {
    if (!isActive) { setSeconds(0); setFocusScore(100); setDistractions(0); setAwayMs(0); setPhoneMs(0); return; }
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [isActive]);

  // Monitor focus every 500ms
  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => {
      const STEP = 500;
      // No face → looking away
      if (!faceVisible) {
        setAwayMs(a => {
          const next = a + STEP;
          if (next >= 4000 && next - STEP < 4000) {
            const msg = REMINDERS_AWAY[Math.floor(Math.random() * REMINDERS_AWAY.length)];
            setLastAlert(msg); setDistractions(d => d + 1); onRemind(msg);
          }
          return next;
        });
        setFocusScore(f => Math.max(0, f - 1));
      } else {
        setAwayMs(0);
        setFocusScore(f => Math.min(100, f + 0.3));
      }
      // Hand raised in upper half → likely holding phone
      if (handVisible && faceVisible) {
        setPhoneMs(p => {
          const next = p + STEP;
          if (next >= 3000 && next - STEP < 3000) {
            const msg = REMINDERS_PHONE[Math.floor(Math.random() * REMINDERS_PHONE.length)];
            setLastAlert(msg); setDistractions(d => d + 1); onRemind(msg);
          }
          return next;
        });
        setFocusScore(f => Math.max(0, f - 0.8));
      } else {
        setPhoneMs(0);
      }
    }, 500);
    return () => clearInterval(t);
  }, [isActive, faceVisible, handVisible, onRemind]);

  useEffect(() => {
    if (!lastAlert) return;
    const t = setTimeout(() => setLastAlert(""), 4000);
    return () => clearTimeout(t);
  }, [lastAlert]);

  if (!isActive) return null;

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const status = awayMs >= 4000 ? "DISTRACTED" : phoneMs >= 3000 ? "PHONE DETECTED" : "FOCUSED";
  const statusColor = status === "FOCUSED" ? "text-primary" : "text-orange-400";

  return (
    <div className="fixed inset-0 z-[40] pointer-events-none">
      {/* Corner brackets */}
      <div className="absolute inset-6 border border-primary/20 rounded-sm">
        <div className="absolute -top-px -left-px w-10 h-10 border-l-2 border-t-2 border-primary" />
        <div className="absolute -top-px -right-px w-10 h-10 border-r-2 border-t-2 border-primary" />
        <div className="absolute -bottom-px -left-px w-10 h-10 border-l-2 border-b-2 border-primary" />
        <div className="absolute -bottom-px -right-px w-10 h-10 border-r-2 border-b-2 border-primary" />
      </div>

      {/* Top title bar */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="font-orbitron text-primary text-lg tracking-[0.5em] drop-shadow-[0_0_8px_hsl(195,100%,50%)]">
          S.T.A.R.K. STUDY PROTOCOL
        </div>
        <div className="font-mono text-[10px] text-primary/60 tracking-[0.3em]">SUPERVISED LEARNING SESSION · ACTIVE</div>
      </div>

      {/* Top-right session HUD */}
      <div className="absolute top-24 right-10 w-64 bg-background/40 backdrop-blur-sm border border-primary/30 rounded-sm p-3 font-mono text-[11px] text-primary">
        <div className="flex justify-between border-b border-primary/20 pb-1 mb-2">
          <span className="tracking-widest">SESSION</span>
          <span className="text-primary/60">STARK.OS v9</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between"><span className="text-primary/60">TIME</span><span className="text-2xl font-orbitron">{mm}:{ss}</span></div>
          <div className="flex justify-between"><span className="text-primary/60">STATUS</span><span className={statusColor + " font-bold"}>{status}</span></div>
          <div className="flex justify-between"><span className="text-primary/60">DISTRACTIONS</span><span>{distractions}</span></div>
          <div className="pt-1">
            <div className="flex justify-between text-[10px] mb-0.5"><span className="text-primary/60">FOCUS INDEX</span><span>{Math.round(focusScore)}%</span></div>
            <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-cyan-300 transition-all duration-500" style={{ width: `${focusScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Left panel — supervision channels */}
      <div className="absolute top-24 left-10 w-56 bg-background/40 backdrop-blur-sm border border-primary/30 rounded-sm p-3 font-mono text-[10px] text-primary space-y-1.5">
        <div className="tracking-widest border-b border-primary/20 pb-1 mb-1">SUPERVISION</div>
        {[
          { k: "GAZE TRACKING", v: faceVisible ? "LOCKED" : "LOST", warn: !faceVisible },
          { k: "POSTURE", v: faceVisible ? "UPRIGHT" : "UNKNOWN", warn: !faceVisible },
          { k: "PHONE DETECT", v: handVisible ? "SIGNAL" : "CLEAR", warn: handVisible },
          { k: "AMBIENT NOISE", v: "NOMINAL" },
          { k: "SUIT MONITOR", v: "STANDBY" },
        ].map(row => (
          <div key={row.k} className="flex justify-between">
            <span className="text-primary/60">{row.k}</span>
            <span className={row.warn ? "text-orange-400" : "text-primary"}>{row.v}</span>
          </div>
        ))}
      </div>

      {/* Center reactor pulse ring */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative w-[420px] h-[420px] opacity-30">
          <div className="absolute inset-0 rounded-full border border-primary/40 animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-8 rounded-full border border-primary/30 animate-[spin_30s_linear_infinite_reverse]" />
          <div className="absolute inset-20 rounded-full border-2 border-primary/50" />
          <div className="absolute inset-32 rounded-full border border-primary/60 animate-pulse" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-primary/20 blur-xl animate-pulse" />
        </div>
      </div>

      {/* Alert banner */}
      {lastAlert && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 animate-fade-in">
          <div className="flex items-center gap-3 px-6 py-3 bg-orange-500/10 border border-orange-400/60 rounded-sm backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <div className="font-mono text-sm text-orange-300 tracking-wide">{lastAlert}</div>
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] text-primary/50 tracking-[0.3em]">
        SAY OR TYPE "MODE END" TO EXIT SUPERVISION
      </div>
    </div>
  );
};

export default StudyMode;
