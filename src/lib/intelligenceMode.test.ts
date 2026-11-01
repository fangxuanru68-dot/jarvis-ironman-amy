import { describe, expect, it } from "vitest";
import { resolveIntelligenceMode } from "./intelligenceMode";

describe("Doom mode commands", () => {
  it("enters Doom on doom or bracketed doom", () => {
    expect(resolveIntelligenceMode("doom", "jarvis")).toBe("doom");
    expect(resolveIntelligenceMode("【doom】", "jarvis")).toBe("doom");
  });
  it("returns to Jarvis on jarvis or bracketed jarvis", () => {
    expect(resolveIntelligenceMode("jarvis", "doom")).toBe("jarvis");
    expect(resolveIntelligenceMode("【jarvis】", "doom")).toBe("jarvis");
  });
  it("ends Doom on mode end", () => {
    expect(resolveIntelligenceMode("mode end", "doom")).toBe("jarvis");
  });
  it("keeps ordinary conversation in its current persona", () => {
    expect(resolveIntelligenceMode("Doom, help me plan", "doom")).toBe("doom");
    expect(resolveIntelligenceMode("explain doom", "jarvis")).toBe("jarvis");
  });
});