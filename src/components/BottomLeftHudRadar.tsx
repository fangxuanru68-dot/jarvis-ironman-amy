const BottomLeftHudRadar = ({ size = 140 }: { size?: number }) => {
  const c = 60;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-full animate-arc-pulse"
        style={{
          background: "radial-gradient(circle, hsl(195 100% 50% / 0.08) 0%, transparent 65%)",
          filter: "blur(8px)",
        }}
      />

      {/* === LAYER 1: Outermost tick ring — slow CW === */}
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full" style={{ animation: "rotate-slow 50s linear infinite" }}>
        <circle cx={c} cy={c} r={56} fill="none" stroke="hsl(195 100% 55% / 0.2)" strokeWidth="0.8" />
        {Array.from({ length: 90 }).map((_, i) => {
          const a = (i * 4) * Math.PI / 180;
          const isMajor = i % 9 === 0;
          const isMid = i % 3 === 0;
          const len = isMajor ? 6 : isMid ? 3 : 1.5;
          return (
            <line key={i}
              x1={c + Math.cos(a) * 56} y1={c + Math.sin(a) * 56}
              x2={c + Math.cos(a) * (56 - len)} y2={c + Math.sin(a) * (56 - len)}
              stroke={`hsl(195 100% 60% / ${isMajor ? 0.6 : isMid ? 0.25 : 0.1})`}
              strokeWidth={isMajor ? 1 : 0.4}
            />
          );
        })}
      </svg>

      {/* === LAYER 2: Outer segmented arcs — slow CCW === */}
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full" style={{ animation: "rotate-reverse 35s linear infinite" }}>
        {/* 4 thick arc segments with gaps */}
        {Array.from({ length: 4 }).map((_, i) => {
          const gap = 12;
          const startDeg = i * 90 + gap;
          const endDeg = (i + 1) * 90 - gap;
          const arcR = 48;
          const s1 = (startDeg * Math.PI) / 180;
          const e1 = (endDeg * Math.PI) / 180;
          return (
            <path key={i}
              d={`M ${c + Math.cos(s1) * arcR} ${c + Math.sin(s1) * arcR} A ${arcR} ${arcR} 0 0 1 ${c + Math.cos(e1) * arcR} ${c + Math.sin(e1) * arcR}`}
              fill="none" stroke="hsl(195 100% 65% / 0.3)" strokeWidth="4" strokeLinecap="round"
            />
          );
        })}
        {/* Thin outline circle */}
        <circle cx={c} cy={c} r={50} fill="none" stroke="hsl(195 100% 60% / 0.12)" strokeWidth="0.5" />
        <circle cx={c} cy={c} r={45} fill="none" stroke="hsl(195 100% 60% / 0.08)" strokeWidth="0.5" />
      </svg>

      {/* === LAYER 3: Mid mechanical ring — slow CW === */}
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full" style={{ animation: "rotate-slow 28s linear infinite" }}>
        <circle cx={c} cy={c} r={38} fill="none" stroke="hsl(195 100% 55% / 0.25)" strokeWidth="1.5" />
        <circle cx={c} cy={c} r={36} fill="none" stroke="hsl(195 100% 55% / 0.1)" strokeWidth="0.5" strokeDasharray="4 3" />
        {/* 6 segment arcs */}
        {Array.from({ length: 6 }).map((_, i) => {
          const startDeg = i * 60 + 8;
          const endDeg = startDeg + 40;
          const arcR = 38;
          const s1 = (startDeg * Math.PI) / 180;
          const e1 = (endDeg * Math.PI) / 180;
          return (
            <path key={i}
              d={`M ${c + Math.cos(s1) * arcR} ${c + Math.sin(s1) * arcR} A ${arcR} ${arcR} 0 0 1 ${c + Math.cos(e1) * arcR} ${c + Math.sin(e1) * arcR}`}
              fill="none" stroke="hsl(195 100% 70% / 0.2)" strokeWidth="2.5" strokeLinecap="round"
            />
          );
        })}
        {/* Detail ticks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 15) * Math.PI / 180;
          const isMajor = i % 6 === 0;
          return (
            <line key={i}
              x1={c + Math.cos(a) * 34} y1={c + Math.sin(a) * 34}
              x2={c + Math.cos(a) * (isMajor ? 40 : 38)} y2={c + Math.sin(a) * (isMajor ? 40 : 38)}
              stroke={`hsl(195 100% 60% / ${isMajor ? 0.5 : 0.15})`}
              strokeWidth={isMajor ? 0.8 : 0.3}
            />
          );
        })}
      </svg>

      {/* === LAYER 4: Inner precision ring — very slow CCW === */}
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full" style={{ animation: "rotate-reverse 22s linear infinite" }}>
        <circle cx={c} cy={c} r={28} fill="none" stroke="hsl(195 100% 60% / 0.3)" strokeWidth="1" />
        <circle cx={c} cy={c} r={26} fill="none" stroke="hsl(195 100% 60% / 0.08)" strokeWidth="3" />
        {/* 3 bright arc highlights */}
        {Array.from({ length: 3 }).map((_, i) => {
          const startDeg = i * 120 + 15;
          const endDeg = startDeg + 50;
          const arcR = 28;
          const s1 = (startDeg * Math.PI) / 180;
          const e1 = (endDeg * Math.PI) / 180;
          return (
            <path key={i}
              d={`M ${c + Math.cos(s1) * arcR} ${c + Math.sin(s1) * arcR} A ${arcR} ${arcR} 0 0 1 ${c + Math.cos(e1) * arcR} ${c + Math.sin(e1) * arcR}`}
              fill="none" stroke="hsl(195 100% 75% / 0.3)" strokeWidth="2" strokeLinecap="round"
            />
          );
        })}
        {/* Small node dots */}
        {[0, 90, 180, 270].map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          return (
            <circle key={i}
              cx={c + Math.cos(a) * 28} cy={c + Math.sin(a) * 28} r={1.5}
              fill="hsl(195 100% 70% / 0.7)"
              className="animate-pulse-glow" style={{ animationDelay: `${i * 0.5}s` }}
            />
          );
        })}
      </svg>

      {/* === LAYER 5: Innermost ring + core === */}
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
        {/* Dark inner fill */}
        <circle cx={c} cy={c} r={18} fill="hsl(220 30% 8% / 0.6)" />
        <circle cx={c} cy={c} r={18} fill="none" stroke="hsl(195 100% 60% / 0.35)" strokeWidth="1.5" />
        <circle cx={c} cy={c} r={15} fill="none" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" strokeDasharray="2 2" className="animate-rotate-slow" style={{ animationDuration: "15s", transformOrigin: "60px 60px" }} />
        
        {/* Crosshair */}
        <line x1={c} y1={c - 10} x2={c} y2={c - 5} stroke="hsl(195 100% 70% / 0.5)" strokeWidth="0.8" />
        <line x1={c} y1={c + 5} x2={c} y2={c + 10} stroke="hsl(195 100% 70% / 0.5)" strokeWidth="0.8" />
        <line x1={c - 10} y1={c} x2={c - 5} y2={c} stroke="hsl(195 100% 70% / 0.5)" strokeWidth="0.8" />
        <line x1={c + 5} y1={c} x2={c + 10} y2={c} stroke="hsl(195 100% 70% / 0.5)" strokeWidth="0.8" />

        {/* Core center dot */}
        <circle cx={c} cy={c} r={3} fill="hsl(195 100% 80% / 0.6)" className="animate-pulse-glow" />
        <circle cx={c} cy={c} r={5} fill="none" stroke="hsl(195 100% 60% / 0.25)" strokeWidth="0.5" />
        <circle cx={c} cy={c} r={1.5} fill="hsl(195 100% 95% / 0.8)" />
      </svg>

      {/* Small transparent side panels (horizontal bars flanking the disc) */}
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
        {/* Left bar */}
        <rect x={2} y={55} width={14} height={10} rx={1} fill="hsl(195 100% 50% / 0.06)" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
        <line x1={4} y1={58} x2={14} y2={58} stroke="hsl(195 100% 60% / 0.2)" strokeWidth="0.4" />
        <line x1={4} y1={60} x2={12} y2={60} stroke="hsl(195 100% 60% / 0.15)" strokeWidth="0.4" />
        <line x1={4} y1={62} x2={10} y2={62} stroke="hsl(195 100% 60% / 0.1)" strokeWidth="0.4" />
        {/* Right bar */}
        <rect x={104} y={55} width={14} height={10} rx={1} fill="hsl(195 100% 50% / 0.06)" stroke="hsl(195 100% 50% / 0.15)" strokeWidth="0.5" />
        <line x1={106} y1={58} x2={116} y2={58} stroke="hsl(195 100% 60% / 0.2)" strokeWidth="0.4" />
        <line x1={106} y1={60} x2={114} y2={60} stroke="hsl(195 100% 60% / 0.15)" strokeWidth="0.4" />
        <line x1={106} y1={62} x2={112} y2={62} stroke="hsl(195 100% 60% / 0.1)" strokeWidth="0.4" />
      </svg>
    </div>
  );
};

export default BottomLeftHudRadar;
