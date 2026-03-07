import { useCallback, useRef, useState } from "react";

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    // Strip markdown for cleaner speech
    const clean = text
      .replace(/```[\s\S]*?```/g, "code block")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_~>#-]/g, "")
      .trim();

    if (!clean || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 0.9;
    utterance.volume = 1;

    // Try to find a British English voice
    const voices = window.speechSynthesis.getVoices();
    const british = voices.find(v => v.lang === "en-GB" && v.name.toLowerCase().includes("male"))
      || voices.find(v => v.lang === "en-GB")
      || voices.find(v => v.lang.startsWith("en"));
    if (british) utterance.voice = british;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
};
