export type StonyPanel = "home" | "briefing" | "calendar" | "notes" | "missions" | "radio" | "focus" | "language" | "tony" | "endurance" | "brooklyn" | "letter" | "items" | "control";
export type StonyRecord = { id: string; text: string; date: string };
export type StonyStore = { notes: StonyRecord[]; events: StonyRecord[]; unlocked: StonyPanel[]; language: boolean };
export type StonyCommand = { kind: "activate" | "exit" } | { kind: "panel"; panel: StonyPanel } | { kind: "note"; text: string } | { kind: "event"; date: string; text: string };
const KEY = "stark.stony.personal.v1";
export const emptyStonyStore = (): StonyStore => ({ notes: [], events: [], unlocked: [], language: false });
export function parseStonyCommand(text: string, active: boolean): StonyCommand | null {
  const value = text.trim().replace(/[’]/g, "'").replace(/[.!?]+$/, "");
  const command = value.toLowerCase();
  if (!active) return command === "stony" ? { kind: "activate" } : null;
  if (command === "mode end") return { kind: "exit" };
  const panels: Record<string, StonyPanel> = { home: "home", "daily briefing": "briefing", calendar: "calendar", "personal notes": "notes", "show notes": "notes", "read notes": "notes", "mission archive": "missions", radio: "radio", "focus mode": "focus", language: "language", "where's tony": "tony", "wheres tony": "tony", "where is tony": "tony", "i can do this all day": "endurance", "show me brooklyn": "brooklyn", "i love you": "letter", "new items": "items", control: "control" };
  if (panels[command]) return { kind: "panel", panel: panels[command] };
  const note = value.match(/^(?:save note|note|remember)\s*[:\s]\s*(.+)$/i);
  if (note?.[1]) return { kind: "note", text: note[1].trim().slice(0, 2000) };
  const event = value.match(/^add event:\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(.+)$/i);
  if (event && !Number.isNaN(Date.parse(event[1])) && new Date(event[1]).toISOString().slice(0, 10) === event[1]) return { kind: "event", date: event[1], text: event[2].trim().slice(0, 500) };
  return null;
}
export function readStonyStore(storage: Pick<Storage, "getItem"> = localStorage): StonyStore {
  try {
    const value = JSON.parse(storage.getItem(KEY) || "null");
    if (!value || typeof value !== "object") return emptyStonyStore();
    const records = (items: unknown): StonyRecord[] => Array.isArray(items) ? items.filter((r): r is StonyRecord => !!r && typeof r.id === "string" && typeof r.text === "string" && typeof r.date === "string").slice(-100) : [];
    const eggs: StonyPanel[] = ["language", "tony", "endurance", "brooklyn", "letter"];
    return { notes: records(value.notes), events: records(value.events), unlocked: Array.isArray(value.unlocked) ? value.unlocked.filter((p: StonyPanel) => eggs.includes(p)) : [], language: value.language === true };
  } catch { return emptyStonyStore(); }
}
export function writeStonyStore(store: StonyStore, storage: Pick<Storage, "setItem"> = localStorage): boolean {
  try { storage.setItem(KEY, JSON.stringify(store)); return true; } catch { return false; }
}
export const STONY_REPLIES: Partial<Record<StonyPanel, string>> = {
  home: "Home sweet over-engineered home, Cap.",
  briefing: "Your briefing, Rogers. Real clock, your own plans. No imaginary satellite network required.",
  calendar: "Your personal calendar, Cap. Kept on this device; no external calendar is connected.",
  notes: "Your notes, Rogers. Even the stubborn ones are worth writing down.",
  missions: "Opening the mission archive. These are fictional personal records, not official history.",
  radio: "An old-fashioned dial with Stark engineering underneath. Local radio-tone demo, not a live broadcast.",
  focus: "One thing at a time, Rogers. The world can wait twenty-five minutes.",
  items: "New items. A field guide to the twenty-first century. You missed a few things, Cap. I took notes. You're welcome.",
  control: "Control panel. Keys to the kingdom, Rogers. Try not to buy a jet by accident.",
  language: "Seriously, Steve? I built you an entire artificial intelligence and you're still policing my vocabulary?",
  tony: "If you're looking for me, Rogers, you know where to find me. Probably in the workshop. Probably making something I promised I wouldn't.",
  endurance: "Yeah, I know. That's what worries me.",
  brooklyn: "Thought you might like something familiar. And before you ask, yes, I spent an unreasonable amount of time getting the details right.",
  letter: "I know I'm not always good at saying things out loud. But you should know this, Steve. There isn't a version of my future I wouldn't want you in. — Tony",
};