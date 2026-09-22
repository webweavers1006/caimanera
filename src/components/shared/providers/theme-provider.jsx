"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { THEME_PRESET_OPTIONS, THEME_EFFECT_OPTIONS, PERFORMANCE_MODE } from "@/features/shared";

export const PRESET_OPTIONS = THEME_PRESET_OPTIONS;
export const EFFECT_OPTIONS = THEME_EFFECT_OPTIONS;

const ThemePresetContext = createContext({
  preset: "default",
  setPreset: () => {},
  effect: "none",
  setEffect: () => {},
  performanceMode: PERFORMANCE_MODE.AUTO,
  setPerformanceMode: () => {},
});

export function useThemePreset() {
  return useContext(ThemePresetContext);
}

/**
 * Returns true when performance mode is enabled (low-end PC optimization).
 * Use in Framer Motion components to skip animations.
 */
export function usePerformanceMode() {
  const { performanceMode } = useContext(ThemePresetContext);
  return performanceMode === PERFORMANCE_MODE.LOW;
}

export function ThemeProvider({ children }) {
  const [preset, setPreset] = useState(() => {
    if (typeof window === "undefined") return "default";
    try {
      return localStorage.getItem("theme-preset") || "default";
    } catch {
      return "default";
    }
  });
  
  const [effect, setEffect] = useState(() => {
    if (typeof window === "undefined") return "none";
    try {
      return localStorage.getItem("theme-effect") || "none";
    } catch {
      return "none";
    }
  });

  const [performanceMode, setPerformanceMode] = useState(() => {
    if (typeof window === "undefined") return PERFORMANCE_MODE.AUTO;
    try {
      return localStorage.getItem(PERFORMANCE_MODE.STORAGE_KEY) || PERFORMANCE_MODE.AUTO;
    } catch {
      return PERFORMANCE_MODE.AUTO;
    }
  });

  useEffect(() => {
    try {
      if (preset && preset !== "default") {
        document.documentElement.dataset.preset = preset;
        localStorage.setItem("theme-preset", preset);
      } else {
        delete document.documentElement.dataset.preset;
        localStorage.removeItem("theme-preset");
      }
    } catch {}
  }, [preset]);

  useEffect(() => {
    try {
      if (effect && effect !== "none") {
        document.documentElement.dataset.effect = effect;
        localStorage.setItem("theme-effect", effect);
      } else {
        delete document.documentElement.dataset.effect;
        localStorage.removeItem("theme-effect");
      }
    } catch {}
  }, [effect]);

  useEffect(() => {
    try {
      document.documentElement.dataset.performance = performanceMode;
      localStorage.setItem(PERFORMANCE_MODE.STORAGE_KEY, performanceMode);
    } catch {}
  }, [performanceMode]);

  const contextValue = useMemo(
    () => ({ preset, setPreset, effect, setEffect, performanceMode, setPerformanceMode }),
    [preset, effect, performanceMode]
  );

  return (
    <NextThemesProvider
      attribute="class"
      storageKey="theme-mode"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={["light", "dark"]}
    >
      <ThemePresetContext.Provider value={contextValue}>
        {children}
      </ThemePresetContext.Provider>
    </NextThemesProvider>
  );
}
