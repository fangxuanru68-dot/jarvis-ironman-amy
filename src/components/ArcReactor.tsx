const ArcReactor = ({ size = 200, isActive = false }: { size?: number; isActive?: boolean }) => {
  const r = size / 2;
  const c = r; // center

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background glow */}
      <div
        className={`absolute inset-0 rounded-full ${isActive ? "animate-arc-pulse" : ""}`}
        style={{
          background: `radial-gradient(circle, hsl(195 100% 50% / ${isActive ? 0.2 : 0.05}) 0%, transparent 70%)`,
        }}
      />

      {/* Ring 1 - Outermost, thin, slow rotation */}
      <svg width={size} height={size} className="absolute animate-rotate-slow" style={{ animationDuration: "30s" }}>
        <circle cx={c} cy={c} r={r - 2} fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
        <circle cx={c} cy={c} r={r - 6} fill="none" stroke="hsl(195 100% 50% / 0.25)" strokeWidth="1" strokeDasharray="3 8" />
        {/* Small dots on outer ring */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 22.5) * Math.PI / 180;
          return (
            <rect
              key={i}
              x={c + Math.cos(a) * (r - 6) - 1.5}
              y={c + Math.sin(a) * (r - 6) - 1}
              width="3" height="2" rx="0.5"
              fill={`hsl(195 100% 50% / ${i % 2 === 0 ? 0.7 : 0.3})`}
            />
          );
        })}
      </svg>

      {/* Ring 2 - Second outer, thick glow band */}
      <svg width={size} height={size} className="absolute animate-rotate-reverse" style={{ animationDuration: "20s" }}>
        <circle cx={c} cy={c} r={r * 0.82} fill="none" stroke="hsl(195 100% 60% / 0.5)" strokeWidth="2.5" />
        <circle cx={c} cy={c} r={r * 0.82} fill="none" stroke="hsl(195 100% 80% / 0.15)" strokeWidth="6" />
        {/* Segment gaps */}
        {Array.from({ length: 4 }).map((_, i) => {
          const a = (i * 90 + 10) * Math.PI / 180;
          const a2 = (i * 90 + 30) * Math.PI / 180;
          return (
            <line key={i} x1={c + Math.cos(a) * r * 0.78} y1={c + Math.sin(a) * r * 0.78}
              x2={c + Math.cos(a2) * r * 0.86} y2={c + Math.sin(a2) * r * 0.86}
              stroke="hsl(195 100% 70% / 0.4)" strokeWidth="1.5" strokeLinecap="round" />
          );
        })}
      </svg>

      {/* Ring 3 - Middle detailed ring with tick marks */}
      <svg width={size} height={size} className="absolute animate-rotate-slow" style={{ animationDuration: "25s" }}>
        <circle cx={c} cy={c} r={r * 0.68} fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="1" strokeDasharray="6 3" />
        {/* Tick marks */}
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * 10) * Math.PI / 180;
          const inner = r * 0.64;
          const outer = r * (i % 3 === 0 ? 0.72 : 0.68);
          return (
            <line key={i}
              x1={c + Math.cos(a) * inner} y1={c + Math.sin(a) * inner}
              x2={c + Math.cos(a) * outer} y2={c + Math.sin(a) * outer}
              stroke={`hsl(195 100% 50% / ${i % 3 === 0 ? 0.7 : 0.25})`}
              strokeWidth={i % 3 === 0 ? 1.5 : 0.5}
            />
          );
        })}
        {/* Decorative dots array - top */}
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (-50 + i * 10) * Math.PI / 180;
          const dr = r * 0.75;
          return (
            <rect key={`d${i}`}
              x={c + Math.cos(a) * dr - 1.5} y={c + Math.sin(a) * dr - 1.5}
              width="3" height="3" rx="0.5"
              fill={`hsl(195 100% 60% / ${0.3 + i * 0.06})`}
            />
          );
        })}
        {/* Decorative dots array - bottom */}
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (160 + i * 7) * Math.PI / 180;
          const dr = r * 0.75;
          return (
            <rect key={`b${i}`}
              x={c + Math.cos(a) * dr - 1.5} y={c + Math.sin(a) * dr - 1.5}
              width="3" height="3" rx="0.5"
              fill={`hsl(195 100% 60% / ${0.3 + i * 0.04})`}
            />
          );
        })}
      </svg>

      {/* Ring 4 - Inner bright ring */}
      <svg width={size} height={size} className="absolute animate-rotate-reverse" style={{ animationDuration: "18s" }}>
        <circle cx={c} cy={c} r={r * 0.5} fill="none" stroke="hsl(195 100% 70% / 0.6)" strokeWidth="2" />
        <circle cx={c} cy={c} r={r * 0.5} fill="none" stroke="hsl(195 100% 90% / 0.1)" strokeWidth="5" />
        {/* Arc segments */}
        {Array.from({ length: 3 }).map((_, i) => {
          const startAngle = i * 120;
          const endAngle = startAngle + 80;
          const sr = r * 0.5;
          const x1 = c + Math.cos(startAngle * Math.PI / 180) * sr;
          const y1 = c + Math.sin(startAngle * Math.PI / 180) * sr;
          const x2 = c + Math.cos(endAngle * Math.PI / 180) * sr;
          const y2 = c + Math.sin(endAngle * Math.PI / 180) * sr;
          return (
            <path key={i}
              d={`M ${x1} ${y1} A ${sr} ${sr} 0 0 1 ${x2} ${y2}`}
              fill="none" stroke="hsl(195 100% 80% / 0.4)" strokeWidth="3" strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Ring 5 - Innermost thin ring */}
      <svg width={size} height={size} className="absolute animate-rotate-slow" style={{ animationDuration: "12s" }}>
        <circle cx={c} cy={c} r={r * 0.38} fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="0.8" strokeDasharray="4 4" />
        {/* Small decorative bars */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 45) * Math.PI / 180;
          return (
            <line key={i}
              x1={c + Math.cos(a) * r * 0.35} y1={c + Math.sin(a) * r * 0.35}
              x2={c + Math.cos(a) * r * 0.42} y2={c + Math.sin(a) * r * 0.42}
              stroke="hsl(195 100% 60% / 0.5)" strokeWidth="1.5" strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Core glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.32,
          height: size * 0.32,
          background: `radial-gradient(circle, hsl(195 100% 85% / 0.3) 0%, hsl(195 100% 50% / 0.15) 50%, transparent 100%)`,
          boxShadow: isActive
            ? `0 0 ${size * 0.15}px hsl(195 100% 50% / 0.5), 0 0 ${size * 0.3}px hsl(195 100% 50% / 0.2)`
            : `0 0 ${size * 0.08}px hsl(195 100% 50% / 0.3)`,
        }}
      />

      {/* Center text */}
      <div className="absolute flex items-center justify-center" style={{ width: size * 0.4, height: size * 0.4 }}>
        <span
          className="font-orbitron tracking-[0.15em] text-primary/90"
          style={{ fontSize: size * 0.07 }}
        >
          J.A.R.V.I.S
        </span>
      </div>
    </div>
  );
};

export default ArcReactor;
