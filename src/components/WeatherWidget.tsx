import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, CloudSnow, Wind } from "lucide-react";

export interface WeatherData {
  city: string;
  temp: number;
  condition: "sunny" | "cloudy" | "rain" | "snow" | "windy";
  high: number;
  low: number;
  humidity: number;
  wind: number;
  forecast: Array<{ day: string; hi: number; lo: number; cond: WeatherData["condition"] }>;
}

interface Props {
  data: WeatherData | null;
  onDismiss: () => void;
  duration?: number;
}

const ICONS: Record<WeatherData["condition"], typeof Cloud> = {
  sunny: Sun, cloudy: Cloud, rain: CloudRain, snow: CloudSnow, windy: Wind,
};

const LABELS: Record<WeatherData["condition"], string> = {
  sunny: "CLEAR", cloudy: "OVERCAST", rain: "RAIN", snow: "SNOW", windy: "WINDY",
};

const WeatherWidget = ({ data, onDismiss, duration = 12000 }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!data) { setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 600); }, duration);
    return () => clearTimeout(t);
  }, [data, duration, onDismiss]);

  if (!data) return null;
  const Icon = ICONS[data.condition];

  return (
    <div
      className="fixed z-[70] pointer-events-none"
      style={{
        top: "84px",
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "-20px"})`,
        opacity: visible ? 1 : 0,
        transition: "opacity 500ms, transform 500ms",
      }}
    >
      <div
        className="relative w-[420px] font-mono text-primary bg-background/80 backdrop-blur-md border border-primary/40 rounded-sm p-4"
        style={{ boxShadow: "0 0 40px hsl(195 100% 50% / 0.25), inset 0 0 30px hsl(195 100% 50% / 0.05)" }}
      >
        <div className="absolute -top-px -left-px w-6 h-6 border-l-2 border-t-2 border-primary" />
        <div className="absolute -top-px -right-px w-6 h-6 border-r-2 border-t-2 border-primary" />
        <div className="absolute -bottom-px -left-px w-6 h-6 border-l-2 border-b-2 border-primary" />
        <div className="absolute -bottom-px -right-px w-6 h-6 border-r-2 border-b-2 border-primary" />

        <div className="flex items-center justify-between border-b border-primary/20 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] tracking-[0.3em]">ATMOSPHERIC TELEMETRY</span>
          </div>
          <span className="text-[10px] text-primary/50 tracking-widest">STARK-MET // LIVE</span>
        </div>

        <div className="flex items-center gap-4">
          <Icon className="w-16 h-16 text-primary drop-shadow-[0_0_10px_hsl(195_100%_50%)]" strokeWidth={1.2} />
          <div className="flex-1">
            <div className="text-[10px] text-primary/60 tracking-widest">{data.city.toUpperCase()}</div>
            <div className="font-orbitron text-5xl leading-none">{data.temp}°</div>
            <div className="text-[10px] text-primary/70 tracking-widest mt-1">{LABELS[data.condition]}</div>
          </div>
          <div className="text-right space-y-1 text-[10px] text-primary/80">
            <div>H {data.high}° / L {data.low}°</div>
            <div>HUM {data.humidity}%</div>
            <div>WIND {data.wind} km/h</div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-primary/20">
          {data.forecast.map((f, i) => {
            const FI = ICONS[f.cond];
            return (
              <div key={i} className="flex flex-col items-center gap-1 text-[10px]">
                <span className="text-primary/60">{f.day}</span>
                <FI className="w-4 h-4 text-primary/80" strokeWidth={1.3} />
                <span className="text-primary">{f.hi}°</span>
                <span className="text-primary/40">{f.lo}°</span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-[9px] text-primary/40 tracking-widest">
          <span>◉ AUTO-DISMISS</span>
          <div className="flex-1 mx-2 h-px bg-primary/20 overflow-hidden">
            <div
              className="h-full bg-primary/70"
              style={{ width: "100%", animation: `weather-drain ${duration}ms linear forwards` }}
            />
          </div>
          <span>{Math.round(duration / 1000)}s</span>
        </div>
      </div>
      <style>{`@keyframes weather-drain { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
};

export default WeatherWidget;
