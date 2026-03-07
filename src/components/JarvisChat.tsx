import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Mic, MicOff, Image, X, Volume2, VolumeX } from "lucide-react";
import ArcReactor from "./ArcReactor";
import LiveCamera from "./LiveCamera";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

type MessageContent = string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
type Message = { role: "user" | "assistant"; content: MessageContent };
type DisplayMessage = { role: "user" | "assistant"; content: string; images?: string[] };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jarvis-chat`;

const JarvisChat = () => {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [apiMessages, setApiMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { speak, stop: stopSpeech, isSpeaking } = useSpeechSynthesis();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
    // Preload voices
    window.speechSynthesis?.getVoices();
  }, []);

  // Voice recognition - auto-send when done
  const toggleVoice = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
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
    recognition.lang = "zh-CN"; // Support Chinese

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
      // Auto-send when speech ends
      if (finalTranscript.trim()) {
        // Use timeout to let state update
        setTimeout(() => {
          sendMessage(finalTranscript.trim());
        }, 100);
      }
    };

    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // Image handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAttachedImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
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
      // Speak the response
      if (voiceEnabled) {
        speak(assistantContent);
      }
    }
  };

  const sendMessage = async (text?: string) => {
    const msg = typeof text === "string" ? text : input.trim();
    if ((!msg && attachedImages.length === 0) || isLoading) return;

    const images = [...attachedImages];

    // If camera is on, auto-capture a frame
    if (cameraOn) {
      const captureFrame = (window as any).__jarvisCaptureFrame;
      if (captureFrame) {
        const frame = captureFrame();
        if (frame) images.push(frame);
      }
    }

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

    const displayMsg: DisplayMessage = { role: "user", content: msg || "📷 Image sent", images: images.length > 0 ? images : undefined };
    setMessages(prev => [...prev, displayMsg]);
    setApiMessages(newApiMessages);
    setInput("");
    setAttachedImages([]);
    setIsLoading(true);
    setHasGreeted(true);

    // Stop any ongoing speech
    stopSpeech();

    try {
      await streamChat(newApiMessages);
    } catch (e) {
      const errMsg = `⚠ ${e instanceof Error ? e.message : "Systems offline. Attempting reconnection..."}`;
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const send = () => sendMessage();

  const showWelcome = !hasGreeted && messages.length === 0;

  return (
    <div className="flex h-screen w-full max-w-6xl mx-auto relative z-10 gap-4 px-4">
      {/* Left sidebar - Camera */}
      <div className="hidden md:flex flex-col w-64 pt-20 pb-6 gap-4 shrink-0">
        <LiveCamera isActive={cameraOn} onToggle={() => setCameraOn(!cameraOn)} />
        
        {/* Voice status */}
        <div className="border border-border/30 rounded-sm bg-card/30 backdrop-blur-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-orbitron text-[9px] tracking-[0.2em] text-muted-foreground">VOICE OUTPUT</span>
            <button
              onClick={() => { setVoiceEnabled(!voiceEnabled); if (isSpeaking) stopSpeech(); }}
              className={`p-1 rounded-sm transition-colors ${voiceEnabled ? "text-primary" : "text-muted-foreground"}`}
            >
              {voiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            </button>
          </div>
          {isSpeaking && (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-full animate-pulse-glow"
                    style={{ height: `${8 + Math.random() * 12}px`, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[9px] text-primary">SPEAKING</span>
            </div>
          )}
          {isListening && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="font-mono text-[9px] text-destructive">LISTENING</span>
            </div>
          )}
          {!isSpeaking && !isListening && (
            <span className="font-mono text-[9px] text-muted-foreground/50">STANDBY</span>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto pt-20 pb-4">
          {showWelcome && (
            <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in-up">
              <ArcReactor size={160} isActive />
              <h1 className="font-orbitron text-2xl tracking-[0.2em] text-primary">
                J.A.R.V.I.S
              </h1>
              <p className="font-rajdhani text-sm text-muted-foreground tracking-wider text-center max-w-md">
                Just A Rather Very Intelligent System
              </p>
              <p className="font-mono text-[10px] text-muted-foreground/50 text-center max-w-sm">
                开启摄像头让我看见你 · 点击麦克风与我对话 · 我会语音回应你
              </p>
              <div className="flex gap-2 mt-4 flex-wrap justify-center">
                {["你能做什么？", "Tell me about yourself", "Help me with code"].map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-4 py-2 text-xs font-mono border border-border/50 rounded-sm bg-card/50 text-secondary-foreground hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`mb-4 animate-fade-in-up ${msg.role === "user" ? "flex justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full border border-primary/50 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full bg-primary ${isSpeaking ? "animate-pulse" : "animate-pulse-glow"}`} />
                    </div>
                  </div>
                  <div className="prose prose-sm prose-invert max-w-none font-rajdhani text-foreground/90 leading-relaxed [&_code]:font-mono [&_code]:text-primary [&_code]:bg-secondary/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-secondary/30 [&_pre]:border [&_pre]:border-border/30 [&_strong]:text-primary [&_a]:text-primary [&_h1]:text-primary [&_h2]:text-primary [&_h3]:text-primary [&_h1]:font-orbitron [&_h2]:font-orbitron [&_h3]:font-orbitron">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              )}
              {msg.role === "user" && (
                <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 max-w-[80%]">
                  {msg.images && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {msg.images.map((img, j) => (
                        <img key={j} src={img} alt="Attached" className="w-20 h-20 object-cover rounded border border-primary/30" />
                      ))}
                    </div>
                  )}
                  <p className="font-rajdhani text-sm text-foreground">{msg.content}</p>
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-full border border-primary/50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
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

        {/* Attached images preview */}
        {attachedImages.length > 0 && (
          <div className="pb-2 flex gap-2 flex-wrap">
            {attachedImages.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img} alt="Preview" className="w-16 h-16 object-cover rounded border border-primary/30" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="pb-6 pt-2">
          <div className="relative border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden focus-within:border-primary/50 transition-colors duration-300">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="与 J.A.R.V.I.S 对话..."
              disabled={isLoading}
              className="w-full bg-transparent px-4 py-3 pr-28 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {/* Mobile camera toggle */}
              <button
                onClick={() => setCameraOn(!cameraOn)}
                className={`p-2 md:hidden transition-colors ${cameraOn ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                title="摄像头"
              >
                {cameraOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              {/* Voice input */}
              <button
                onClick={toggleVoice}
                className={`p-2 transition-colors ${isListening ? "text-destructive animate-pulse" : "text-muted-foreground hover:text-primary"}`}
                title={isListening ? "停止录音" : "语音输入"}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              {/* Image upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 text-muted-foreground hover:text-primary disabled:text-muted-foreground/50 transition-colors"
                title="上传图片"
              >
                <Image size={16} />
              </button>
              {/* Send */}
              <button
                onClick={send}
                disabled={isLoading || (!input.trim() && attachedImages.length === 0)}
                className="p-2 text-primary hover:text-primary/80 disabled:text-muted-foreground transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <p className="text-center font-mono text-[10px] text-muted-foreground/50 mt-2 tracking-wider">
            STARK INDUSTRIES · SECURE CHANNEL · {cameraOn ? "📹 VISION ACTIVE" : "VISION STANDBY"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JarvisChat;
