import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Mic, MicOff, Camera, Image, X } from "lucide-react";
import ArcReactor from "./ArcReactor";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Web Speech API setup
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
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
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

  const captureCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();
      
      // Wait a moment for camera to stabilize
      await new Promise(r => setTimeout(r, 500));
      
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      
      stream.getTracks().forEach(t => t.stop());
      setAttachedImages(prev => [...prev, dataUrl]);
    } catch {
      alert("Camera access denied or unavailable.");
    }
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

    // Store assistant message in API messages
    if (assistantContent) {
      setApiMessages(prev => [...prev, { role: "assistant", content: assistantContent }]);
    }
  };

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if ((!msg && attachedImages.length === 0) || isLoading) return;

    const images = [...attachedImages];
    
    // Build API message content (multimodal if images attached)
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
    
    // Display message
    const displayMsg: DisplayMessage = { role: "user", content: msg || "📷 Image sent", images: images.length > 0 ? images : undefined };
    setMessages(prev => [...prev, displayMsg]);
    setApiMessages(newApiMessages);
    setInput("");
    setAttachedImages([]);
    setIsLoading(true);
    setHasGreeted(true);

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

  const showWelcome = !hasGreeted && messages.length === 0;

  return (
    <div className="flex flex-col h-screen w-full max-w-3xl mx-auto relative z-10">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-4">
        {showWelcome && (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in-up">
            <ArcReactor size={160} isActive />
            <h1 className="font-orbitron text-2xl tracking-[0.2em] text-primary">
              J.A.R.V.I.S
            </h1>
            <p className="font-rajdhani text-sm text-muted-foreground tracking-wider text-center max-w-md">
              Just A Rather Very Intelligent System
            </p>
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              {["What can you do?", "Tell me about yourself", "Help me with code"].map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
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
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
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
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
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
      <div className="px-4 pb-6 pt-2">
        <div className="relative border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden focus-within:border-primary/50 transition-colors duration-300">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Talk to J.A.R.V.I.S..."
            disabled={isLoading}
            className="w-full bg-transparent px-4 py-3 pr-32 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Voice input */}
            <button
              onClick={toggleVoice}
              className={`p-2 transition-colors ${isListening ? "text-destructive animate-pulse" : "text-muted-foreground hover:text-primary"}`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            {/* Camera capture */}
            <button
              onClick={captureCamera}
              disabled={isLoading}
              className="p-2 text-muted-foreground hover:text-primary disabled:text-muted-foreground/50 transition-colors"
              title="Capture from camera"
            >
              <Camera size={16} />
            </button>
            {/* Image upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-2 text-muted-foreground hover:text-primary disabled:text-muted-foreground/50 transition-colors"
              title="Upload image"
            >
              <Image size={16} />
            </button>
            {/* Send */}
            <button
              onClick={() => send()}
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
          STARK INDUSTRIES · SECURE CHANNEL
        </p>
      </div>
    </div>
  );
};

export default JarvisChat;
