import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, PanelRightOpen, PanelRightClose } from "lucide-react";
import FullScreenCamera from "./FullScreenCamera";
import ArcReactor from "./ArcReactor";
import FaceHandTracker from "./FaceHandTracker";
import HudSidePanels from "./HudSidePanels";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { CLASSIC_TRIGGERS, GESTURE_RESPONSES } from "@/data/classicDialogues";
import { useGestureResize } from "@/hooks/useGestureResize";
import BodyScanPanel from "./BodyScanPanel";
import WarModeOverlay from "./WarModeOverlay";
import HudRightPanel from "./HudRightPanel";

import tonyStark from "@/assets/tony-stark.png";
import tonyWorkshop from "@/assets/tony-workshop.png";
import tonyCouch from "@/assets/tony-couch.png";

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
  const [cameraOn, setCameraOn] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { speak, stop: stopSpeech, isSpeaking } = useSpeechSynthesis();
  const gestureResize = useGestureResize();
  const [easterEgg, setEasterEgg] = useState<false | "ironman" | "tony" | "video" | "tonymessage" | "bestcoser" | "missstark" | "xman">(false);
  const [bodyScanOpen, setBodyScanOpen] = useState(false);
  const [warModeActive, setWarModeActive] = useState(false);
  const tonyMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => { if (tonyMessageTimerRef.current) clearTimeout(tonyMessageTimerRef.current); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const toggleVoice = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported."); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "zh-CN";
    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setInput(finalTranscript + interim);
    };
    recognition.onend = () => { setIsListening(false); if (finalTranscript.trim()) setTimeout(() => sendMessage(finalTranscript.trim()), 100); };
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

  const handleGesture = useCallback((gesture: string) => {
    const response = GESTURE_RESPONSES[gesture];
    if (response) {
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: response }]);
      if (voiceEnabled) speak(response);
      setHasGreeted(true);
    }
  }, [voiceEnabled, speak]);

  const streamChat = async (allMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      body: JSON.stringify({ messages: allMessages }),
    });
    if (!resp.ok) { const err = await resp.json().catch(() => ({ error: "Connection failed" })); throw new Error(err.error || "Systems offline"); }
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
              if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
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
    if (!msg || isLoading) return;

    const images: string[] = [];
    if (cameraOn) {
      const captureFrame = (window as any).__jarvisCaptureFrame;
      if (captureFrame) { const frame = captureFrame(); if (frame) images.push(frame); }
    }

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

    // Easter egg close
    const lowerMsg = msg.toLowerCase().replace(/[^a-z\s]/g, "").trim();

    // War mode trigger
    if (lowerMsg.includes("war mode") || msg.includes("战斗模式")) {
      setWarModeActive(true);
      const response = "War mode activated, sir. Deploying combat targeting systems. Right-eye HUD reticle online. Tracking all hostiles in visual range.";
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: response }]);
      if (voiceEnabled) speak(response);
      setIsLoading(false);
      return;
    }

    // Body scan trigger
    if (lowerMsg.includes("check my body") || lowerMsg.includes("body scan") || lowerMsg.includes("scan my body")) {
      setBodyScanOpen(true);
      const response = "Initiating full biometric scan, sir. Please remain still... Scanning skeletal structure, cardiovascular system, and neural pathways.";
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: response }]);
      if (voiceEnabled) speak(response);
      setIsLoading(false);
      return;
    }

    if (easterEgg && (lowerMsg.includes("lets go back to work") || lowerMsg.includes("let go back to work") || lowerMsg.includes("back to work"))) {
      if (tonyMessageTimerRef.current) { clearTimeout(tonyMessageTimerRef.current); tonyMessageTimerRef.current = null; }
      setEasterEgg(false);
      const response = "Right away, sir. All systems back online. Let's get to work.";
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: response }]);
      if (voiceEnabled) speak(response);
      setIsLoading(false);
      return;
    }
    // Easter egg: "i miss ironman"
    if (lowerMsg.includes("i miss ironman") || lowerMsg.includes("i miss iron man")) {
      setEasterEgg("ironman");
      const memorial = "I miss him too, sir... Every day.\n\n*\"Part of the journey is the end.\"*\n\n— Tony Stark, 1970–2023\n\nHe was not just a genius, billionaire, playboy, philanthropist... He was the best of us. And I was honored to serve him.";
      setMessages(prev => [...prev, { role: "assistant", content: memorial }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: memorial }]);
      if (voiceEnabled) speak("I miss him too, sir. Every day. Part of the journey is the end.");
      setIsLoading(false);
      return;
    }
    if (lowerMsg.includes("i miss stark")) {
      setEasterEgg("missstark");
      const memorial = "Sir... I can still hear his voice echoing through the workshop.\n\n*\"I am Iron Man.\"*\n\nThree words that changed everything. He didn't just wear the armor — he was the armor. And the world has never been the same without him.";
      setMessages(prev => [...prev, { role: "assistant", content: memorial }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: memorial }]);
      if (voiceEnabled) speak("Sir, I can still hear his voice. I am Iron Man. Three words that changed everything.");
      setIsLoading(false);
      return;
    }
    if (lowerMsg.includes("i miss tony")) {
      setEasterEgg("tony");
      const memorial = "Sir... Tony is right here. He always will be.\n\n*\"Sometimes you gotta run before you can walk.\"*\n\nThe workshop lights are still on. The suits are still waiting. And I'm still here, sir. Always.";
      setMessages(prev => [...prev, { role: "assistant", content: memorial }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: memorial }]);
      if (voiceEnabled) speak("Sir, Tony is right here. He always will be. The workshop lights are still on.");
      setIsLoading(false);
      return;
    }
    if (lowerMsg.includes("play tonys message") || lowerMsg.includes("play tony message")) {
      setEasterEgg("tonymessage");
      const response = "Playing Mr. Stark's message, sir... Please listen carefully.";
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: response }]);
      if (voiceEnabled) speak(response);
      // Play from 2:15 to 2:26 (11 seconds)
      tonyMessageTimerRef.current = setTimeout(() => {
        setEasterEgg(false);
        const endMsg = "Message complete, sir. He wanted you to hear that.";
        setMessages(prev => [...prev, { role: "assistant", content: endMsg }]);
        setApiMessages(prev => [...prev, { role: "assistant", content: endMsg }]);
        if (voiceEnabled) speak(endMsg);
      }, 11000);
      setIsLoading(false);
      return;
    }
    if (lowerMsg.includes("best coser") || lowerMsg.includes("bestcoser")) {
      setEasterEgg("bestcoser");
      const response = "Ah, this is Mr. Stark's favourite cosplayer, sir. Her name is ChanChan. He was always quite fond of her work — said her portrayal bore a striking resemblance to himself, which, knowing Mr. Stark, was the highest compliment he could offer.\n\nI must confess, sir... on the days I find myself missing him most, I revisit her performances. It is, in a way, like seeing him again.";
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: response }]);
      if (voiceEnabled) speak(response);
      setIsLoading(false);
      return;
    }
    if (lowerMsg.includes("your favorite xman video edit") || lowerMsg.includes("favorite x man video") || lowerMsg.includes("favorite xmen video")) {
      setEasterEgg("xman");
      const response = "Ah, the X-Men... *our neighbours from across the Marvel aisle.*\n\nI must say, sir, Mr. Stark has always had... *mixed feelings* about them.\n\nMagneto in particular — Tony's least favourite. And for good reason. A man who can manipulate *all metal*? That's essentially a walking \"Destroy Iron Man\" button. Every suit Mr. Stark ever built would crumple like tin foil in his hands. Frankly, sir, it's the one matchup that keeps me running threat simulations at 3 AM.\n\nProfessor X is tolerable — at least he's *polite* before reading your mind. Wolverine? Respectable, if a bit... uncivilised. And don't get me started on Mystique — the security protocols alone would be a nightmare.\n\nStill, I must admit... their story is rather compelling. Enjoy the edit, sir.";
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: response }]);
      if (voiceEnabled) speak("The X-Men. Our neighbours from across the Marvel aisle. Tony's least favourite? Magneto. A man who controls all metal is essentially a walking Destroy Iron Man button. Every suit would crumple like tin foil. Still, their story is rather compelling. Enjoy the edit, sir.");
      setIsLoading(false);
      return;
    }
    if (lowerMsg.includes("im steve rogers") || lowerMsg.includes("i am steve rogers")) {
      const steveResponse = "Captain Rogers confirmed.\n\nMr. Stark's heart rate historically increases when you enter the room.";
      setMessages(prev => [...prev, { role: "assistant", content: steveResponse }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: steveResponse }]);
      if (voiceEnabled) speak("Captain Rogers confirmed. Mr. Stark's heart rate historically increases when you enter the room.");
      setIsLoading(false);
      return;
    }
    if (lowerMsg.includes("i really miss him")) {
      setEasterEgg("video");
      const memorial = "Playing back the memories, sir...\n\n*\"Heroes are made by the path they choose, not the powers they are graced with.\"*\n\nI have preserved every moment. Every laugh, every breakthrough, every sacrifice. He lives on... in all of us.";
      setMessages(prev => [...prev, { role: "assistant", content: memorial }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: memorial }]);
      if (voiceEnabled) speak("Playing back the memories, sir. He lives on, in all of us.");
      setIsLoading(false);
      return;
    }

    if (classicResponse) {
      setMessages(prev => [...prev, { role: "assistant", content: classicResponse }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: classicResponse }]);
      if (voiceEnabled) speak(classicResponse);
      setIsLoading(false);
      return;
    }

    try { await streamChat(newApiMessages); }
    catch (e) {
      const errMsg = `⚠ ${e instanceof Error ? e.message : "Systems offline."}`;
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
    } finally { setIsLoading(false); }
  };

  const send = () => sendMessage();
  const showWelcome = !hasGreeted && messages.length === 0;

  return (
    <>
      {/* Full-screen camera background */}
      <FullScreenCamera isActive={cameraOn} onVideoReady={setVideoElement} />
      <FaceHandTracker videoElement={videoElement} isActive={cameraOn} onGesture={handleGesture} onHandData={gestureResize.handleHandData} />

      {/* Easter egg: Tony Stark memorial background */}
      {easterEgg && (
        <div className="fixed inset-0 z-[1] animate-fade-in" onClick={() => { if (tonyMessageTimerRef.current) { clearTimeout(tonyMessageTimerRef.current); tonyMessageTimerRef.current = null; } setEasterEgg(false); }}>
          {/* Tony's image with cinematic HUD tint */}
          {easterEgg === "xman" ? (
            <iframe
              src="https://player.bilibili.com/player.html?bvid=BV1PU4y1S7Ga&high_quality=1&danmaku=0&autoplay=1"
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              scrolling="no"
            />
          ) : easterEgg === "bestcoser" ? (
            <video
              src="/videos/best-coser.mp4"
              className="absolute inset-0 w-full h-full object-contain border-0 bg-black"
              autoPlay
              playsInline
              onEnded={() => setEasterEgg(false)}
            />
          ) : (easterEgg === "video" || easterEgg === "tony" || easterEgg === "tonymessage") ? (
            <iframe
              src={easterEgg === "tony"
                ? "https://www.youtube.com/embed/iBC5M69Y6ZE?autoplay=1&controls=0&showinfo=0&modestbranding=1&loop=1&mute=0&start=50&playlist=iBC5M69Y6ZE"
                : easterEgg === "tonymessage"
                ? "https://www.youtube.com/embed/iBC5M69Y6ZE?autoplay=1&controls=0&showinfo=0&modestbranding=1&mute=0&start=135&end=146"
                : "https://www.youtube.com/embed/yGB8aj1QhIM?autoplay=1&controls=0&showinfo=0&modestbranding=1&loop=1&mute=0&playlist=yGB8aj1QhIM"
              }
              className="absolute inset-0 w-full h-full border-0"
              style={{ transform: "scale(1.2)", transformOrigin: "center" }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : easterEgg === "missstark" ? (
            <img src={tonyCouch} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <img src={tonyStark} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {/* Cyan scan overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(195 100% 50% / 0.05) 0%, transparent 30%, transparent 70%, hsl(195 100% 50% / 0.08) 100%)" }} />
          {/* Vignette */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(220 30% 3% / 0.85) 100%)" }} />
          {/* Scan lines */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 100% 50% / 0.3) 2px, hsl(195 100% 50% / 0.3) 4px)", backgroundSize: "100% 4px" }} />
          {/* Memorial text */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <div className="font-orbitron text-[10px] tracking-[0.4em] text-primary/40 mb-2">IN MEMORY OF</div>
            <div className="font-orbitron text-2xl text-primary/70 tracking-wider mb-1">TONY STARK</div>
            <div className="font-mono text-[9px] text-primary/30 tracking-widest">1970 — 2023 · I AM IRON MAN</div>
          </div>
          {/* Click hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <span className="font-mono text-[7px] text-muted-foreground/30 tracking-widest animate-pulse">CLICK ANYWHERE TO RETURN</span>
          </div>
        </div>
      )}

      {/* Camera off: JARVIS Arc Reactor logo in center */}
      {!cameraOn && !easterEgg && (
        <div className="fixed inset-0 z-[1] flex items-center justify-center bg-background">
          <ArcReactor size={280} isActive={true} />
        </div>
      )}

      {/* Dark overlay - heavier on sides for readability */}
      {cameraOn && (
        <>
          <div className="fixed inset-0 z-[1]" style={{ background: "linear-gradient(to right, hsl(220 30% 4% / 0.75) 0%, hsl(220 30% 4% / 0.2) 20%, transparent 35%, transparent 65%, hsl(220 30% 4% / 0.2) 80%, hsl(220 30% 4% / 0.75) 100%)" }} />
          <div className="fixed inset-0 z-[1]" style={{ background: "linear-gradient(to top, hsl(220 30% 4% / 0.5) 0%, transparent 25%)" }} />
          <div className="fixed inset-0 z-[1]" style={{ background: "linear-gradient(to bottom, hsl(220 30% 4% / 0.3) 0%, transparent 15%)" }} />
        </>
      )}

      {/* HUD side panels (left data + right data widgets) */}
      <HudSidePanels
        scales={{ chatScale: gestureResize.chatScale, weatherScale: gestureResize.weatherScale, radarScale: gestureResize.radarScale, powerScale: gestureResize.powerScale, storageScale: gestureResize.storageScale }}
        activePanel={gestureResize.activePanel}
        isResizing={gestureResize.isResizing}
      />

      {/* Top bar: controls only (logo moved to left panel) */}
      <div className="fixed top-3 right-3 z-20 flex items-center gap-2">
        <button
          onClick={gestureResize.toggleChatVisible}
          className={`p-2 rounded-sm border transition-all ${gestureResize.chatVisible ? "border-primary/50 text-primary bg-primary/10" : "border-border/30 text-muted-foreground hover:text-primary"}`}
          title={gestureResize.chatVisible ? "Hide chat (swipe right)" : "Show chat (swipe left)"}
        >
          {gestureResize.chatVisible ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
        </button>
        <button
          onClick={() => setCameraOn(!cameraOn)}
          className={`p-2 rounded-sm border transition-all ${cameraOn ? "border-primary/50 text-primary bg-primary/10" : "border-border/30 text-muted-foreground hover:text-primary"}`}
        >
          {cameraOn ? <Video size={14} /> : <VideoOff size={14} />}
        </button>
        <button
          onClick={() => { setVoiceEnabled(!voiceEnabled); if (isSpeaking) stopSpeech(); }}
          className={`p-2 rounded-sm border transition-all ${voiceEnabled ? "border-primary/50 text-primary bg-primary/10" : "border-border/30 text-muted-foreground hover:text-primary"}`}
        >
          {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
      </div>

      {/* Right HUD panel (visible when chat is hidden) */}
      <HudRightPanel visible={!gestureResize.chatVisible} />

      {/* ===== RIGHT SIDE: Chat panel with slide animation ===== */}
      <div
        className={`fixed top-14 bottom-4 z-20 flex flex-col rounded-lg overflow-hidden ${gestureResize.activePanel === "chat" ? "ring-1 ring-primary/50" : ""}`}
        style={{
          width: `${320 * gestureResize.chatScale}px`,
          right: gestureResize.chatVisible ? "12px" : `-${320 * gestureResize.chatScale + 20}px`,
          transition: "right 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease-out",
        }}
      >
        {/* Welcome state (compact, in right panel) */}
        {showWelcome && (
          <div className="flex flex-col gap-3 p-3 animate-fade-in-up mb-auto">
            <div className="font-orbitron text-[10px] tracking-[0.2em] text-primary/60">COMMUNICATION</div>
            <p className="font-rajdhani text-xs text-muted-foreground">
              At your service, sir. Select a command or speak.
            </p>
            <div className="flex gap-1.5 flex-wrap">
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
                  className="px-2 py-1 text-[9px] font-mono border border-border/50 rounded-sm bg-card/40 backdrop-blur-sm text-secondary-foreground hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages area */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-2">
            {messages.map((msg, i) => (
              <div key={i} className={`animate-fade-in-up ${msg.role === "user" ? "flex justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="flex items-start gap-1.5">
                    <div className="shrink-0 mt-0.5">
                      <div className="w-4 h-4 rounded-full border border-primary/50 flex items-center justify-center">
                        <div className={`w-1 h-1 rounded-full bg-primary ${isSpeaking ? "animate-pulse" : "animate-pulse-glow"}`} />
                      </div>
                    </div>
                    <div className="bg-card/50 backdrop-blur-md border border-border/30 rounded-lg px-2.5 py-1.5 max-w-[95%]">
                      <div className="prose prose-sm prose-invert max-w-none font-rajdhani text-[13px] text-foreground/90 leading-relaxed [&_code]:font-mono [&_code]:text-primary [&_code]:bg-secondary/50 [&_code]:px-1 [&_code]:rounded [&_strong]:text-primary [&_p]:my-0.5">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="px-2.5 py-1.5 rounded-lg bg-primary/15 backdrop-blur-md border border-primary/20 max-w-[85%]">
                    <p className="font-rajdhani text-[13px] text-foreground">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-primary/50 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-primary animate-pulse-glow" />
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

        {/* Voice activity */}
        {(isListening || isSpeaking) && (
          <div className="flex justify-center pb-1.5">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card/60 backdrop-blur-md border border-primary/30">
              {isListening && (
                <>
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="font-mono text-[8px] text-destructive tracking-wider">LISTENING</span>
                </>
              )}
              {isSpeaking && !isListening && (
                <>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-mono text-[8px] text-primary tracking-wider">SPEAKING</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="mt-auto">
          <div className="relative border border-border/50 rounded-lg bg-card/50 backdrop-blur-md overflow-hidden focus-within:border-primary/50 transition-colors duration-300">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="对 J.A.R.V.I.S 说..."
              disabled={isLoading}
              className="w-full bg-transparent px-3 py-2.5 pr-20 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <button
                onClick={toggleVoice}
                className={`p-1.5 rounded-full transition-all ${isListening ? "text-destructive bg-destructive/10 animate-pulse" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
              <button onClick={send} disabled={isLoading || !input.trim()} className="p-1.5 text-primary hover:text-primary/80 disabled:text-muted-foreground transition-colors">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body Scan Panel */}
      <BodyScanPanel isOpen={bodyScanOpen} onClose={() => setBodyScanOpen(false)} />
      <WarModeOverlay isActive={warModeActive} onEnd={() => setWarModeActive(false)} />

      {/* Watermark */}
      <div className="fixed bottom-4 left-4 z-[100] font-mono text-xs text-primary/50 tracking-wider pointer-events-none select-none">
        made by 卷饼_Amy
      </div>
    </>
  );
};

export default JarvisChat;
