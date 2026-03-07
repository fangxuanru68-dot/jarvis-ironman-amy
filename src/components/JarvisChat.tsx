import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import ArcReactor from "./ArcReactor";
import FullScreenCamera from "./FullScreenCamera";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

type MessageContent = string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
type Message = { role: "user" | "assistant"; content: MessageContent };
type DisplayMessage = { role: "user" | "assistant"; content: string; images?: string[] };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jarvis-chat`;

// Classic JARVIS movie lines
const CLASSIC_TRIGGERS: Record<string, string> = {
  "good morning": "Good morning, sir. It's a beautiful day. The weather in Malibu is 72 degrees with scattered clouds. The surf conditions are fair with waist to shoulder high lines.",
  "早上好": "Good morning, sir. All systems are online and functioning normally.",
  "status report": "All systems nominal, sir. Mark suits are fully charged and operational. No security threats detected in the perimeter.",
  "状态报告": "All systems nominal, sir. No threats detected. Arc reactor output is steady at 3 gigajoules per second.",
  "run diagnostics": "Running full diagnostics now, sir... All primary systems are online. Repulsor efficiency at 97%. Flight stabilizers calibrated. Weapons systems on standby. You are good to go, sir.",
  "运行诊断": "Running diagnostics, sir... All systems are functioning within normal parameters. You are cleared for all operations.",
  "suit up": "Right away, sir. Initializing suit assembly sequence. Mark XLII is standing by for deployment.",
  "准备战甲": "Suit assembly initiated, sir. All components are in position. Shall I proceed with full deployment?",
  "what's my schedule": "You have a board meeting at 10 AM, followed by a weapons demo at the proving grounds. Miss Potts would also like to remind you about dinner tonight.",
  "power levels": "Arc reactor output holding steady at 3 gigajoules per second, sir. All auxiliary power systems are green.",
  "threat analysis": "Scanning perimeter now, sir. No immediate threats detected. Satellite feeds show clear skies. S.H.I.E.L.D. channels are quiet.",
  "威胁分析": "Scanning all frequencies, sir. No hostile activity detected in your vicinity. You are clear.",
  "play some music": "Shall I put on some AC/DC, sir? I believe 'Shoot to Thrill' is your current favorite.",
  "放点音乐": "Right away, sir. I have your playlist queued. Shall I start with your usual preference?",
  "hello jarvis": "At your service, sir. All systems are online and awaiting your command.",
  "你好": "Good day, sir. J.A.R.V.I.S. at your service. How may I assist you today?",
  "thank you jarvis": "Always a pleasure, sir.",
  "谢谢": "You're most welcome, sir. Is there anything else you require?",
};

const JarvisChat = () => {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [apiMessages, setApiMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { speak, stop: stopSpeech, isSpeaking } = useSpeechSynthesis();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
    // Preload voices
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const toggleVoice = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "zh-CN";

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInput(finalTranscript + interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        setTimeout(() => sendMessage(finalTranscript.trim()), 100);
      }
    };

    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const checkClassicTrigger = (text: string): string | null => {
    const lower = text.toLowerCase().trim();
    for (const [trigger, response] of Object.entries(CLASSIC_TRIGGERS)) {
      if (lower.includes(trigger)) return response;
    }
    return null;
  };

  const streamChat = async (allMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Connection failed" }));
      throw new Error(err.error || "Systems offline");
    }
    if (!resp.body) throw new Error("No stream");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") break;
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch { /* partial */ }
      }
    }

    if (assistantContent) {
      setApiMessages(prev => [...prev, { role: "assistant", content: assistantContent }]);
      if (voiceEnabled) speak(assistantContent);
    }
  };

  const sendMessage = async (text?: string) => {
    const msg = typeof text === "string" ? text : input.trim();
    if ((!msg) || isLoading) return;

    const images: string[] = [];
    if (cameraOn) {
      const captureFrame = (window as any).__jarvisCaptureFrame;
      if (captureFrame) {
        const frame = captureFrame();
        if (frame) images.push(frame);
      }
    }

    // Check for classic movie triggers first
    const classicResponse = checkClassicTrigger(msg);

    let apiContent: MessageContent;
    if (images.length > 0) {
      const parts: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];
      if (msg) parts.push({ type: "text", text: msg });
      images.forEach(img => parts.push({ type: "image_url", image_url: { url: img } }));
      apiContent = parts;
    } else {
      apiContent = msg;
    }

    const userApiMsg: Message = { role: "user", content: apiContent };
    const newApiMessages = [...apiMessages, userApiMsg];

    const displayMsg: DisplayMessage = { role: "user", content: msg, images: images.length > 0 ? images : undefined };
    setMessages(prev => [...prev, displayMsg]);
    setApiMessages(newApiMessages);
    setInput("");
    setIsLoading(true);
    setHasGreeted(true);
    stopSpeech();

    if (classicResponse) {
      // Use classic movie response
      setMessages(prev => [...prev, { role: "assistant", content: classicResponse }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: classicResponse }]);
      if (voiceEnabled) speak(classicResponse);
      setIsLoading(false);
      return;
    }

    try {
      await streamChat(newApiMessages);
    } catch (e) {
      const errMsg = `⚠ ${e instanceof Error ? e.message : "Systems offline."}`;
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const send = () => sendMessage();
  const showWelcome = !hasGreeted && messages.length === 0;

  return (
    <>
      {/* Full-screen camera background */}
      <FullScreenCamera isActive={cameraOn} />

      {/* Dark overlay on camera for readability */}
      {cameraOn && (
        <div className="fixed inset-0 z-[1] bg-gradient-to-t from-background via-background/70 to-transparent" />
      )}

      {/* Top HUD bar */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <ArcReactor size={32} isActive />
          <div>
            <div className="font-orbitron text-[10px] tracking-[0.3em] text-primary">J.A.R.V.I.S</div>
            <div className="font-mono text-[8px] text-muted-foreground">ONLINE · ALL SYSTEMS NOMINAL</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Camera toggle */}
          <button
            onClick={() => setCameraOn(!cameraOn)}
            className={`p-2 rounded-sm border transition-all ${cameraOn ? "border-primary/50 text-primary bg-primary/10" : "border-border/30 text-muted-foreground hover:text-primary"}`}
            title={cameraOn ? "关闭摄像头" : "开启摄像头"}
          >
            {cameraOn ? <Video size={14} /> : <VideoOff size={14} />}
          </button>
          {/* Voice toggle */}
          <button
            onClick={() => { setVoiceEnabled(!voiceEnabled); if (isSpeaking) stopSpeech(); }}
            className={`p-2 rounded-sm border transition-all ${voiceEnabled ? "border-primary/50 text-primary bg-primary/10" : "border-border/30 text-muted-foreground hover:text-primary"}`}
            title={voiceEnabled ? "关闭语音" : "开启语音"}
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>
      </div>

      {/* Main content - bottom area only */}
      <div className="fixed bottom-0 left-0 right-0 z-20 max-w-3xl mx-auto">
        {/* Welcome state */}
        {showWelcome && (
          <div className="flex flex-col items-center gap-4 pb-4 px-4 animate-fade-in-up">
            <ArcReactor size={120} isActive />
            <h1 className="font-orbitron text-xl tracking-[0.2em] text-primary">J.A.R.V.I.S</h1>
            <p className="font-rajdhani text-xs text-muted-foreground tracking-wider text-center">
              Just A Rather Very Intelligent System · At your service, sir.
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                "Good morning",
                "Status report",
                "Run diagnostics",
                "Suit up",
                "Threat analysis",
              ].map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 text-[10px] font-mono border border-border/50 rounded-sm bg-card/60 backdrop-blur-sm text-secondary-foreground hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages - compact, bottom-aligned */}
        {messages.length > 0 && (
          <div className="max-h-[40vh] overflow-y-auto px-4 pb-2 space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className={`animate-fade-in-up ${msg.role === "user" ? "flex justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="flex items-start gap-2">
                    <div className="shrink-0 mt-0.5">
                      <div className="w-5 h-5 rounded-full border border-primary/50 flex items-center justify-center">
                        <div className={`w-1.5 h-1.5 rounded-full bg-primary ${isSpeaking ? "animate-pulse" : "animate-pulse-glow"}`} />
                      </div>
                    </div>
                    <div className="bg-card/60 backdrop-blur-md border border-border/30 rounded-lg px-3 py-2 max-w-[85%]">
                      <div className="prose prose-sm prose-invert max-w-none font-rajdhani text-sm text-foreground/90 leading-relaxed [&_code]:font-mono [&_code]:text-primary [&_code]:bg-secondary/50 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-secondary/30 [&_pre]:border [&_pre]:border-border/30 [&_strong]:text-primary [&_p]:my-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="px-3 py-2 rounded-lg bg-primary/15 backdrop-blur-md border border-primary/20 max-w-[75%]">
                    <p className="font-rajdhani text-sm text-foreground">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-primary/50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: `${i * 0.3}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Voice activity indicator */}
        {(isListening || isSpeaking) && (
          <div className="flex justify-center pb-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card/60 backdrop-blur-md border border-primary/30">
              {isListening && (
                <>
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="font-mono text-[9px] text-destructive tracking-wider">LISTENING</span>
                  <div className="flex gap-0.5 ml-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="w-0.5 bg-destructive rounded-full animate-pulse" style={{ height: `${6+Math.random()*8}px`, animationDelay: `${i*0.1}s` }} />
                    ))}
                  </div>
                </>
              )}
              {isSpeaking && !isListening && (
                <>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-mono text-[9px] text-primary tracking-wider">J.A.R.V.I.S SPEAKING</span>
                  <div className="flex gap-0.5 ml-1">
                    {[0,1,2,3,4].map(i => (
                      <div key={i} className="w-0.5 bg-primary rounded-full animate-pulse-glow" style={{ height: `${4+Math.random()*10}px`, animationDelay: `${i*0.12}s` }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="px-4 pb-4">
          <div className="relative border border-border/50 rounded-lg bg-card/60 backdrop-blur-md overflow-hidden focus-within:border-primary/50 transition-colors duration-300">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="与 J.A.R.V.I.S 对话... 或点击麦克风语音输入"
              disabled={isLoading}
              className="w-full bg-transparent px-4 py-3 pr-24 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-full transition-all ${isListening ? "text-destructive bg-destructive/10 animate-pulse" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}
                title={isListening ? "停止录音" : "语音输入"}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                onClick={send}
                disabled={isLoading || !input.trim()}
                className="p-2 text-primary hover:text-primary/80 disabled:text-muted-foreground transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <p className="text-center font-mono text-[9px] text-muted-foreground/40 mt-1.5 tracking-wider">
            STARK INDUSTRIES · ENCRYPTED CHANNEL · {cameraOn ? "📹 VISION" : "STANDBY"}
          </p>
        </div>
      </div>
    </>
  );
};

export default JarvisChat;
