import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mic, MicOff, Volume2, VolumeX, Send, Plus, Trash2, Play, Pause, RotateCcw, Upload, X, Mail } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STONY_REPLIES, writeStonyStore, type StonyPanel, type StonyStore } from "@/lib/stonyProtocol";
import VintageCommandConsole from "./VintageCommandConsole";
import StevePersonalTools from "./StevePersonalTools";
import StarkPrivateArchive from "./StarkPrivateArchive";
import brooklyn from "@/assets/stony-brooklyn.jpg";
import "./stony.css";

interface Props {
  panel: StonyPanel; store: StonyStore; onStore: (store: StonyStore) => void;
  messages: { role: "user" | "assistant"; content: string; images?: string[] }[];
  input: string; onInput: (text: string) => void; onCommand: (text: string) => void;
  isListening: boolean; isSpeaking: boolean; isLoading: boolean; voiceEnabled: boolean;
  onMic: () => void; onVoice: () => void; onImage: (url: string | null) => void; pendingImage: string | null;
}
function AnalogClock({ now }: { now: Date }) {
  return <svg className="stony-clock" viewBox="0 0 80 80" role="img" aria-label={now.toLocaleTimeString()}><circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" />{Array.from({ length: 12 }, (_, i) => <path key={i} d="M40 7V12" stroke="currentColor" transform={`rotate(${i * 30} 40 40)`} />)}<path d="M40 40V22" stroke="currentColor" strokeWidth="3" transform={`rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2} 40 40)`} /><path d="M40 40V14" stroke="currentColor" strokeWidth="2" transform={`rotate(${now.getMinutes() * 6} 40 40)`} /><path d="M40 46V12" stroke="currentColor" opacity=".5" transform={`rotate(${now.getSeconds() * 6} 40 40)`} /><circle cx="40" cy="40" r="3" fill="currentColor" /></svg>;
}
function FocusTimer() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running) return; const id = setInterval(() => setSeconds(v => Math.max(0, v - 1)), 1000); return () => clearInterval(id); }, [running]);
  useEffect(() => { if (seconds === 0) setRunning(false); }, [seconds]);
  return <div className="stony-focus"><p className="stony-label">ONE THING AT A TIME</p><AnalogClock now={new Date(0, 0, 0, 0, 0, seconds)} /><h2>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</h2><p className="stony-handwriting">The world can wait, Rogers.</p><div className="flex justify-center gap-2"><Button variant="outline" size="icon" title={running ? "Pause timer" : "Start timer"} aria-label={running ? "Pause timer" : "Start timer"} disabled={seconds === 0} onClick={() => setRunning(!running)}>{running ? <Pause /> : <Play />}</Button><Button variant="outline" size="icon" title="Reset timer" aria-label="Reset timer" onClick={() => { setRunning(false); setSeconds(1500); }}><RotateCcw /></Button></div></div>;
}
function VintageRadio({ privateChannel = false }: { privateChannel?: boolean }) {
  const [frequency, setFrequency] = useState(98.6);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const audio = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  useEffect(() => () => { void audio.current?.close(); }, []);
  useEffect(() => { if (oscillator.current) oscillator.current.frequency.value = 110 + (frequency - 88) * 14; }, [frequency]);
  const toggle = async () => {
    if (playing) { oscillator.current?.stop(); oscillator.current = null; await audio.current?.close(); audio.current = null; setPlaying(false); return; }
    try {
      setError("");
      const context = new AudioContext(); audio.current = context; await context.resume();
      const tone = context.createOscillator(); const gain = context.createGain(); gain.gain.value = .025;
      tone.type = "sine"; tone.frequency.value = 110 + (frequency - 88) * 14;
      tone.connect(gain); gain.connect(context.destination); tone.start(); oscillator.current = tone; setPlaying(true);
    } catch { await audio.current?.close().catch(() => {}); audio.current = null; setError("Audio unavailable in this browser."); }
  };
  return <div className={`stony-radio ${privateChannel ? "stony-channel-search" : ""}`}><p className="stony-label">{privateChannel ? "STARK PRIVATE CHANNEL" : "RADIO / LOCAL TONE DEMO"}</p><div className="stony-frequency">{frequency.toFixed(1)} <small>MHz</small></div><div className="stony-radio-scale"><span>88</span><span>94</span><span>100</span><span>108</span></div><input aria-label="Radio frequency" type="range" min="88" max="108" step=".1" value={frequency} onChange={e => setFrequency(Number(e.target.value))} /><p className="stony-label">{privateChannel ? "FICTIONAL PRERECORDED MESSAGE / NOT LIVE TRACKING" : "SYNTHESIZED TEST TONE / NOT A LIVE STATION"}</p>{privateChannel ? <blockquote className="stony-handwriting">{STONY_REPLIES.tony}</blockquote> : <Button variant="outline" onClick={() => void toggle()}>{playing ? <Pause /> : <Play />}{playing ? "Stop tone" : "Play test tone"}</Button>}{error && <p role="alert">{error}</p>}</div>;
}
export default function StonyProtocolMode(props: Props) {
  const { panel, store, onStore, messages, input, onInput, onCommand, isLoading } = props;
  const [now, setNow] = useState(new Date());
  const [activating, setActivating] = useState(true);
  const [noteDraft, setNoteDraft] = useState("");
  const [eventDraft, setEventDraft] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [storageError, setStorageError] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const chatEnd = useRef<HTMLDivElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  useEffect(() => { const interval = setInterval(() => setNow(new Date()), 1000); const timer = setTimeout(() => setActivating(false), 3600); return () => { clearInterval(interval); clearTimeout(timer); }; }, []);
  useEffect(() => { chatEnd.current?.scrollIntoView({ block: "nearest" }); }, [messages]);
  const commandRef = useRef(onCommand);
  commandRef.current = onCommand;
  useEffect(() => { if (panel !== "letter") return; const timer = setTimeout(() => commandRef.current("home"), 20000); return () => clearTimeout(timer); }, [panel]);
  const save = (next: StonyStore) => { onStore(next); setStorageError(writeStonyStore(next) ? "" : "Changes are temporary: this browser could not save them."); };
  const open = (p: StonyPanel) => onCommand(({ tony: "where's tony", endurance: "i can do this all day", brooklyn: "show me brooklyn", letter: "i love you", language: "language", missions: "mission archive", briefing: "daily briefing", notes: "personal notes", focus: "focus mode" } as Partial<Record<StonyPanel, string>>)[p] || p);
  const status = isLoading ? "THINKING IT THROUGH" : props.isSpeaking ? "PERSONAL CHANNEL / SPEAKING" : props.isListening ? "ROGERS / LISTENING" : "PERSONAL CHANNEL / STANDING BY";
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const today = store.events.filter(e => e.date === localDate);
  const attachImage = (file?: File) => {
    if (!file) return;
    setAttachmentError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) { setAttachmentError("Please choose a PNG, JPEG or WebP image."); return; }
    if (file.size > 8 * 1024 * 1024) { setAttachmentError("Please choose an image smaller than 8 MB."); return; }
    const reader = new FileReader();
    reader.onerror = () => setAttachmentError("This image could not be read. Please choose it again.");
    reader.onload = () => { if (typeof reader.result === "string") props.onImage(reader.result); };
    reader.readAsDataURL(file);
  };
  return <section className={`stony-mode ${panel === "letter" ? "stony-letter-state" : ""} ${panel === "focus" ? "stony-focus-state" : ""}`} aria-label="STONY Protocol">
    <header className="stony-header"><div><p className="stony-label">STARK INDUSTRIES / PRIVATE COMMISSION</p><h1>STONY PROTOCOL</h1><span className="stony-label">PERSONAL ASSISTANCE SYSTEM — S.G. ROGERS</span></div><div className="stony-header-clock"><AnalogClock now={now} /><div><p>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p><span>{now.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })}</span></div></div><Button variant="ghost" onClick={() => onCommand("mode end")}><ArrowLeft />JARVIS</Button></header>
    <div className="stony-workspace"><StevePersonalTools panel={panel} onCommand={onCommand} /><main className="stony-main">
      {panel === "home" && <div className="stony-home"><p className="stony-label">PROPERTY OF STEVEN GRANT ROGERS</p><VintageCommandConsole status={status} /><h2>Built for you, Cap.</h2><p className="stony-handwriting">For Steve, from Tony.</p><div className="stony-console-foot"><span><i className="stony-indicator is-on" />PERSONAL CHANNEL READY</span><span>MK. I / SERIAL 07-04</span></div></div>}
      {panel !== "home" && <div className={`stony-document stony-document-${panel}`}><div className="stony-document-head"><span className="stony-label">S.G.R. / PERSONAL FILE</span><Button size="icon" variant="ghost" title="Return home" aria-label="Return home" onClick={() => onCommand("home")}><X /></Button></div>
        {panel === "briefing" && <><h2>Good {now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening"}, Rogers.</h2><p>{now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p><p className="stony-big-time">{now.toLocaleTimeString()}</p><h3>TODAY'S PERSONAL SCHEDULE</h3>{today.length ? today.map(e => <p key={e.id}>{e.text}</p>) : <p>No local calendar entries for today.</p>}<h3>FROM YOUR NOTEBOOK</h3>{store.notes.slice(-3).map(n => <p key={n.id}>{n.text}</p>)}<p className="stony-label">DEVICE TIME / LOCAL RECORDS / NO EXTERNAL CALENDAR CONNECTED</p><Button variant="outline" onClick={() => onCommand("calendar")}>Open calendar</Button></>}
        {panel === "notes" && <><h2>Personal notebook</h2><p className="stony-handwriting">Write it down. Your shield isn't a filing cabinet.</p><form className="stony-local-form" onSubmit={e => { e.preventDefault(); if (noteDraft.trim()) { onCommand(`save note: ${noteDraft.trim()}`); setNoteDraft(""); } }}><textarea aria-label="New personal note" placeholder="Something worth remembering…" value={noteDraft} maxLength={2000} onChange={e => setNoteDraft(e.target.value)} /><Button type="submit" disabled={!noteDraft.trim() || isLoading}><Plus />Save note</Button></form>{store.notes.length === 0 && <p>Your notebook is empty.</p>}{store.notes.map(n => <div className="stony-record" key={n.id}><div><small>{new Date(n.date).toLocaleDateString()}</small><p>{n.text}</p></div><Button variant="ghost" size="icon" title="Delete note" aria-label="Delete note" onClick={() => save({ ...store, notes: store.notes.filter(x => x.id !== n.id) })}><Trash2 /></Button></div>)}<small>Saved on this browser only.</small></>}
        {panel === "calendar" && <><h2>Your calendar</h2><form className="stony-local-form" onSubmit={e => { e.preventDefault(); if (eventDraft.trim() && eventDate) { onCommand(`add event: ${eventDate} | ${eventDraft.trim()}`); setEventDraft(""); } }}><Input aria-label="Event date" type="date" required value={eventDate} onChange={e => setEventDate(e.target.value)} /><Input aria-label="Event title" placeholder="A plan, not a world-ending crisis" value={eventDraft} maxLength={500} onChange={e => setEventDraft(e.target.value)} /><Button type="submit" disabled={!eventDate || !eventDraft.trim() || isLoading}><Plus />Add event</Button></form>{store.events.length === 0 && <p>No events yet.</p>}{[...store.events].sort((a, b) => a.date.localeCompare(b.date)).map(e => <div className="stony-record" key={e.id}><div><small>{e.date}</small><p>{e.text}</p></div><Button size="icon" variant="ghost" title="Delete event" aria-label="Delete event" onClick={() => save({ ...store, events: store.events.filter(x => x.id !== e.id) })}><Trash2 /></Button></div>)}<p className="stony-label">LOCAL CALENDAR / NO EXTERNAL INTEGRATION</p></>}
        {panel === "missions" && <><h2>Read me first, Cap.</h2><p className="stony-label">FICTIONAL LETTER / STONY FAN-FICTION ARCHIVE</p><blockquote className="stony-handwriting">I put the complicated things behind the simple ones. Not because you can't learn them. Because you've already got enough to carry.<br /><br />If you need help, ask. That includes the computer. Especially the computer.<br /><br />— T.</blockquote><h3>MISSION ARCHIVE / INTERACTIVE FICTION</h3><p>01 — Homecoming: a quiet place to land.</p><p>02 — Field checklist: water, rest, call a friend.</p><Button variant="outline" onClick={() => onCommand("Explain how to use a computer in simple steps.")}>Technology helper</Button><p className="stony-label">PERSONAL MESSAGES ARE IMAGINED, NOT CANONICAL MCU RECORDS.</p></>}
        {panel === "radio" && <VintageRadio />}
        {panel === "tony" && <VintageRadio privateChannel />}
        {panel === "focus" && <FocusTimer />}
        {panel === "language" && <><h2 className="stony-stamp">LANGUAGE PROTOCOL ACTIVATED</h2><div className="stony-switch"><span>OFF</span><span className="stony-switch-on">ON</span></div><p className="stony-handwriting">{STONY_REPLIES.language}</p><Button variant="outline" onClick={() => save({ ...store, language: !store.language })}>{store.language ? "Relax vocabulary filter" : "Enable vocabulary filter"}</Button><p className="stony-label">VOCABULARY FILTER / {store.language ? "ON" : "OFF"}</p></>}
        {panel === "endurance" && <><p className="stony-label">STARK PERSONAL FIELD ASSESSMENT / FICTIONAL</p><h2>STEVEN ROGERS</h2><div className="stony-assessment"><p>ENDURANCE <strong>EXCEPTIONAL</strong></p><p>STUBBORNNESS <strong>OFF THE CHARTS</strong></p></div><p className="stony-handwriting">Yeah, I know.<br />That's what worries me.</p><Button variant="outline" onClick={() => onCommand("focus mode")}>Take a quiet moment</Button></>}
        {panel === "brooklyn" && <><p className="stony-label">BROOKLYN / AN IMAGINED ARCHIVE</p><h2>Something familiar.</h2><img src={brooklyn} alt="Original nostalgic illustration of a Brooklyn street beneath an elevated railway" width={1536} height={1024} loading="lazy" /><div className="stony-map" aria-label="Stylized fictional Brooklyn map"><span>EAST RIVER</span><span>BROOKLYN</span><span>ATLANTIC AVENUE</span></div><div className="stony-timeline"><p><strong>1930s</strong> Brownstone stoops, neighborhood shops, elevated trains.</p><p><strong>1940s</strong> A wartime city, carried here as an imagined keepsake.</p><p><strong>NOW</strong> A familiar corner, rebuilt by Stark engineering.</p></div><p className="stony-label">ORIGINAL ARTWORK / STYLIZED MAP / FICTIONAL PERSONAL NOTES, NOT HISTORICAL EVIDENCE</p></>}
        {panel === "letter" && <div className="stony-letter"><Mail className="stony-envelope" size={64} /><p className="stony-label">SEALED / FOR STEVE ONLY</p><div className="stony-letter-paper"><p>I know I'm not always good at saying things out loud.</p><p>But you should know this, Steve.</p><p>There isn't a version of my future I wouldn't want you in.</p><p>— Tony</p></div><small>Fictional personal letter</small><Button variant="ghost" onClick={() => onCommand("home")}>Keep this close</Button></div>}
        {storageError && <p role="alert">{storageError}</p>}
      </div>}
    </main><div className="stony-right"><StarkPrivateArchive unlocked={store.unlocked} warm={store.unlocked.includes("letter")} onOpen={open} /></div></div>
    <section className="stony-conversation" aria-label="Personal conversation"><div className="stony-conversation-header"><span className="stony-label">PERSONAL LINE / ROGERS & STARK</span><span className="stony-label">{props.isListening ? "LISTENING" : props.isSpeaking ? "SPEAKING" : isLoading ? "THINKING" : "READY"}</span></div><div className="stony-messages" aria-live="polite">{messages.slice(-40).map((m, i) => <div key={i} className={`stony-message stony-message-${m.role}`}><span>{m.role === "user" ? "S.G.R." : "STARK"}</span><ReactMarkdown>{m.content}</ReactMarkdown>{m.images?.map((url, index) => <img key={index} className="stony-message-image" src={url} alt="Attached image" />)}</div>)}<div ref={chatEnd} /></div><form onSubmit={e => { e.preventDefault(); onCommand(input); }}><Input aria-label="STONY message" placeholder={props.isListening ? "Listening, Rogers…" : "What's on your mind, Cap?"} value={input} onChange={e => onInput(e.target.value)} disabled={isLoading} /><div className="stony-chat-actions"><Button type="button" size="icon" variant="ghost" aria-label="Attach image" title="Attach image" onClick={() => upload.current?.click()}><Upload /></Button><Button type="button" size="icon" variant="ghost" aria-label={props.isListening ? "Stop microphone" : "Start microphone"} title="Microphone" onClick={props.onMic}>{props.isListening ? <MicOff /> : <Mic />}</Button><Button type="button" size="icon" variant="ghost" aria-label={props.voiceEnabled ? "Mute voice" : "Enable voice"} title="Spoken replies" onClick={props.onVoice}>{props.voiceEnabled ? <Volume2 /> : <VolumeX />}</Button><Button type="submit" size="icon" variant="ghost" aria-label="Send STONY message" title="Send" disabled={isLoading || !input.trim()}><Send /></Button></div></form>{props.pendingImage && <div className="stony-attachment"><img src={props.pendingImage} alt="Pending image attachment" /><Button type="button" variant="ghost" size="icon" title="Remove image" aria-label="Remove image" onClick={() => props.onImage(null)}><X /></Button></div>}{attachmentError && <p className="stony-attachment-error" role="alert">{attachmentError}</p>}<input ref={upload} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" aria-label="Image attachment" onChange={e => { attachImage(e.target.files?.[0]); e.target.value = ""; }} /></section>
    <footer className="stony-footer"><span>STARK ENGINEERING / PERSONAL EDITION</span><span className="stony-handwriting">No instruction manual. You're welcome.</span><span>FICTIONAL STEVE / TONY INTERPRETATION</span></footer>
    {activating && <div className="stony-activation" aria-live="polite"><div className="stony-tuning-line" /><p>IDENTITY RECOGNIZED</p><h2>STEVEN GRANT ROGERS</h2><p>LOADING PERSONAL PROTOCOL...</p><span className="stony-handwriting">Hey, Cap. Made you something.</span></div>}
  </section>;
}