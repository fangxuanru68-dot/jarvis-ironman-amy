import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send } from "lucide-react";
import ArcReactor from "./ArcReactor";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jarvis-chat`;

const JarvisChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
  };

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    
    const userMsg: Message = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setHasGreeted(true);

    try {
      await streamChat(newMessages);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠ ${e instanceof Error ? e.message : "Systems offline. Attempting reconnection..."}` }]);
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
            className="w-full bg-transparent px-4 py-3 pr-12 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => send()}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary/80 disabled:text-muted-foreground transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center font-mono text-[10px] text-muted-foreground/50 mt-2 tracking-wider">
          STARK INDUSTRIES · SECURE CHANNEL
        </p>
      </div>
    </div>
  );
};

export default JarvisChat;
