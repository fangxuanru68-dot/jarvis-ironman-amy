// Original hooded metal-mask emblem inspired by the user's reference.
export default function DoomEmblem({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 220" className={className} role="img" aria-label="Doom emblem">
      <path d="M100 6 150 30 182 86 176 150 140 196 100 214 60 196 24 150 18 86 50 30Z" fill="hsl(var(--secondary))" stroke="hsl(var(--doom-gold))" strokeWidth="3" />
      <path d="M100 26 140 46 164 92 158 140 100 120 42 140 36 92 60 46Z" fill="hsl(var(--background))" />
      <path d="M58 100 92 108 88 124 52 118Z M142 100 108 108 112 124 148 118Z" fill="hsl(var(--primary))" className="doom-eyes" />
      <path d="M100 112 112 152 100 168 88 152Z" fill="hsl(var(--secondary))" stroke="hsl(var(--foreground) / .6)" />
      <path d="M50 150 Q100 200 150 150" fill="none" stroke="hsl(var(--foreground) / .85)" strokeWidth="7" strokeLinecap="round" />
      <path d="M86 176 100 204 114 176" fill="none" stroke="hsl(var(--doom-gold))" strokeWidth="4" />
    </svg>
  );
}
