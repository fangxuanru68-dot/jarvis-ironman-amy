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
    // More JARVIS-like: slightly lower pitch, measured pace, precise diction
    utterance.rate = 0.95;
    utterance.pitch = 0.85;
    utterance.volume = 1;

    // Prefer a refined British male voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = [
      // Chrome/Edge high quality voices
      "Google UK English Male",
      "Microsoft Ryan Online (Natural)",
      "Microsoft George Online (Natural)", 
      "Daniel (Enhanced)",
      "Daniel",
      // Safari
      "Daniel (English (United Kingdom))",
    ];
    
    let selectedVoice = null;
    for (const name of preferred) {
      selectedVoice = voices.find(v => v.name.includes(name));
      if (selectedVoice) break;
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === "en-GB" && v.name.toLowerCase().includes("male"))
        || voices.find(v => v.lang === "en-GB")
        || voices.find(v => v.lang.startsWith("en"));
    }
    if (selectedVoice) utterance.voice = selectedVoice;

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
