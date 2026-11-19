import { useState } from "react";
import { Button } from "@/components/ui/button";

const ITEMS = [
  { cat: "SHOPPING", name: "Black Friday", info: "The day after Thanksgiving when stores slash prices and people fight over televisions.", tony: "Do not stand in line at 4 a.m. I own the store, Rogers. Just ask." },
  { cat: "SHOPPING", name: "Singles' Day (11.11)", info: "China's November 11 shopping festival — the largest online sale on Earth.", tony: "Started as a holiday for single people. You are not single. Close the app." },
  { cat: "SHOPPING", name: "Cyber Monday / Prime Day", info: "Online-only sales. You click, a box shows up at your door, often the next day.", tony: "Yes, the box is supposed to be that big. No, you don't keep the bubble wrap. Fine, keep one." },
  { cat: "TECH", name: "Smartphones", info: "A phone, camera, map, mailbox and library in your pocket.", tony: "It's not listening to you. Okay, mine is. That's JARVIS. Say hi." },
  { cat: "TECH", name: "Streaming", info: "Movies and shows on demand — no schedules, no tapes, no ads (mostly).", tony: "Binge-watching is a sport now. You'd be terrible at it. You'd stop to salute." },
  { cat: "TECH", name: "AI assistants", info: "Software that answers questions, writes, translates and sees pictures.", tony: "Not all of them are as charming as me. Statistically, none of them." },
  { cat: "SOCIAL", name: "Memes", info: "Jokes shared as images that mutate and spread overnight.", tony: "You are one. The 'Language' clip. I'm not sorry. I'm a little sorry." },
  { cat: "SOCIAL", name: "Emoji", info: "Tiny pictures used instead of words. 👍 means okay. Usually.", tony: "Stop sending the thumbs-up after every text. It reads passive-aggressive, Grandpa." },
  { cat: "SOCIAL", name: "Group chats", info: "One conversation, many people, endless notifications.", tony: "You can mute the team chat. Thor sends forty lightning emojis an hour." },
  { cat: "LIFE", name: "Food delivery apps", info: "Order from almost any restaurant; a courier brings it hot.", tony: "Tip the driver well. You were a broke kid from Brooklyn once. Act like it." },
  { cat: "LIFE", name: "Oat milk & cold brew", info: "Plant-based milk and slow-steeped iced coffee. Coffee now has a personality.", tony: "A coffee costs seven dollars. Don't do the 1940s math out loud. People stare." },
  { cat: "LIFE", name: "Ride-hailing", info: "Tap your phone, a stranger's car picks you up. It's normal, really.", tony: "Five stars, Cap. Always five stars. They rate you back." },
];

export function NewItemsGuide({ onAsk }: { onAsk: (text: string) => void }) {
  const [cat, setCat] = useState("ALL");
  const [open, setOpen] = useState<string | null>(null);
  const cats = ["ALL", ...new Set(ITEMS.map(i => i.cat))];
  return <>
    <h2>New Items: a field guide</h2>
    <p className="stony-handwriting">You slept through seventy years. I made you flashcards. Don't make it weird. — T.</p>
    <div className="flex flex-wrap gap-2 mt-3">{cats.map(c => <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</Button>)}</div>
    <div className="stony-items-grid">{ITEMS.filter(i => cat === "ALL" || i.cat === cat).map(i => <button type="button" key={i.name} className="stony-item-card" aria-expanded={open === i.name} onClick={() => setOpen(open === i.name ? null : i.name)}>
      <small className="stony-label">{i.cat}</small><h4>{i.name}</h4><p>{i.info}</p>{open === i.name && <p className="stony-handwriting">“{i.tony}”</p>}
    </button>)}</div>
    {open && <Button variant="outline" onClick={() => onAsk(`Explain "${open}" to me simply, Tony-style.`)}>Ask Tony more about {open}</Button>}
    <p className="stony-label">ENCYCLOPEDIA STARKIANA / VOL. 1 / UPDATED WHENEVER YOU LOOK CONFUSED</p>
  </>;
}

const SYSTEMS = [
  { id: "jarvis", name: "J.A.R.V.I.S. ACCESS", level: "OMEGA", on: "JARVIS now answers to 'Cap'. He's thrilled. You can't tell, but he is.", off: "JARVIS access paused. He'll pretend not to be hurt." },
  { id: "db", name: "STARK INDUSTRIES DATABASE", level: "ALPHA", on: "Read access granted. Please don't read the R&D budget. Or the coffee budget.", off: "Database locked." },
  { id: "armory", name: "ARMORY / MK SUITS", level: "RESTRICTED", on: "Suit bay unlocked. Touch the Mark 42 and it'll follow you home like a puppy.", off: "Armory sealed." },
  { id: "shield", name: "SHIELD WORKSHOP", level: "PERSONAL", on: "Vibranium calibration rig online. I polished it. Don't tell anyone.", off: "Workshop dimmed." },
  { id: "tower", name: "TOWER / HOME SYSTEMS", level: "RESIDENT", on: "Lights, heat, the good coffee machine. Your floor, your rules.", off: "Home systems on manual." },
  { id: "jet", name: "QUINJET & GARAGE", level: "BETA", on: "Keys transferred. Please park in the lines. You never park in the lines.", off: "Garage keys returned." },
];

export function ControlDeck() {
  const [granted, setGranted] = useState<Record<string, boolean>>({ jarvis: true, tower: true });
  const [log, setLog] = useState<string[]>(["> Biometric: S.G. ROGERS — accepted. Of course it was."]);
  const [lockdown, setLockdown] = useState(false);
  const toggle = (s: typeof SYSTEMS[number]) => {
    if (lockdown) return;
    const next = !granted[s.id];
    setGranted({ ...granted, [s.id]: next });
    setLog(l => [`> ${s.name}: ${next ? "GRANTED" : "REVOKED"} — ${next ? s.on : s.off}`, ...l].slice(0, 20));
  };
  return <>
    <h2>Control</h2>
    <p className="stony-handwriting">Everything I've got, you've got. Use it wisely. Or at least more wisely than me.</p>
    <div className="stony-control-grid">{SYSTEMS.map(s => <button type="button" key={s.id} className="stony-item-card" aria-pressed={!!granted[s.id]} disabled={lockdown} onClick={() => toggle(s)}>
      <small className="stony-label">CLEARANCE {s.level}</small><h4>{s.name}</h4><p><span className={`stony-indicator ${granted[s.id] ? "is-on" : ""}`} /> {granted[s.id] ? "ACCESS GRANTED" : "TAP TO AUTHORIZE"}</p>
    </button>)}</div>
    <div className="flex flex-wrap gap-2 mb-3">
      <Button variant="outline" onClick={() => { const all = Object.fromEntries(SYSTEMS.map(s => [s.id, true])); setGranted(all); setLockdown(false); setLog(l => ["> FULL ACCESS. Pepper is going to kill me.", ...l]); }}>Grant all</Button>
      <Button variant="outline" onClick={() => { setLockdown(!lockdown); setLog(l => [lockdown ? "> Lockdown lifted. Welcome back." : "> Lockdown engaged. Good instinct, Cap.", ...l]); }}>{lockdown ? "Lift lockdown" : "Emergency lockdown"}</Button>
    </div>
    <div className="stony-control-log" aria-live="polite">{log.map((l, i) => <p key={i}>{l}</p>)}</div>
    <p className="stony-label">FICTIONAL SIMULATION / NO REAL SYSTEMS, DATABASES OR WEAPONS ARE CONNECTED</p>
  </>;
}
