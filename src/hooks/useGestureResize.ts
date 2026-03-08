import { useState, useCallback, useRef } from "react";

export type ResizablePanel = "chat" | "weather" | "radar" | "power" | "storage";

interface GestureResizeState {
  chatScale: number;
  weatherScale: number;
  radarScale: number;
  powerScale: number;
  storageScale: number;
  activePanel: ResizablePanel | null;
  isResizing: boolean;
  chatVisible: boolean;
}

const SCALE_MIN = 0.5;
const SCALE_MAX = 2.0;
const SCALE_STEP = 0.08;
const SWIPE_THRESHOLD = 0.12;
const SWIPE_SPEED_THRESHOLD = 0.008;

const clampScale = (s: number) => Math.max(SCALE_MIN, Math.min(SCALE_MAX, s));

export function useGestureResize() {
  const [state, setState] = useState<GestureResizeState>({
    chatScale: 1,
    weatherScale: 1,
    radarScale: 1,
    powerScale: 1,
    storageScale: 1,
    activePanel: null,
    isResizing: false,
    chatVisible: true,
  });

  const lastHandY = useRef<number | null>(null);
  const resizingRef = useRef(false);

  // Swipe detection
  const swipeStartX = useRef<number | null>(null);
  const swipeLastX = useRef<number | null>(null);
  const swipeCooldown = useRef(false);

  const toggleChatVisible = useCallback(() => {
    setState(prev => ({ ...prev, chatVisible: !prev.chatVisible }));
  }, []);

  const handleHandData = useCallback((landmarks: Array<{ x: number; y: number; z: number }>, gesture: string) => {
    if (landmarks.length < 21) return;

    const indexTip = landmarks[8];
    const palmCenter = landmarks[9];

    // --- SWIPE DETECTION (open palm horizontal movement) ---
    if (gesture === "OPEN_PALM") {
      const currentX = palmCenter.x;

      if (swipeStartX.current === null) {
        swipeStartX.current = currentX;
        swipeLastX.current = currentX;
      } else {
        const totalDelta = currentX - swipeStartX.current;
        const frameDelta = currentX - (swipeLastX.current ?? currentX);
        swipeLastX.current = currentX;

        // Detect fast horizontal swipe
        if (!swipeCooldown.current && Math.abs(totalDelta) > SWIPE_THRESHOLD && Math.abs(frameDelta) > SWIPE_SPEED_THRESHOLD) {
          if (totalDelta < 0) {
            // Swipe left → show chat (pull from right)
            setState(prev => ({ ...prev, chatVisible: true }));
          } else {
            // Swipe right → hide chat
            setState(prev => ({ ...prev, chatVisible: false }));
          }
          swipeCooldown.current = true;
          swipeStartX.current = null;
          swipeLastX.current = null;
          setTimeout(() => { swipeCooldown.current = false; }, 1000);
          return;
        }
      }
    } else {
      swipeStartX.current = null;
      swipeLastX.current = null;
    }

    // --- PANEL SELECTION & RESIZE (existing logic) ---
    let targetPanel: ResizablePanel | null = null;
    if (indexTip.x < 0.25) {
      const y = indexTip.y;
      if (y < 0.3) targetPanel = "storage";
      else if (y < 0.45) targetPanel = "power";
      else if (y < 0.6) targetPanel = "radar";
      else targetPanel = "weather";
    } else if (indexTip.x > 0.7) {
      targetPanel = "chat";
    }

    if (gesture === "POINTING" && targetPanel) {
      setState(prev => ({ ...prev, activePanel: targetPanel }));
      lastHandY.current = null;
      resizingRef.current = false;
      return;
    }

    if (gesture === "OPEN_PALM" && state.activePanel) {
      resizingRef.current = true;
      const currentY = palmCenter.y;
      if (lastHandY.current !== null) {
        const delta = lastHandY.current - currentY;
        if (Math.abs(delta) > 0.005) {
          const scaleKey = `${state.activePanel}Scale` as keyof GestureResizeState;
          setState(prev => ({
            ...prev,
            isResizing: true,
            [scaleKey]: clampScale((prev[scaleKey] as number) + delta * 3),
          }));
        }
      }
      lastHandY.current = currentY;
      return;
    }

    if ((gesture === "THUMBS_UP" || gesture === "FIST") && state.activePanel) {
      const scaleKey = `${state.activePanel}Scale` as keyof GestureResizeState;
      const direction = gesture === "THUMBS_UP" ? SCALE_STEP : -SCALE_STEP;
      setState(prev => ({
        ...prev,
        isResizing: true,
        [scaleKey]: clampScale((prev[scaleKey] as number) + direction),
      }));
      return;
    }

    if (resizingRef.current && gesture !== "OPEN_PALM") {
      resizingRef.current = false;
      lastHandY.current = null;
      setState(prev => ({ ...prev, isResizing: false }));
    }
  }, [state.activePanel]);

  const resetScale = useCallback((panel: ResizablePanel) => {
    const scaleKey = `${panel}Scale` as keyof GestureResizeState;
    setState(prev => ({ ...prev, [scaleKey]: 1 }));
  }, []);

  const resetAll = useCallback(() => {
    setState({
      chatScale: 1, weatherScale: 1, radarScale: 1, powerScale: 1, storageScale: 1,
      activePanel: null, isResizing: false, chatVisible: true,
    });
  }, []);

  return {
    ...state,
    handleHandData,
    resetScale,
    resetAll,
    toggleChatVisible,
  };
}
