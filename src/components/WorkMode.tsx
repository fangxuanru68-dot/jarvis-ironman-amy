import { useEffect, useRef, useState, useCallback } from "react";
import { X, Send, Loader2, MonitorUp, Camera, Trash2, Minus, Move, Crop, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Props {
  isActive: boolean;
  onExit: () => void;
  onSpeak: (text: string) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jarvis-chat`;

type Rect = { x: number; y: number; w: number; h: number };
type Shot = { id: number; url: string; label: string };
type QA = { q: string; a: string; loading?: boolean; thumb?: string };

const WorkMode = ({ isActive, onExit, onSpeak }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState({ x: 24, y: 100 });
  const [dragging, setDragging] = useState<{ dx: number; dy: number } | null>(null);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QA[]>([]);
  const [busy, setBusy] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);
  const [activeShotId, setActiveShotId] = useState<number | null>(null);
  const [sessionStart] = useState(Date.now());
  const [elapsed, setElapsed] = useState("00:00");
  const [cropMode, setCropMode] = useState(false);
  const [drawing, setDrawing] = useState<Rect | null>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  // Session timer
  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => {
      const s = Math.floor((Date.now() - sessionStart) / 1000);
      const m = Math.floor(s / 60).toString().padStart(2, "0");
      const ss = (s % 60).toString().padStart(2, "0");
      setElapsed(`${m}:${ss}`);
    }, 1000);
    return () => clearInterval(t);
  }, [isActive, sessionStart]);

  const startShare = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 15 }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setSharing(true);
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        setSharing(false);
        streamRef.current = null;
      });
    } catch (e: any) {
      setError(e?.message || "Screen share denied");
    }
  }, []);

  const stopShare = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setSharing(false);
  }, []);

  useEffect(() => {
    if (!isActive) {
      stopShare();
      setHistory([]);
      setShots([]);
      setQuestion("");
      setError(null);
      setActiveShotId(null);
      setCropMode(false);
    }
  }, [isActive, stopShare]);

  useEffect(() => () => stopShare(), [stopShare]);

  // Drag widget
  const onDragStart = (e: React.PointerEvent) => {
    if (!widgetRef.current) return;
    const r = widgetRef.current.getBoundingClientRect();
    setDragging({ dx: e.clientX - r.left, dy: e.clientY - r.top });
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const nx = Math.max(4, Math.min(window.innerWidth - 60, e.clientX - dragging.dx));
    const ny = Math.max(4, Math.min(window.innerHeight - 60, e.clientY - dragging.dy));
    setPos({ x: nx, y: ny });
  };
  const onDragEnd = () => setDragging(null);

  // Capture full frame or crop
  const captureFrame = (crop?: Rect, boxSize?: { w: number; h: number }): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const vw = video.videoWidth, vh = video.videoHeight;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    if (crop && boxSize) {
      const sx = (crop.x / boxSize.w) * vw;
      const sy = (crop.y / boxSize.h) * vh;
      const sw = (crop.w / boxSize.w) * vw;
      const sh = (crop.h / boxSize.h) * vh;
      canvas.width = Math.max(64, Math.round(sw));
      canvas.height = Math.max(64, Math.round(sh));
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    } else {
      const maxW = 1280;
      const scale = Math.min(1, maxW / vw);
      canvas.width = Math.round(vw * scale);
      canvas.height = Math.round(vh * scale);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    return canvas.toDataURL("image/jpeg", 0.82);
  };

  const takeScreenshot = () => {
    if (!sharing) { setError("Start screen share first"); return; }
    const url = captureFrame();
    if (!url) { setError("Capture failed"); return; }
    const s: Shot = { id: Date.now(), url, label: `SHOT ${shots.length + 1}` };
    setShots((p) => [...p, s]);
    setActiveShotId(s.id);
    setError(null);
  };

  // Crop overlay handlers
  const getPos = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLDivElement;
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onCropDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    const p = getPos(e);
    setDrawing({ x: p.x, y: p.y, w: 0, h: 0 });
  };
  const onCropMove = (e: React.PointerEvent) => {
    if (!drawing) return;
    const p = getPos(e);
    setDrawing({ x: drawing.x, y: drawing.y, w: p.x - drawing.x, h: p.y - drawing.y });
  };
  const onCropUp = () => {
    if (!drawing || !cropContainerRef.current) { setDrawing(null); return; }
    const norm: Rect = {
      x: Math.min(drawing.x, drawing.x + drawing.w),
      y: Math.min(drawing.y, drawing.y + drawing.h),
      w: Math.abs(drawing.w),
      h: Math.abs(drawing.h),
    };
    setDrawing(null);
    if (norm.w < 10 || norm.h < 10) return;
    const box = { w: cropContainerRef.current.clientWidth, h: cropContainerRef.current.clientHeight };
    const url = captureFrame(norm, box);
    if (url) {
      const s: Shot = { id: Date.now(), url, label: `CROP ${shots.length + 1}` };
      setShots((p) => [...p, s]);
      setActiveShotId(s.id);
    }
    setCropMode(false);
  };

  const ask = async () => {
    if (busy) return;
    const activeShot = shots.find((s) => s.id === activeShotId);
    const q = question.trim() || (activeShot ? "Explain what's in this screenshot and what I should do." : "What can you help me with, sir?");
    setBusy(true);
    setQuestion("");
    const thumb = activeShot?.url;
    setHistory((h) => [...h, { q, a: "", loading: true, thumb }]);

    try {
      const content: any[] = [
        { type: "text", text: `You are in WORK MODE — a floating desktop assistant helping the user with their tasks. Be concise (under 60 words), practical, actionable. Suggest concrete next steps.\n\nUser: ${q}` },
      ];
      if (activeShot) content.push({ type: "image_url", image_url: { url: activeShot.url } });

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content }] }),
      });
      if (!resp.ok || !resp.body) throw new Error(`Request failed (${resp.status})`);
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let acc = "", buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          const s = line.trim();
          if (!s.startsWith("data:")) continue;
          const data = s.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const j = JSON.parse(data);
            const delta = j?.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setHistory((h) => {
                const c = [...h];
                c[c.length - 1] = { ...c[c.length - 1], a: acc, loading: true };
                return c;
              });
            }
          } catch {}
        }
      }
      setHistory((h) => {
        const c = [...h];
        c[c.length - 1] = { ...c[c.length - 1], a: acc, loading: false };
        return c;
      });
      if (acc) onSpeak(acc);
    } catch (e: any) {
      setHistory((h) => {
        const c = [...h];
        c[c.length - 1] = { ...c[c.length - 1], a: `Systems offline: ${e?.message || "error"}`, loading: false };
        return c;
      });
    } finally {
      setBusy(false);
    }
  };

  if (!isActive) return null;

  // Minimized: just logo
  if (minimized) {
    return (
      <div
        ref={widgetRef}
        className="fixed z-[80] select-none"
        style={{ left: pos.x, top: pos.y }}
      >
        <div
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onDoubleClick={() => setMinimized(false)}
          className="relative w-14 h-14 rounded-full border-2 border-primary/70 bg-background/80 backdrop-blur-md flex items-center justify-center cursor-move animate-arc-pulse group"
          title="Double-click to expand"
        >
          <div className="absolute inset-1 rounded-full border border-primary/40 animate-rotate-slow" />
          <div className="absolute inset-2 rounded-full border border-primary/30 animate-rotate-reverse" />
          <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_12px_hsl(195_100%_60%)]" />
          <button
            onClick={(e) => { e.stopPropagation(); setMinimized(false); }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border border-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronUp className="w-3 h-3 text-primary" />
          </button>
        </div>
        <div className="mt-1 text-center font-mono text-[9px] tracking-widest text-primary/70">{elapsed}</div>
      </div>
    );
  }

  const activeShot = shots.find((s) => s.id === activeShotId);

  return (
    <>
      {/* Hidden video for capture */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Crop overlay (fullscreen when active) */}
      {cropMode && sharing && (
        <div className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-sm flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2 border-b border-primary/30">
            <div className="font-mono text-xs tracking-widest text-primary">▸ HIGHLIGHT REGION</div>
            <button onClick={() => setCropMode(false)} className="text-xs font-mono text-muted-foreground hover:text-primary">CANCEL</button>
          </div>
          <div
            ref={cropContainerRef}
            className="flex-1 relative bg-black/60 cursor-crosshair"
            onPointerDown={onCropDown}
            onPointerMove={onCropMove}
            onPointerUp={onCropUp}
          >
            {videoRef.current && (
              <img
                src={captureFrame() || ""}
                alt="screen"
                className="w-full h-full object-contain pointer-events-none"
              />
            )}
            {drawing && (() => {
              const r = {
                x: Math.min(drawing.x, drawing.x + drawing.w),
                y: Math.min(drawing.y, drawing.y + drawing.h),
                w: Math.abs(drawing.w), h: Math.abs(drawing.h),
              };
              return (
                <div className="absolute border-2 border-primary pointer-events-none"
                  style={{ left: r.x, top: r.y, width: r.w, height: r.h,
                    boxShadow: "0 0 0 9999px hsl(220 30% 3% / 0.5), 0 0 20px hsl(195 100% 50% / 0.6)" }} />
              );
            })()}
          </div>
        </div>
      )}

      {/* Floating widget */}
      <div
        ref={widgetRef}
        className="fixed z-[80] w-[340px] rounded-lg border border-primary/40 bg-background/85 backdrop-blur-xl shadow-[0_0_40px_hsl(195_100%_50%/0.25)] animate-fade-in overflow-hidden"
        style={{ left: pos.x, top: pos.y }}
      >
        {/* Header (drag handle) */}
        <div
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          className="flex items-center justify-between px-3 py-2 border-b border-primary/30 bg-card/70 cursor-move"
        >
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-full border border-primary/70 flex items-center justify-center">
              <div className="absolute inset-0.5 rounded-full border border-primary/40 animate-rotate-slow" />
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_hsl(195_100%_60%)]" />
            </div>
            <div className="font-orbitron text-[10px] tracking-[0.3em] text-primary">WORK MODE</div>
            <Move className="w-3 h-3 text-muted-foreground/60" />
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMinimized(true)} className="p-1 text-muted-foreground hover:text-primary" title="Minimise to logo">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button onClick={onExit} className="p-1 text-muted-foreground hover:text-destructive" title="Exit (mode end)">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Compact stats */}
        <div className="grid grid-cols-3 gap-px bg-primary/20 border-b border-primary/20">
          <div className="bg-card/60 px-2 py-1.5 text-center">
            <div className="font-mono text-[8px] tracking-widest text-muted-foreground">SESSION</div>
            <div className="font-mono text-xs text-primary">{elapsed}</div>
          </div>
          <div className="bg-card/60 px-2 py-1.5 text-center">
            <div className="font-mono text-[8px] tracking-widest text-muted-foreground">FEED</div>
            <div className={`font-mono text-xs ${sharing ? "text-primary" : "text-muted-foreground"}`}>{sharing ? "LIVE" : "OFF"}</div>
          </div>
          <div className="bg-card/60 px-2 py-1.5 text-center">
            <div className="font-mono text-[8px] tracking-widest text-muted-foreground">SHOTS</div>
            <div className="font-mono text-xs text-primary">{shots.length.toString().padStart(2, "0")}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-1 p-2 border-b border-primary/20">
          {!sharing ? (
            <button onClick={startShare} className="col-span-3 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-mono tracking-widest border border-primary/50 text-primary hover:bg-primary/10 rounded">
              <MonitorUp className="w-3 h-3" /> START SCREEN SHARE
            </button>
          ) : (
            <>
              <button onClick={takeScreenshot} className="flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-mono tracking-wider border border-primary/50 text-primary hover:bg-primary/10 rounded">
                <Camera className="w-3 h-3" /> SNAP
              </button>
              <button onClick={() => setCropMode(true)} className="flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-mono tracking-wider border border-primary/50 text-primary hover:bg-primary/10 rounded">
                <Crop className="w-3 h-3" /> CROP
              </button>
              <button onClick={stopShare} className="flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-mono tracking-wider border border-destructive/50 text-destructive hover:bg-destructive/10 rounded">
                <Trash2 className="w-3 h-3" /> STOP
              </button>
            </>
          )}
        </div>

        {/* Shot strip */}
        {shots.length > 0 && (
          <div className="flex gap-1 p-2 overflow-x-auto border-b border-primary/20 bg-black/20">
            {shots.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveShotId(s.id === activeShotId ? null : s.id)}
                className={`relative flex-shrink-0 w-16 h-10 rounded overflow-hidden border transition ${s.id === activeShotId ? "border-primary shadow-[0_0_8px_hsl(195_100%_50%/0.6)]" : "border-primary/30 opacity-70 hover:opacity-100"}`}
                title={s.label}
              >
                <img src={s.url} alt={s.label} className="w-full h-full object-cover" />
              </button>
            ))}
            {activeShot && (
              <button
                onClick={() => setShots((p) => p.filter((x) => x.id !== activeShot.id))}
                className="flex-shrink-0 w-6 h-10 flex items-center justify-center text-destructive/70 hover:text-destructive"
                title="Delete active shot"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Chat log */}
        <div className="max-h-[240px] overflow-y-auto px-3 py-2 space-y-3 bg-background/40">
          {history.length === 0 && (
            <div className="text-[11px] text-muted-foreground font-rajdhani leading-relaxed">
              Share your screen, snap or crop a region, then ask — I'll explain, research, or plan your next step. Shrink your main chat aside; this floats above everything, sir.
            </div>
          )}
          {history.map((qa, i) => (
            <div key={i} className="space-y-1">
              {qa.thumb && <img src={qa.thumb} alt="ctx" className="w-full max-h-24 object-cover rounded border border-primary/30" />}
              <div className="text-[9px] font-mono text-primary/70 tracking-widest">▸ YOU</div>
              <div className="text-xs text-foreground/90">{qa.q}</div>
              <div className="text-[9px] font-mono text-primary/70 tracking-widest pt-0.5">▸ JARVIS</div>
              <div className="text-xs text-foreground/90 prose prose-invert prose-sm max-w-none">
                {qa.loading && !qa.a
                  ? <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> analysing…</span>
                  : <ReactMarkdown>{qa.a}</ReactMarkdown>}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-primary/20 p-2 space-y-1.5 bg-card/50">
          {error && <div className="text-[10px] font-mono text-destructive">{error}</div>}
          {activeShot && (
            <div className="text-[9px] font-mono text-primary/70 tracking-widest">▸ CONTEXT: {activeShot.label}</div>
          )}
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
            placeholder={activeShot ? "Ask about this shot…" : "Ask JARVIS anything…"}
            rows={2}
            disabled={busy}
            className="w-full resize-none bg-background/60 border border-primary/30 rounded px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
          />
          <button
            onClick={ask}
            disabled={busy}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-mono tracking-widest border border-primary bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 rounded"
          >
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            {busy ? "ANALYSING" : "ASK JARVIS"}
          </button>
        </div>
      </div>
    </>
  );
};

export default WorkMode;
