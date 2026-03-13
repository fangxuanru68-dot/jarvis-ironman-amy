const ArcReactor = ({ size = 200, isActive = false }: { size?: number; isActive?: boolean }) => {
  const r = size / 2;
  const c = r;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background glow */}
      <div
        className={`absolute inset-0 rounded-full ${isActive ? "animate-arc-pulse" : ""}`}
        style={{
          background: `radial-gradient(circle, hsl(195 100% 50% / ${isActive ? 0.15 : 0.05}) 0%, transparent 70%)`,
        }}
      />

      {/* === LAYER 1: Outermost thick segmented ring === */}
      <svg width={size} height={size} className="absolute animate-rotate-slow" style={{ animationDuration: "40s" }}>
        {/* Outer border circle */}
        <circle cx={c} cy={c} r={r - 2} fill="none" stroke="hsl(195 100% 60% / 0.3)" strokeWidth="1.5" />
        {/* Thick segmented outer band - 4 arc segments with gaps */}
        {Array.from({ length: 4 }).map((_, i) => {
          const gap = 8;
          const startDeg = i * 90 + gap;
          const endDeg = (i + 1) * 90 - gap;
          const outerR = r - 4;
          const s1 = (startDeg * Math.PI) / 180;
          const e1 = (endDeg * Math.PI) / 180;
          const x1 = c + Math.cos(s1) * outerR;
          const y1 = c + Math.sin(s1) * outerR;
          const x2 = c + Math.cos(e1) * outerR;
          const y2 = c + Math.sin(e1) * outerR;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke="hsl(195 100% 65% / 0.5)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
        {/* Fine tick marks on outer ring */}
        {Array.from({ length: 72 }).map((_, i) => {
          const a = (i * 5 * Math.PI) / 180;
          const isMajor = i % 9 === 0;
          const len = isMajor ? 6 : 2.5;
          return (
            <line
              key={i}
              x1={c + Math.cos(a) * (r - 3)}
              y1={c + Math.sin(a) * (r - 3)}
              x2={c + Math.cos(a) * (r - 3 - len)}
              y2={c + Math.sin(a) * (r - 3 - len)}
              stroke={`hsl(195 100% 60% / ${isMajor ? 0.8 : 0.25})`}
              strokeWidth={isMajor ? 1.5 : 0.5}
            />
          );
        })}
      </svg>

      {/* === LAYER 2: Wide bright band with bracket segments (like reference thick ring) === */}
      <svg width={size} height={size} className="absolute animate-rotate-reverse" style={{ animationDuration: "25s" }}>
        {/* Thick translucent band */}
        <circle cx={c} cy={c} r={r * 0.82} fill="none" stroke="hsl(195 100% 55% / 0.12)" strokeWidth="8" />
        {/* Bright edge lines */}
        <circle cx={c} cy={c} r={r * 0.86} fill="none" stroke="hsl(195 100% 70% / 0.35)" strokeWidth="0.8" />
        <circle cx={c} cy={c} r={r * 0.78} fill="none" stroke="hsl(195 100% 70% / 0.4)" strokeWidth="1" />
        {/* Bracket-like thick arc segments */}
        {Array.from({ length: 3 }).map((_, i) => {
          const startDeg = i * 120 + 15;
          const span = 70;
          const arcR = r * 0.82;
          const s1 = (startDeg * Math.PI) / 180;
          const e1 = ((startDeg + span) * Math.PI) / 180;
          return (
            <path
              key={i}
              d={`M ${c + Math.cos(s1) * arcR} ${c + Math.sin(s1) * arcR} A ${arcR} ${arcR} 0 0 1 ${c + Math.cos(e1) * arcR} ${c + Math.sin(e1) * arcR}`}
              fill="none"
              stroke="hsl(195 100% 75% / 0.3)"
              strokeWidth="5"
              strokeLinecap="round"
            />
          );
        })}
        {/* Small cyan node markers (replacing yellow) */}
        {[30, 150, 270].map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          const dotR = r * 0.82;
          return (
            <circle
              key={i}
              cx={c + Math.cos(a) * dotR}
              cy={c + Math.sin(a) * dotR}
              r={2}
              fill="hsl(195 100% 70% / 0.7)"
            />
          );
        })}
      </svg>

      {/* === LAYER 3: Middle detailed ring with fine ticks === */}
      <svg width={size} height={size} className="absolute animate-rotate-slow" style={{ animationDuration: "20s" }}>
        <circle cx={c} cy={c} r={r * 0.68} fill="none" stroke="hsl(195 100% 50% / 0.35)" strokeWidth="1.2" />
        <circle cx={c} cy={c} r={r * 0.65} fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
        {/* Tick marks */}
        {Array.from({ length: 48 }).map((_, i) => {
          const a = (i * 7.5 * Math.PI) / 180;
          const isMajor = i % 6 === 0;
          const inner = r * 0.63;
          const outer = r * (isMajor ? 0.71 : 0.68);
          return (
            <line
              key={i}
              x1={c + Math.cos(a) * inner}
              y1={c + Math.sin(a) * inner}
              x2={c + Math.cos(a) * outer}
              y2={c + Math.sin(a) * outer}
              stroke={`hsl(195 100% 60% / ${isMajor ? 0.65 : 0.2})`}
              strokeWidth={isMajor ? 1.2 : 0.4}
            />
          );
        })}
        {/* Decorative small rectangles - data blocks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = ((i * 30 + 5) * Math.PI) / 180;
          const dr = r * 0.73;
          return (
            <rect
              key={i}
              x={c + Math.cos(a) * dr - 2}
              y={c + Math.sin(a) * dr - 1}
              width="4"
              height="2"
              rx="0.5"
              fill={`hsl(195 100% 60% / ${0.2 + (i % 3) * 0.15})`}
              transform={`rotate(${i * 30 + 5}, ${c + Math.cos(a) * dr}, ${c + Math.sin(a) * dr})`}
            />
          );
        })}
      </svg>

      {/* === LAYER 4: Inner bright ring with arc segments === */}
      <svg width={size} height={size} className="absolute animate-rotate-reverse" style={{ animationDuration: "15s" }}>
        <circle cx={c} cy={c} r={r * 0.52} fill="none" stroke="hsl(195 100% 70% / 0.5)" strokeWidth="2" />
        <circle cx={c} cy={c} r={r * 0.52} fill="none" stroke="hsl(195 100% 85% / 0.08)" strokeWidth="6" />
        {/* 3 arc highlight segments */}
        {Array.from({ length: 3 }).map((_, i) => {
          const startAngle = i * 120 + 10;
          const endAngle = startAngle + 60;
          const sr = r * 0.52;
          const x1 = c + Math.cos((startAngle * Math.PI) / 180) * sr;
          const y1 = c + Math.sin((startAngle * Math.PI) / 180) * sr;
          const x2 = c + Math.cos((endAngle * Math.PI) / 180) * sr;
          const y2 = c + Math.sin((endAngle * Math.PI) / 180) * sr;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${sr} ${sr} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke="hsl(195 100% 80% / 0.3)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* === LAYER 5: Innermost dashed ring === */}
      <svg width={size} height={size} className="absolute animate-rotate-slow" style={{ animationDuration: "12s" }}>
        <circle cx={c} cy={c} r={r * 0.4} fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="0.8" strokeDasharray="3 3" />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={c + Math.cos(a) * r * 0.37}
              y1={c + Math.sin(a) * r * 0.37}
              x2={c + Math.cos(a) * r * 0.43}
              y2={c + Math.sin(a) * r * 0.43}
              stroke="hsl(195 100% 60% / 0.4)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* === Scanning sweep arc (like reference bright sweep) === */}
      <svg width={size} height={size} className="absolute animate-rotate-slow" style={{ animationDuration: "6s" }}>
        <defs>
          <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(195 100% 70% / 0)" />
            <stop offset="50%" stopColor="hsl(195 100% 80% / 0.4)" />
            <stop offset="100%" stopColor="hsl(195 100% 70% / 0)" />
          </linearGradient>
        </defs>
        {(() => {
          const sweepR = r * 0.75;
          const startDeg = 0;
          const endDeg = 40;
          const s1 = (startDeg * Math.PI) / 180;
          const e1 = (endDeg * Math.PI) / 180;
          return (
            <path
              d={`M ${c + Math.cos(s1) * sweepR} ${c + Math.sin(s1) * sweepR} A ${sweepR} ${sweepR} 0 0 1 ${c + Math.cos(e1) * sweepR} ${c + Math.sin(e1) * sweepR}`}
              fill="none"
              stroke="url(#sweepGrad)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })()}
      </svg>

      {/* Core glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.34,
          height: size * 0.34,
          background: `radial-gradient(circle, hsl(195 100% 85% / 0.25) 0%, hsl(195 100% 50% / 0.12) 50%, transparent 100%)`,
          boxShadow: isActive
            ? `0 0 ${size * 0.12}px hsl(195 100% 50% / 0.4), 0 0 ${size * 0.25}px hsl(195 100% 50% / 0.15)`
            : `0 0 ${size * 0.06}px hsl(195 100% 50% / 0.2)`,
        }}
      />

      {/* Center text */}
      <div className="absolute flex items-center justify-center" style={{ width: size * 0.5, height: size * 0.5 }}>
        <span
          className="font-orbitron font-bold tracking-[0.12em] text-primary/90"
          style={{ fontSize: size * 0.085, textShadow: "0 0 8px hsl(195 100% 70% / 0.6)" }}
        >
          J.A.R.V.I.S.
        </span>
      </div>
    </div>
  );
};

export default ArcReactor;
