import { useEffect, useRef, useState, useCallback } from "react";
import { X, Crop, Send, Loader2, MonitorUp, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Props {
  isActive: boolean;
  onExit: () => void;
  onSpeak: (text: string) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jarvis-chat`;

type Rect = { x: number; y: number; w: number; h: number };
type QA = { q: string; a: string; loading?: boolean };

const WorkMode = ({ isActive, onExit, onSpeak }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [drawing, setDrawing] = useState<Rect | null>(null);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QA[]>([]);
  const [busy, setBusy] = useState(false);

  const startShare = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 15 },
        audio: false,
      });
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
    setRect(null);
  }, []);

  useEffect(() => {
    if (!isActive) {
      stopShare();
      setHistory([]);
      setQuestion("");
      setError(null);
    }
  }, [isActive, stopShare]);

  useEffect(() => () => stopShare(), [stopShare]);

  // Drawing handlers on the video overlay
  const getPos = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLDivElement;
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
  };
  const onDown = (e: React.PointerEvent) => {
    if (!sharing) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    const p = getPos(e);
    setDrawing({ x: p.x, y: p.y, w: 0, h: 0 });
    setRect(null);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drawing) return;
    const p = getPos(e);
    setDrawing({ x: drawing.x, y: drawing.y, w: p.x - drawing.x, h: p.y - drawing.y });
  };
  const onUp = () => {
    if (!drawing) return;
    const norm: Rect = {
      x: Math.min(drawing.x, drawing.x + drawing.w),
      y: Math.min(drawing.y, drawing.y + drawing.h),
      w: Math.abs(drawing.w),
      h: Math.abs(drawing.h),
    };
    setDrawing(null);
    if (norm.w > 8 && norm.h > 8) setRect(norm);
  };

  // Capture frame; optionally crop
  const captureFrame = (crop?: Rect, boxSize?: { w: number; h: number }): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
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

  const ask = async () => {
    if (!sharing || busy) return;
    const q = question.trim() || (rect ? "Explain what's inside this highlighted region." : "Explain what's on my screen and what I should focus on.");
    const boxSize = containerRef.current ? { w: containerRef.current.clientWidth, h: containerRef.current.clientHeight } : null;
    const imgs: string[] = [];
    // Always include full screen for context
    const full = captureFrame();
    if (full) imgs.push(full);
    if (rect && boxSize) {
      const cropped = captureFrame(rect, boxSize);
      if (cropped) imgs.push(cropped);
    }
    if (!imgs.length) { setError("No frame captured yet"); return; }

    setBusy(true);
    setQuestion("");
    setHistory((h) => [...h, { q, a: "", loading: true }]);

    try {
      const content: any[] = [
        { type: "text", text: `You are in WORK MODE, helping the user with what's on their shared screen. Be concise (under 60 words), practical, direct. ${rect ? "The second image is the region the user highlighted — focus your explanation there." : ""}\n\nUser question: ${q}` },
        ...imgs.map((url) => ({ type: "image_url", image_url: { url } })),
      ];
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content }] }),
      });
      if (!resp.ok || !resp.body) throw new Error(`Request failed (${resp.status})`);
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let buf = "";
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
                const copy = [...h];
                copy[copy.length - 1] = { q, a: acc, loading: true };
                return copy;
              });
            }
          } catch {}
        }
      }
      setHistory((h) => {
        const copy = [...h];
        copy[copy.length - 1] = { q, a: acc, loading: false };
        return copy;
      });
      if (acc) onSpeak(acc);
    } catch (e: any) {
      setHistory((h) => {
        const copy = [...h];
        copy[copy.length - 1] = { q, a: `Systems offline: ${e?.message || "error"}`, loading: false };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-sm animate-fade-in flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-primary/30 bg-card/60">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <div className="font-orbitron text-sm tracking-[0.3em] text-primary">WORK MODE // J.A.R.V.I.S ASSIST</div>
        </div>
        <div className="flex items-center gap-2">
          {!sharing ? (
            <button onClick={startShare} className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono border border-primary/50 text-primary hover:bg-primary/10 rounded">
              <MonitorUp className="w-3.5 h-3.5" /> START SCREEN SHARE
            </button>
          ) : (
            <button onClick={stopShare} className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono border border-destructive/50 text-destructive hover:bg-destructive/10 rounded">
              <Trash2 className="w-3.5 h-3.5" /> STOP SHARE
            </button>
          )}
          <button onClick={onExit} className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono border border-border text-muted-foreground hover:text-primary hover:border-primary/50 rounded">
            <X className="w-3.5 h-3.5" /> EXIT (mode end)
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: shared screen viewport with drawing */}
        <div className="flex-1 relative bg-black/60 flex items-center justify-center overflow-hidden">
          {!sharing && (
            <div className="text-center max-w-md px-6">
              <div className="font-orbitron text-primary text-lg mb-3">Awaiting screen share</div>
              <p className="text-sm text-muted-foreground mb-6 font-rajdhani">
                Click <span className="text-primary">START SCREEN SHARE</span> and pick a tab, window, or your entire screen. Then drag on the video to highlight anything you want me to explain, sir.
              </p>
              {error && <div className="text-xs text-destructive font-mono">{error}</div>}
            </div>
          )}
          {sharing && (
            <div
              ref={containerRef}
              className="relative w-full h-full cursor-crosshair select-none"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
            >
              <video ref={videoRef} className="w-full h-full object-contain pointer-events-none" playsInline muted />
              {/* Highlight rect */}
              {(drawing || rect) && (() => {
                const r = drawing
                  ? { x: Math.min(drawing.x, drawing.x + drawing.w), y: Math.min(drawing.y, drawing.y + drawing.h), w: Math.abs(drawing.w), h: Math.abs(drawing.h) }
                  : rect!;
                return (
                  <div
                    className="absolute border-2 border-primary pointer-events-none"
                    style={{
                      left: r.x, top: r.y, width: r.w, height: r.h,
                      boxShadow: "0 0 0 9999px hsl(220 30% 3% / 0.35), 0 0 20px hsl(195 100% 50% / 0.6)",
                    }}
                  >
                    <div className="absolute -top-6 left-0 font-mono text-[10px] tracking-widest text-primary bg-background/80 px-1.5 py-0.5 border border-primary/40">
                      TARGETED REGION
                    </div>
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-primary" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-primary" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-primary" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-primary" />
                  </div>
                );
              })()}
              {rect && (
                <button
                  onClick={() => setRect(null)}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono border border-primary/40 bg-background/70 text-primary hover:bg-primary/10 rounded"
                >
                  <Crop className="w-3 h-3" /> CLEAR SELECTION
                </button>
              )}
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-primary/40 pointer-events-none" />
              <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-primary/40 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-primary/40 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-primary/40 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Right: assistant panel */}
        <div className="w-[380px] border-l border-primary/30 bg-card/70 flex flex-col">
          <div className="px-4 py-2 border-b border-primary/20 font-mono text-[10px] tracking-[0.3em] text-primary/80">
            ▸ ANALYSIS FEED
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {history.length === 0 && (
              <div className="text-xs text-muted-foreground font-rajdhani leading-relaxed">
                Share your screen, highlight anything unclear, then ask me a question. I'll explain, research, or summarise — like Mr. Stark's own assistant.
              </div>
            )}
            {history.map((qa, i) => (
              <div key={i} className="space-y-1.5">
                <div className="text-[11px] font-mono text-primary/70 tracking-wider">▸ YOU</div>
                <div className="text-sm text-foreground/90">{qa.q}</div>
                <div className="text-[11px] font-mono text-primary/70 tracking-wider pt-1">▸ JARVIS</div>
                <div className="text-sm text-foreground/90 prose prose-invert prose-sm max-w-none">
                  {qa.loading && !qa.a ? (
                    <span className="inline-flex items-center gap-2 text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> analysing…</span>
                  ) : (
                    <ReactMarkdown>{qa.a}</ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-primary/20 p-3 space-y-2">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
              placeholder={rect ? "Ask about the highlighted region…" : "Ask about what's on screen…"}
              rows={2}
              disabled={!sharing || busy}
              className="w-full resize-none bg-background/60 border border-primary/30 rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              onClick={ask}
              disabled={!sharing || busy}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-mono tracking-widest border border-primary bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed rounded"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {busy ? "ANALYSING" : rect ? "EXPLAIN SELECTION" : "ASK JARVIS"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkMode;
