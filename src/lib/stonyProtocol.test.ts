import { describe, it, expect } from "vitest";
import { parseStonyCommand, emptyStonyStore, readStonyStore, writeStonyStore } from "./stonyProtocol";
describe("STONY commands shared by text and speech", () => {
  it("activates case-insensitively on stony only", () => {
    expect(parseStonyCommand(" STONY ", false)).toEqual({ kind: "activate" });
    expect(parseStonyCommand("explain stony", false)).toBeNull();
  });
  it("exits on mode end without intercepting other modes", () => {
    expect(parseStonyCommand("Mode End.", true)).toEqual({ kind: "exit" });
    expect(parseStonyCommand("mode end", false)).toBeNull();
  });
  it.each([ ["language", "language"], ["where’s tony", "tony"], ["i can do this all day", "endurance"], ["show me brooklyn", "brooklyn"], ["i love you", "letter"], ["home", "home"], ["focus mode", "focus"] ])("opens %s as a distinct interaction", (input, panel) => {
    expect(parseStonyCommand(input, true)).toEqual({ kind: "panel", panel });
  });
  it("saves and retrieves notes using spoken or typed commands", () => {
    expect(parseStonyCommand("Save note: Buy a notebook", true)).toEqual({ kind: "note", text: "Buy a notebook" });
    expect(parseStonyCommand("remember Bring my shield", true)).toEqual({ kind: "note", text: "Bring my shield" });
    expect(parseStonyCommand("show notes", true)).toEqual({ kind: "panel", panel: "notes" });
  });
  it("persists notes and unlocked archives between sessions", () => {
    let value = "";
    const storage = { setItem: (_: string, v: string) => { value = v; }, getItem: () => value };
    const store = { ...emptyStonyStore(), notes: [{ id: "1", text: "Read tomorrow", date: "2026-11-14" }], unlocked: ["letter" as const] };
    expect(writeStonyStore(store, storage)).toBe(true);
    expect(readStonyStore(storage)).toEqual(store);
  });
  it("falls back safely on corrupt local records", () => {
    expect(readStonyStore({ getItem: () => "{" })).toEqual(emptyStonyStore());
  });
  it("validates local calendar dates", () => {
    expect(parseStonyCommand("add event: 2026-11-14 | Study", true)).toEqual({ kind: "event", date: "2026-11-14", text: "Study" });
    expect(parseStonyCommand("add event: 2026-02-31 | Study", true)).toBeNull();
  });
});