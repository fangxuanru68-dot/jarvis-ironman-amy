import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import StonyProtocolMode from "./StonyProtocolMode";
import { emptyStonyStore } from "@/lib/stonyProtocol";

afterEach(() => { cleanup(); vi.useRealTimers(); });

const props = () => ({
  panel: "home" as const, store: emptyStonyStore(), onStore: vi.fn(),
  messages: [], input: "", onInput: vi.fn(), onCommand: vi.fn(),
  isListening: false, isSpeaking: false, isLoading: false, voiceEnabled: true,
  onMic: vi.fn(), onVoice: vi.fn(), onImage: vi.fn(), imagePending: false,
});

describe("STONY personal tools use the shared command pipeline", () => {
  it("sends a personal note through the same command handler as speech", () => {
    Element.prototype.scrollIntoView = vi.fn();
    const options = props();
    render(<StonyProtocolMode {...options} panel="notes" />);
    fireEvent.change(screen.getByRole("textbox", { name: "New personal note" }), { target: { value: "Bring my shield" } });
    fireEvent.click(screen.getByRole("button", { name: "Save note" }));
    expect(options.onCommand).toHaveBeenCalledWith("save note: Bring my shield");
  });

  it("returns the private letter to STONY home after twenty seconds, even after a rerender", () => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = vi.fn();
    const options = props();
    const view = render(<StonyProtocolMode {...options} panel="letter" />);
    vi.advanceTimersByTime(10000);
    const latestCommand = vi.fn();
    view.rerender(<StonyProtocolMode {...options} panel="letter" onCommand={latestCommand} />);
    vi.advanceTimersByTime(10000);
    expect(latestCommand).toHaveBeenCalledWith("home");
    expect(options.onCommand).not.toHaveBeenCalled();
  });

  it("exits through mode end instead of resetting other modes", () => {
    Element.prototype.scrollIntoView = vi.fn();
    const options = props();
    render(<StonyProtocolMode {...options} />);
    fireEvent.click(screen.getByRole("button", { name: "JARVIS" }));
    expect(options.onCommand).toHaveBeenCalledWith("mode end");
  });
});