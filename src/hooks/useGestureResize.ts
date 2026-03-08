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
}

const SCALE_MIN = 0.5;
const SCALE_MAX = 2.0;
const SCALE_STEP = 0.08;

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
  });

  const lastHandY = useRef<number | null>(null);
  const resizingRef = useRef(false);

  // Called with hand landmark data on each frame
  const handleHandData = useCallback((landmarks: Array<{ x: number; y: number; z: number }>, gesture: string) => {
    if (landmarks.length < 21) return;

    const indexTip = landmarks[8];
    const palmCenter = landmarks[9]; // middle finger MCP as rough palm center

    // Determine which panel the hand is pointing at based on x position
    let targetPanel: ResizablePanel | null = null;
    if (indexTip.x < 0.25) {
      // Left side — determine by y position
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
        const delta = lastHandY.current - currentY; // up = positive = increase
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

    // Thumbs up = increase, Fist = decrease
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

    // Reset resize state when no relevant gesture
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
      chatScale: 1,
      weatherScale: 1,
      radarScale: 1,
      powerScale: 1,
      storageScale: 1,
      activePanel: null,
      isResizing: false,
    });
  }, []);

  return {
    ...state,
    handleHandData,
    resetScale,
    resetAll,
  };
}
