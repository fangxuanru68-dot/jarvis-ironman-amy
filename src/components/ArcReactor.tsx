const ArcReactor = ({ size = 200, isActive = false }: { size?: number; isActive?: boolean }) => {
  const r = size / 2;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-1000 ${isActive ? 'animate-arc-pulse' : ''}`}
        style={{
          background: `radial-gradient(circle, hsl(195 100% 50% / ${isActive ? 0.15 : 0.05}) 0%, transparent 70%)`,
        }}
      />
      
      {/* Outer ring */}
      <svg width={size} height={size} className="absolute animate-rotate-slow">
        <circle cx={r} cy={r} r={r - 4} fill="none" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="1" strokeDasharray="8 4" />
        <circle cx={r} cy={r} r={r - 12} fill="none" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="1.5" strokeDasharray="20 10" />
      </svg>
      
      {/* Inner ring - reverse rotation */}
      <svg width={size} height={size} className="absolute animate-rotate-reverse">
        <circle cx={r} cy={r} r={r - 24} fill="none" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="1" strokeDasharray="12 6" />
        {/* Tick marks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30) * Math.PI / 180;
          const inner = r - 30;
          const outer = r - 22;
          return (
            <line
              key={i}
              x1={r + Math.cos(angle) * inner}
              y1={r + Math.sin(angle) * inner}
              x2={r + Math.cos(angle) * outer}
              y2={r + Math.sin(angle) * outer}
              stroke={`hsl(195 100% 50% / ${i % 3 === 0 ? 0.8 : 0.3})`}
              strokeWidth={i % 3 === 0 ? 2 : 1}
            />
          );
        })}
      </svg>
      
      {/* Core */}
      <div 
        className="absolute rounded-full transition-all duration-500"
        style={{
          width: size * 0.25,
          height: size * 0.25,
          background: `radial-gradient(circle, hsl(195 100% 80%) 0%, hsl(195 100% 50%) 50%, hsl(195 100% 30%) 100%)`,
          boxShadow: isActive 
            ? `0 0 ${size * 0.15}px hsl(195 100% 50% / 0.8), 0 0 ${size * 0.3}px hsl(195 100% 50% / 0.4)`
            : `0 0 ${size * 0.1}px hsl(195 100% 50% / 0.4)`,
        }}
      />
      
      {/* Triangle segments */}
      <svg width={size} height={size} className="absolute">
        {Array.from({ length: 3 }).map((_, i) => {
          const angle = (i * 120 - 90) * Math.PI / 180;
          const nextAngle = ((i * 120 + 30) - 90) * Math.PI / 180;
          const innerR = r * 0.2;
          const outerR = r * 0.45;
          return (
            <path
              key={i}
              d={`M ${r + Math.cos(angle) * innerR} ${r + Math.sin(angle) * innerR} 
                  L ${r + Math.cos(angle) * outerR} ${r + Math.sin(angle) * outerR} 
                  A ${outerR} ${outerR} 0 0 1 ${r + Math.cos(nextAngle) * outerR} ${r + Math.sin(nextAngle) * outerR}
                  L ${r + Math.cos(nextAngle) * innerR} ${r + Math.sin(nextAngle) * innerR}`}
              fill="none"
              stroke="hsl(195 100% 50% / 0.5)"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default ArcReactor;
