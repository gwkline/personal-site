export const WALLPAPER_MODE_IDS = [
  "aurora",
  "ascii",
  "refraction",
  "topography",
  "interference",
] as const;

export type WallpaperMode = (typeof WALLPAPER_MODE_IDS)[number];

export interface WallpaperPalette {
  colors: readonly [string, string, string, string];
  id: string;
  name: string;
}

export interface WallpaperConfig {
  balance: number;
  colorMorph: number;
  contrast: number;
  density: number;
  ecoMode: boolean;
  energy: number;
  grain: number;
  isPaused: boolean;
  mode: WallpaperMode;
  palette: WallpaperPalette;
  phase: number;
  scale: number;
  seed: number;
  speed: number;
}

export const WALLPAPER_PALETTES: WallpaperPalette[] = [
  {
    colors: ["#070914", "#ff5c35", "#ffc857", "#f7f1e3"],
    id: "solar",
    name: "Solar flare",
  },
  {
    colors: ["#050b18", "#2ee8a5", "#5b8cff", "#d9fff3"],
    id: "signal",
    name: "Deep signal",
  },
  {
    colors: ["#10071c", "#e85dff", "#6b7cff", "#ffb4d8"],
    id: "ultraviolet",
    name: "Ultraviolet",
  },
  {
    colors: ["#061817", "#adff2f", "#16b8a6", "#ecffd5"],
    id: "moss",
    name: "Electric moss",
  },
  {
    colors: ["#11100e", "#f4efe6", "#7d786f", "#fffaf2"],
    id: "mono",
    name: "Moon dust",
  },
  {
    colors: ["#080d1b", "#6ed4ff", "#a88cff", "#f5f7ff"],
    id: "iris",
    name: "Iris",
  },
  {
    colors: ["#071515", "#27b6a4", "#9be8c7", "#effff8"],
    id: "tidepool",
    name: "Tidepool",
  },
  {
    colors: ["#190c12", "#e58b9f", "#f4bd8b", "#fff1e8"],
    id: "rose",
    name: "Rose gold",
  },
  {
    colors: ["#050817", "#315cdd", "#7a95ff", "#eef2ff"],
    id: "blue-hour",
    name: "Blue hour",
  },
  {
    colors: ["#120b07", "#b95d32", "#eba45d", "#fff0d8"],
    id: "copper",
    name: "Copper",
  },
  {
    colors: ["#100c18", "#8c6ade", "#d2a8ff", "#fff4ff"],
    id: "lavender",
    name: "Lavender",
  },
  {
    colors: ["#061014", "#2699aa", "#85d9e8", "#effcff"],
    id: "glacier",
    name: "Glacier",
  },
  {
    colors: ["#050511", "#ff2bd6", "#39e7ff", "#ffe66d"],
    id: "prism",
    name: "Prism",
  },
  {
    colors: ["#09051c", "#ff4d2e", "#38d9ff", "#ff8bd8"],
    id: "afterglow",
    name: "Afterglow",
  },
  {
    colors: ["#031716", "#20e3b2", "#ff6b6b", "#ffe66d"],
    id: "tropical",
    name: "Tropical",
  },
  {
    colors: ["#080512", "#725cff", "#ff3cac", "#b8ff4a"],
    id: "arcade",
    name: "Arcade",
  },
  {
    colors: ["#071426", "#89f7fe", "#b69cff", "#ffb88c"],
    id: "hologram",
    name: "Hologram",
  },
  {
    colors: ["#07080c", "#ff3b30", "#34c759", "#2f7cff"],
    id: "rgb",
    name: "RGB",
  },
];
