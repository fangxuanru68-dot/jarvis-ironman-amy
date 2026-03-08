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
  pageScale: number;
}

const SCALE_MIN = 0.5;
const SCALE_MAX = 2.5;
const SCALE_STEP = 0.12;
const SWIPE_THRESHOLD = 0.08;
const SWIPE_SPEED_THRESHOLD = 0.004;

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
    pageScale: 1,
  });

  // Track gesture sequence: OPEN_PALM → FIST
  const lastGestureRef = useRef<string | null>(null);
  const gestureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageShrinkCooldown = useRef(false);

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

    // --- OPEN_PALM: Select chat + resize OR swipe ---
    if (gesture === "OPEN_PALM") {
      const currentX = palmCenter.x;
      const currentY = palmCenter.y;

      // Swipe detection
      if (swipeStartX.current === null) {
        swipeStartX.current = currentX;
        swipeLastX.current = currentX;
      } else {
        const totalDelta = currentX - swipeStartX.current;
        const frameDelta = currentX - (swipeLastX.current ?? currentX);
        swipeLastX.current = currentX;

        if (!swipeCooldown.current && Math.abs(totalDelta) > SWIPE_THRESHOLD && Math.abs(frameDelta) > SWIPE_SPEED_THRESHOLD) {
          if (totalDelta < 0) {
            setState(prev => ({ ...prev, chatVisible: true }));
          } else {
            setState(prev => ({ ...prev, chatVisible: false }));
          }
          swipeCooldown.current = true;
          swipeStartX.current = null;
          swipeLastX.current = null;
          lastHandY.current = null;
          setTimeout(() => { swipeCooldown.current = false; }, 1000);
          return;
        }
      }

      // Auto-select chat panel & resize with vertical movement
      if (!resizingRef.current) {
        setState(prev => ({ ...prev, activePanel: "chat" }));
        resizingRef.current = true;
        lastHandY.current = currentY;
        return;
      }

      if (lastHandY.current !== null) {
        const delta = lastHandY.current - currentY; // up = bigger
        if (Math.abs(delta) > 0.002) {
          setState(prev => ({
            ...prev,
            activePanel: "chat",
            isResizing: true,
            chatScale: clampScale(prev.chatScale + delta * 5),
          }));
        }
      }
      lastHandY.current = currentY;
      return;
    }

    // Reset when palm is gone
    swipeStartX.current = null;
    swipeLastX.current = null;
    if (resizingRef.current) {
      resizingRef.current = false;
      lastHandY.current = null;
      setState(prev => ({ ...prev, isResizing: false }));
    }

    // --- POINTING: select left-side panels ---
    if (gesture === "POINTING") {
      let targetPanel: ResizablePanel | null = null;
      if (indexTip.x < 0.35) {
        const y = indexTip.y;
        if (y < 0.35) targetPanel = "storage";
        else if (y < 0.5) targetPanel = "power";
        else if (y < 0.65) targetPanel = "radar";
        else targetPanel = "weather";
      }
      if (targetPanel) {
        setState(prev => ({ ...prev, activePanel: targetPanel }));
      }
      return;
    }

    // Thumbs up / Fist: resize active left-side panel
    if ((gesture === "THUMBS_UP" || gesture === "FIST") && state.activePanel && state.activePanel !== "chat") {
      const scaleKey = `${state.activePanel}Scale` as keyof GestureResizeState;
      const direction = gesture === "THUMBS_UP" ? SCALE_STEP : -SCALE_STEP;
      setState(prev => ({
        ...prev,
        isResizing: true,
        [scaleKey]: clampScale((prev[scaleKey] as number) + direction),
      }));
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
