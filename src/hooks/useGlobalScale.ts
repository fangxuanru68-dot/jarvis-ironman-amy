import { useState, useCallback } from "react";

export function useGlobalScale() {
  const [globalScale, setGlobalScaleState] = useState(1);

  const setGlobalScale = useCallback((scale: number) => {
    setGlobalScaleState(scale);
  }, []);

  return { globalScale, setGlobalScale };
}
