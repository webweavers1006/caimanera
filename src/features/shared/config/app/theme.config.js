/**
 * Global theme configuration.
 * Simplified for generic admin starter.
 */

export const THEME_PRESET_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "soft", label: "Suave" },
  { value: "serene", label: "Sereno" },
  { value: "dark", label: "Dark" },
];

export const THEME_EFFECT_OPTIONS = [
  { value: "none", label: "Ninguno" },
  { value: "glass", label: "Cristal (Blur)" },
  { value: "gradient", label: "Degradado" },
];

/**
 * Performance mode — disables animations, transitions, and heavy visual effects
 * for better performance on low-end machines.
 */
export const PERFORMANCE_MODE = {
  STORAGE_KEY: "performance-mode",
  /** When true, all CSS animations/transitions/blur effects are disabled. */
  LOW: "low",
  /** Default — all visual effects enabled. */
  AUTO: "auto",
};


