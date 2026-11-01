import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Shield, AudioLines, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  messageCount: number;
  onExit: () => void;
  onArchives: () => void;
  onAnalyse: () => void;
}

export default function DoomMode({ isListening, isSpeaking, isLoading, messageCount, onExit, onArchives, onAnalyse }: Props) {
  const [activating, setActivating] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setActivating(false), 2600);
    return () => clearTimeout(timer);
  }, []);
  const status = isLoading ? "STRATEGIC ANALYSIS" : isSpeaking ? "TRANSMITTING" : isListening ? "LISTENING" : "AWAITING DIRECTIVE";
  return (
    <section className="doom-dashboard fixed inset-0 z-10 bg-background" aria-label="Doctor Doom mode">
      <header className="doom-heading absolute left-6 top-6">
        <p className="font-mono text-[10px] tracking-widest text-primary">LATVERIA / SOVEREIGN INTELLIGENCE</p>
        <h1 className="mt-2 font-serif text-4xl text-foreground">DOOM</h1>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">ENGINEERED BY VICTOR VON DOOM</p>
      </header>
      <div className="doom-main flex h-full flex-col items-center justify-center px-6">
        <div className={`doom-core relative aspect-square w-64 sm:w-80 ${isLoading ? "doom-thinking" : ""} ${isListening || isSpeaking ? "doom-active" : ""}`}>
          <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full text-primary" aria-label="Arcane mechanical energy core" role="img">
            <g fill="none" stroke="currentColor">
              <g className="doom-ring">
                <circle cx="160" cy="160" r="151" strokeWidth="1" opacity=".35" />
                <circle cx="160" cy="160" r="141" strokeDasharray="2 10" strokeWidth="5" opacity=".6" />
                <path d="M160 31 272 95 272 225 160 289 48 225 48 95Z" opacity=".5" />
                <path d="M160 31 48 225H272ZM48 95H272L160 289Z" opacity=".22" />
              </g>
              <g className="doom-ring-reverse">
                <circle cx="160" cy="160" r="114" strokeDasharray="55 9 4 9" strokeWidth="2" />
                <circle cx="160" cy="160" r="104" opacity=".3" />
                {[0, 60, 120, 180, 240, 300].map(angle => <path key={angle} d="M154 42H166L160 53Z" transform={`rotate(${angle} 160 160)`} />)}
              </g>
              <circle cx="160" cy="160" r="90" strokeWidth="8" opacity=".18" />
              <circle cx="160" cy="160" r="80" opacity=".5" />
            </g>
          </svg>
          <div className="doom-energy absolute inset-[27%] rounded-full border border-primary/40 flex items-center justify-center">
            <Shield className="h-16 w-16 text-foreground/80" strokeWidth={0.8} />
          </div>
        </div>
        <p className="mt-5 font-mono text-[10px] tracking-widest text-primary">DOOM CORE / {status}</p>
        <h2 className="mt-3 text-center font-serif text-xl sm:text-2xl text-foreground" aria-live="polite">{activating ? "DOOM PROTOCOL ACTIVATED" : "The Sovereign Intelligence"}</h2>
        <p className="mt-2 text-center font-serif text-sm italic text-muted-foreground">{activating ? "The age of ordinary intelligence is over." : "Science. Sorcery. Absolute precision."}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" onClick={onArchives}><BookOpen /> Imperial archives</Button>
          <Button variant="outline" size="sm" onClick={onAnalyse}><BrainCircuit /> Strategic analysis</Button>
        </div>
      </div>
      <footer className="doom-footer absolute bottom-14 left-6 right-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="font-mono text-[9px] text-muted-foreground space-y-1">
          <p className="text-primary">SYSTEM SOVEREIGNTY / DOOM</p>
          <p>IMPERIAL ARCHIVES / {messageCount} MESSAGES</p>
          <p>LATVERIA NETWORK / SIMULATION</p>
        </div>
        <div className="flex items-center gap-3">
          <AudioLines className="h-5 w-5 text-primary/60" />
          <Button variant="ghost" size="sm" onClick={onExit}><ArrowLeft /> Jarvis</Button>
        </div>
      </footer>
    </section>
  );
}