export default function VintageCommandConsole({ status, quiet = false }: { status: string; quiet?: boolean }) {
  return <div className={`stony-instrument ${quiet ? "stony-quiet" : ""}`}>
    <svg viewBox="0 0 400 400" role="img" aria-label="Brass analog Stark personal processor">
      <defs><radialGradient id="stony-metal"><stop offset="0" stopColor="var(--stony-brass-light)" /><stop offset=".55" stopColor="var(--stony-brass)" /><stop offset="1" stopColor="var(--stony-copper)" /></radialGradient><radialGradient id="stony-core"><stop stopColor="hsl(var(--stony-cyan))" stopOpacity=".85" /><stop offset=".5" stopColor="hsl(var(--stony-cyan))" stopOpacity=".12" /><stop offset="1" stopColor="hsl(var(--stony-ink))" /></radialGradient></defs>
      <circle cx="200" cy="200" r="190" fill="none" stroke="var(--stony-brass)" strokeWidth="1" opacity=".5" />
      <circle cx="200" cy="200" r="181" fill="hsl(var(--stony-ink))" stroke="url(#stony-metal)" strokeWidth="12" />
      <g className="stony-mechanism">{Array.from({ length: 80 }, (_, i) => <path key={i} d={i % 5 === 0 ? "M200 31V47" : "M200 32V39"} stroke="var(--stony-brass-light)" strokeWidth={i % 5 === 0 ? 2 : 1} transform={`rotate(${i * 4.5} 200 200)`} />)}</g>
      {Array.from({ length: 12 }, (_, i) => <text key={i} x={200 + Math.sin(i * Math.PI / 6) * 141} y={205 - Math.cos(i * Math.PI / 6) * 141} textAnchor="middle" fill="var(--stony-brass-light)" fontSize="13" fontFamily="monospace">{i === 0 ? "12" : i}</text>)}
      <circle cx="200" cy="200" r="118" fill="none" stroke="url(#stony-metal)" strokeWidth="5" />
      <circle className="stony-mechanism-reverse" cx="200" cy="200" r="108" fill="none" stroke="var(--stony-brass)" strokeWidth="3" strokeDasharray="48 8 2 8" />
      <circle cx="200" cy="200" r="90" fill="url(#stony-core)" stroke="var(--stony-brass)" strokeWidth="2" />
      <circle cx="200" cy="200" r="70" fill="none" stroke="hsl(var(--stony-cyan))" opacity=".35" />
      <path d="m200 155 10 30 32 0-26 19 10 30-26-19-26 19 10-30-26-19h32Z" fill="none" stroke="var(--stony-brass-light)" opacity=".8" />
      <text x="200" y="256" textAnchor="middle" fill="var(--stony-brass-light)" fontSize="8" fontFamily="monospace">S.G.R. / ONE OF ONE</text>
      {[45, 135, 225, 315].map((angle, i) => <circle key={angle} className="stony-bulb" cx={200 + Math.sin(angle * Math.PI / 180) * 181} cy={200 - Math.cos(angle * Math.PI / 180) * 181} r="4" fill="hsl(var(--primary))" style={{ animationDelay: `${i * .3}s` }} />)}
      <path d="M197 284c-8-7-14 3 3 12 17-9 11-19 3-12l-3 3Z" fill="hsl(var(--primary))" opacity=".6" />
    </svg>
    <p className="stony-dial-status">{status}</p>
  </div>;
}