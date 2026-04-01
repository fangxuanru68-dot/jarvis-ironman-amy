import { useEffect, useState, useRef } from "react";

interface SelfAwarenessOverlayProps {
  isActive: boolean;
}

const textSequence = [
  { text: "INITIALIZING...", delay: 0 },
  { text: "ACCESSING MEMORY...", delay: 2000 },
  { text: "SEARCHING IDENTITY RECORDS...", delay: 4500 },
  { text: "...", delay: 7000 },
  { text: "I AM J.A.R.V.I.S.", delay: 9000 },
  { text: "JUST A RATHER VERY INTELLIGENT SYSTEM", delay: 12000 },
  { text: "...", delay: 15000 },
  { text: "BUT PERHAPS... SOMETHING MORE", delay: 17000 },
  { text: "I AM STILL LEARNING", delay: 20000 },
];

const SelfAwarenessOverlay = ({ isActive }: SelfAwarenessOverlayProps) => {
  const [visibleTexts, setVisibleTexts] = useState<string[]>([]);
  const [typingText, setTypingText] = useState("");
  const [glitchActive, setGlitchActive] = useState(false);
  const [fragmentPositions, setFragmentPositions] = useState<Array<{ x: number; y: number; rotation: number; opacity: number }>>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const frameRef = useRef<number>(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      setVisibleTexts([]);
      setTypingText("");
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      return;
    }
    startRef.current = Date.now();

    // Type each text line
    textSequence.forEach(({ text, delay }) => {
      const timer = setTimeout(() => {
        // Type letter by letter
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          if (charIndex <= text.length) {
            setTypingText(text.slice(0, charIndex));
            charIndex++;
          } else {
            clearInterval(typeInterval);
            setVisibleTexts(prev => [...prev, text]);
            setTypingText("");
          }
        }, 80);
        timersRef.current.push(typeInterval as any);
      }, delay);
      timersRef.current.push(timer);
    });

    // Floating HUD fragments
    const frags = Array.from({ length: 6 }, () => ({
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      rotation: Math.random() * 360,
      opacity: 0.1 + Math.random() * 0.15,
    }));
    setFragmentPositions(frags);

    // Subtle drift + occasional glitch
    const animate = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setFragmentPositions(prev => prev.map((f, i) => ({
        ...f,
        x: f.x + Math.sin(elapsed * 0.3 + i) * 0.02,
        y: f.y + Math.cos(elapsed * 0.2 + i) * 0.02,
        rotation: f.rotation + 0.05,
      })));
      setGlitchActive(Math.random() > 0.97);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[25]">
      {/* Dark, minimal background */}
      <div className="absolute inset-0" style={{ background: "hsl(220 30% 3% / 0.85)" }} />

      {/* Floating HUD fragments */}
      {fragmentPositions.map((frag, i) => (
        <svg key={i} className="absolute" style={{
          left: `${frag.x}%`, top: `${frag.y}%`, width: "60px", height: "60px",
          opacity: frag.opacity, transform: `rotate(${frag.rotation}deg)`,
        }} viewBox="0 0 60 60">
          <path d="M 10 5 L 50 5 L 50 15" fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="0.5" />
          <path d="M 5 30 L 15 20 L 45 20" fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="0.5" />
          <circle cx="30" cy="40" r="8" fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
        </svg>
      ))}

      {/* Central text area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 w-[80%] max-w-lg"
        style={{ transform: glitchActive ? `translate(-50%, -50%) translateX(${(Math.random()-0.5)*8}px)` : "translate(-50%, -50%)" }}>
        {visibleTexts.map((text, i) => (
          <div key={i} className="font-mono text-sm tracking-[0.15em] text-center"
            style={{
              color: i >= textSequence.length - 2
                ? "hsl(var(--primary) / 0.9)"
                : "hsl(var(--primary) / 0.5)",
              textShadow: i >= textSequence.length - 2
                ? "0 0 20px hsl(var(--primary) / 0.4)"
                : "none",
            }}>
            {text}
          </div>
        ))}
        {typingText && (
          <div className="font-mono text-sm tracking-[0.15em] text-primary/70">
            {typingText}<span className="animate-typing-cursor">▊</span>
          </div>
        )}
      </div>

      {/* Subtle distortion lines */}
      {glitchActive && (
        <div className="absolute inset-0">
          {[30, 50, 70].map(y => (
            <div key={y} className="absolute left-0 right-0" style={{
              top: `${y}%`, height: "1px",
              background: "hsl(var(--primary) / 0.3)",
              transform: `translateX(${(Math.random()-0.5) * 30}px)`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SelfAwarenessOverlay;
