import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Eye, Smartphone, ShieldAlert } from "lucide-react";

type Landmark = { x: number; y: number; z: number };

interface StudyModeProps {
  isActive: boolean;
  faceVisible: boolean;
  faceBox: { x: number; y: number; w: number; h: number } | null;
  handLandmarks: Landmark[];
  onRemind: (text: string) => void;
  onStarkAlert?: (offenseCount: number) => void;
}

type OffenseKind = "phone" | "head_down" | "away";

const REMINDERS: Record<OffenseKind, string[]> = {
  phone: [
    "Peter, put the phone down. Homework, not TikTok.",
    "That device is not on your study plan, kid.",
    "Phone detected. Kindly set it aside, Mr. Parker.",
  ],
  head_down: [
    "Head up, Peter. Book on the desk, eyes on the page.",
    "Chin up, kid. Slouching does no favours to your posture — or your grades.",
    "Eyes forward, Peter. Focus.",
  ],
  away: [
    "Peter, your attention has drifted. Return to the task.",
    "I've lost your gaze, kid. Back to the book, please.",
    "Eyes on the work, Mr. Parker.",
  ],
};

const LABELS: Record<OffenseKind, string> = {
  phone: "PHONE DETECTED",
  head_down: "HEAD DOWN",
  away: "GAZE LOST",
};

