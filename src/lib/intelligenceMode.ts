export type IntelligenceMode = "jarvis" | "doom";

export function resolveIntelligenceMode(text: string, current: IntelligenceMode): IntelligenceMode {
  const command = text.trim().toLowerCase().replace(/^[【\[]|[】\]]$/g, "").trim();
  if (command === "doom") return "doom";
  if (command === "jarvis" || command === "mode end" || command === "end mode") return "jarvis";
  return current;
}