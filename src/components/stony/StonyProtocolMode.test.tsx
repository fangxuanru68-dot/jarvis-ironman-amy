import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import StonyProtocolMode from "./StonyProtocolMode";
import { emptyStonyStore } from "@/lib/stonyProtocol";

afterEach(() => { cleanup(); vi.useRealTimers(); });

const props = () => ({
  panel: "home" as const, store: emptyStonyStore(), onStore: vi.fn(),
  messages: [], input: "", onInput: vi.fn(), onCommand: vi.fn(),
  isListening: false, isSpeaking: false, isLoading: false, voiceEnabled: true,
  onMic: vi.fn(), onVoice: vi.fn(), onImage: vi.fn(), pendingImage: null,
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
    act(() => vi.advanceTimersByTime(10000));
    const latestCommand = vi.fn();
    view.rerender(<StonyProtocolMode {...options} panel="letter" onCommand={latestCommand} />);
    act(() => vi.advanceTimersByTime(10000));
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

  it("keeps calendar and notebook drafts independent across tool changes", () => {
    const options = props();
    const view = render(<StonyProtocolMode {...options} panel="calendar" />);
    fireEvent.change(screen.getByLabelText("Event date"), { target: { value: "2026-11-18" } });
    fireEvent.change(screen.getByLabelText("Event title"), { target: { value: "Read with Tony" } });
    view.rerender(<StonyProtocolMode {...options} panel="notes" />);
    expect(screen.getByLabelText("New personal note")).toHaveValue("");
    fireEvent.change(screen.getByLabelText("New personal note"), { target: { value: "Bring my shield" } });
    view.rerender(<StonyProtocolMode {...options} panel="calendar" />);
    expect(screen.getByLabelText("Event title")).toHaveValue("Read with Tony");
    fireEvent.click(screen.getByRole("button", { name: "Add event" }));
    expect(options.onCommand).toHaveBeenCalledWith("add event: 2026-11-18 | Read with Tony");
    view.rerender(<StonyProtocolMode {...options} panel="notes" />);
    expect(screen.getByLabelText("New personal note")).toHaveValue("Bring my shield");
  });

  it("removes a pending image from the shared message state", () => {
    const options = props();
    render(<StonyProtocolMode {...options} pendingImage="data:image/png;base64,test" />);
    fireEvent.click(screen.getByRole("button", { name: "Remove image" }));
    expect(options.onImage).toHaveBeenCalledWith(null);
  });

  it("does not pass non-image files to the shared conversation", () => {
    const options = props();
    render(<StonyProtocolMode {...options} />);
    fireEvent.change(screen.getByLabelText("Image attachment"), { target: { files: [new File(["hello"], "note.txt", { type: "text/plain" })] } });
    expect(options.onImage).not.toHaveBeenCalled();
  });

  it("pauses and resets the twenty-five-minute focus timer", () => {
    vi.useFakeTimers();
    render(<StonyProtocolMode {...props()} panel="focus" />);
    fireEvent.click(screen.getByRole("button", { name: "Start timer" }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("heading", { name: "24:59" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pause timer" }));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole("heading", { name: "24:59" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset timer" }));
    expect(screen.getByRole("heading", { name: "25:00" })).toBeInTheDocument();
  });
});