const StudyMode = ({ isActive, faceVisible, faceBox, handLandmarks, onRemind }: StudyModeProps) => {
  const [seconds, setSeconds] = useState(0);
  const [focusScore, setFocusScore] = useState(100);
  const [phoneOffenses, setPhoneOffenses] = useState(0);
  const [totalDistractions, setTotalDistractions] = useState(0);
  const [starkAlert, setStarkAlert] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<{ kind: OffenseKind; text: string } | null>(null);

  // Timers per offense kind — must accumulate before firing
  const dwellRef = useRef<Record<OffenseKind, number>>({ phone: 0, head_down: 0, away: 0 });
  const cooldownRef = useRef<Record<OffenseKind, number>>({ phone: 0, head_down: 0, away: 0 });

  // Reset on toggle
  useEffect(() => {
    if (!isActive) {
      setSeconds(0); setFocusScore(100); setPhoneOffenses(0); setTotalDistractions(0);
      setStarkAlert(false); setCurrentAlert(null);
      dwellRef.current = { phone: 0, head_down: 0, away: 0 };
      cooldownRef.current = { phone: 0, head_down: 0, away: 0 };
    }
  }, [isActive]);

  // Session timer
  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [isActive]);

  // Detection heuristics
  const phoneDetected = (() => {
    if (handLandmarks.length < 21 || !faceBox) return false;
    // Hand raised into upper 2/3 of the frame AND near/around face → likely holding phone
    const wrist = handLandmarks[0];
    const indexTip = handLandmarks[8];
    const avgY = (wrist.y + indexTip.y) / 2;
    const faceCenterY = faceBox.y + faceBox.h / 2;
    return avgY < 0.75 && Math.abs(avgY - faceCenterY) < 0.35;
  })();

  const headDown = (() => {
    if (!faceBox) return false;
    // Face pushed to bottom of frame OR unusually small → user leaned/looked down
    return faceBox.y + faceBox.h > 0.9 || faceBox.h < 0.12;
  })();

  const away = !faceVisible && handLandmarks.length === 0;

  // Monitor loop
  useEffect(() => {
    if (!isActive) return;
    const STEP = 500;
    const DWELL_MS = 2500;
    const COOLDOWN_MS = 6000;
    const t = setInterval(() => {
      const now = Date.now();
      const evaluate = (kind: OffenseKind, active: boolean) => {
        if (!active) { dwellRef.current[kind] = 0; return; }
        dwellRef.current[kind] += STEP;
        if (dwellRef.current[kind] >= DWELL_MS && now - cooldownRef.current[kind] > COOLDOWN_MS) {
          cooldownRef.current[kind] = now;
          dwellRef.current[kind] = 0;
          const list = REMINDERS[kind];
          const msg = list[Math.floor(Math.random() * list.length)];
          setCurrentAlert({ kind, text: msg });
          setTotalDistractions(d => d + 1);
          onRemind(msg);
          toast.warning(LABELS[kind], { description: msg, duration: 4000 });
          if (kind === "phone") setPhoneOffenses(p => p + 1);
        }
      };
      // Phone has priority — if hand up near face, don't also count as head-down
      evaluate("phone", phoneDetected);
      evaluate("head_down", !phoneDetected && headDown);
      evaluate("away", !phoneDetected && !headDown && away);

      const distracted = phoneDetected || headDown || away;
      setFocusScore(f => distracted ? Math.max(0, f - 0.8) : Math.min(100, f + 0.3));
    }, STEP);
    return () => clearInterval(t);
  }, [isActive, phoneDetected, headDown, away, onRemind]);

  // Escalation: 3 phone offenses → notify Tony
  useEffect(() => {
    if (phoneOffenses >= 3 && !starkAlert) {
      setStarkAlert(true);
      const msg = "Enough, Peter. That's three strikes on the phone. I've flagged this session and notified Mr. Stark.";
      onRemind(msg);
      toast.error("MR. STARK NOTIFIED", {
        description: "Phone use exceeded threshold. Incident report dispatched.",
        duration: 8000,
      });
    }
  }, [phoneOffenses, starkAlert, onRemind]);

  // Auto-dismiss alert banner
  useEffect(() => {
    if (!currentAlert) return;
    const t = setTimeout(() => setCurrentAlert(null), 4500);
    return () => clearTimeout(t);
  }, [currentAlert]);

  if (!isActive) return null;

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const status = starkAlert ? "REPORTED" : phoneDetected ? "PHONE" : headDown ? "HEAD DOWN" : away ? "AWAY" : "FOCUSED";
  const statusColor = status === "FOCUSED" ? "text-primary" : status === "REPORTED" ? "text-red-400" : "text-orange-400";

  return (
    <div className="fixed inset-0 z-[40] pointer-events-none">
      {/* Frame */}
      <div className="absolute inset-6 border border-primary/20 rounded-sm">
        <div className="absolute -top-px -left-px w-10 h-10 border-l-2 border-t-2 border-primary" />
        <div className="absolute -top-px -right-px w-10 h-10 border-r-2 border-t-2 border-primary" />
        <div className="absolute -bottom-px -left-px w-10 h-10 border-l-2 border-b-2 border-primary" />
        <div className="absolute -bottom-px -right-px w-10 h-10 border-r-2 border-b-2 border-primary" />
      </div>

      {/* Title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="font-orbitron text-primary text-lg tracking-[0.5em] drop-shadow-[0_0_8px_hsl(195,100%,50%)]">
          S.T.A.R.K. STUDY PROTOCOL
        </div>
        <div className="font-mono text-[10px] text-primary/60 tracking-[0.3em]">SUPERVISION FOR: PETER PARKER</div>
      </div>

      {/* Session HUD */}
      <div className="absolute top-24 right-10 w-64 bg-background/40 backdrop-blur-sm border border-primary/30 rounded-sm p-3 font-mono text-[11px] text-primary">
        <div className="flex justify-between border-b border-primary/20 pb-1 mb-2">
          <span className="tracking-widest">SESSION</span>
          <span className="text-primary/60">STARK.OS v9</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between"><span className="text-primary/60">TIME</span><span className="text-2xl font-orbitron">{mm}:{ss}</span></div>
          <div className="flex justify-between"><span className="text-primary/60">STATUS</span><span className={statusColor + " font-bold"}>{status}</span></div>
          <div className="flex justify-between"><span className="text-primary/60">DISTRACTIONS</span><span>{totalDistractions}</span></div>
          <div className="flex justify-between">
            <span className="text-primary/60">PHONE STRIKES</span>
            <span className={phoneOffenses >= 3 ? "text-red-400 font-bold" : phoneOffenses > 0 ? "text-orange-400" : ""}>{phoneOffenses} / 3</span>
          </div>
          <div className="pt-1">
            <div className="flex justify-between text-[10px] mb-0.5"><span className="text-primary/60">FOCUS INDEX</span><span>{Math.round(focusScore)}%</span></div>
            <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-cyan-300 transition-all duration-500" style={{ width: `${focusScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Left panel */}
      <div className="absolute top-24 left-10 w-56 bg-background/40 backdrop-blur-sm border border-primary/30 rounded-sm p-3 font-mono text-[10px] text-primary space-y-1.5">
        <div className="tracking-widest border-b border-primary/20 pb-1 mb-1">SUPERVISION</div>
        {[
          { k: "GAZE TRACKING", v: faceVisible ? "LOCKED" : "LOST", warn: !faceVisible },
          { k: "POSTURE", v: headDown ? "SLOUCHED" : "UPRIGHT", warn: headDown },
          { k: "PHONE DETECT", v: phoneDetected ? "SIGNAL" : "CLEAR", warn: phoneDetected },
          { k: "AMBIENT NOISE", v: "NOMINAL" },
          { k: "STARK REPORT", v: starkAlert ? "SENT" : "STANDBY", warn: starkAlert },
        ].map(row => (
          <div key={row.k} className="flex justify-between">
            <span className="text-primary/60">{row.k}</span>
            <span className={row.warn ? "text-orange-400" : "text-primary"}>{row.v}</span>
          </div>
        ))}
      </div>

      {/* Center reactor pulse */}
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
      {currentAlert && !starkAlert && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 animate-fade-in">
          <div className="flex items-center gap-3 px-6 py-3 bg-orange-500/10 border border-orange-400/60 rounded-sm backdrop-blur-md min-w-[360px]">
            {currentAlert.kind === "phone" ? <Smartphone className="w-5 h-5 text-orange-300" /> :
             currentAlert.kind === "head_down" ? <Eye className="w-5 h-5 text-orange-300" /> :
             <AlertTriangle className="w-5 h-5 text-orange-300" />}
            <div>
              <div className="font-orbitron text-[10px] tracking-[0.3em] text-orange-400">{LABELS[currentAlert.kind]}</div>
              <div className="font-mono text-sm text-orange-200">{currentAlert.text}</div>
            </div>
          </div>
        </div>
      )}

      {/* Stark escalation overlay */}
      {starkAlert && (
        <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-red-950/30 animate-pulse" />
          <div className="relative w-[520px] bg-background/90 border-2 border-red-500 rounded-sm p-6 shadow-[0_0_60px_rgba(239,68,68,0.6)]">
            <div className="flex items-center gap-3 mb-3">
              <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
              <div>
                <div className="font-orbitron text-red-400 text-lg tracking-[0.3em]">INCIDENT REPORT</div>
                <div className="font-mono text-[10px] text-red-300/70 tracking-widest">STARK INDUSTRIES / SECURE CHANNEL</div>
              </div>
            </div>
            <div className="border-t border-red-500/30 pt-3 space-y-2 font-mono text-xs text-red-100">
              <div className="flex justify-between"><span className="text-red-300/60">RECIPIENT</span><span>ANTHONY E. STARK</span></div>
              <div className="flex justify-between"><span className="text-red-300/60">SUBJECT</span><span>P. PARKER — STUDY PROTOCOL BREACH</span></div>
              <div className="flex justify-between"><span className="text-red-300/60">OFFENSES</span><span className="text-red-400 font-bold">PHONE × {phoneOffenses}</span></div>
              <div className="flex justify-between"><span className="text-red-300/60">STATUS</span><span className="text-red-400">DELIVERED ✓</span></div>
              <div className="pt-2 text-red-200/90 italic">
                "Kid, I'm getting pings from your study session. We are going to have a talk about focus. — T.S."
              </div>
            </div>
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
