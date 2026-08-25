import {
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";

import { WALLPAPER_MODE_IDS } from "@/components/wallpaper/wallpaper-types";

export const WALLPAPER_QUERY_DEFAULTS = {
  balance: 0.5,
  colorMorph: 0,
  contrast: 0.56,
  customColor0: "#070914",
  customColor1: "#ff5c35",
  customColor2: "#ffc857",
  customColor3: "#f7f1e3",
  density: 0.5,
  ecoMode: false,
  energy: 0.58,
  grain: 0.12,
  mode: "aurora",
  paletteId: "solar",
  phase: 0.5,
  scale: 0.38,
  seed: 2049,
  speed: 0.42,
} as const;

export const wallpaperSearchParams = {
  b: parseAsFloat.withDefault(WALLPAPER_QUERY_DEFAULTS.balance),
  c: parseAsFloat.withDefault(WALLPAPER_QUERY_DEFAULTS.contrast),
  c0: parseAsString.withDefault(WALLPAPER_QUERY_DEFAULTS.customColor0),
  c1: parseAsString.withDefault(WALLPAPER_QUERY_DEFAULTS.customColor1),
  c2: parseAsString.withDefault(WALLPAPER_QUERY_DEFAULTS.customColor2),
  c3: parseAsString.withDefault(WALLPAPER_QUERY_DEFAULTS.customColor3),
  cm: parseAsFloat.withDefault(WALLPAPER_QUERY_DEFAULTS.colorMorph),
  d: parseAsFloat.withDefault(WALLPAPER_QUERY_DEFAULTS.density),
  e: parseAsBoolean.withDefault(WALLPAPER_QUERY_DEFAULTS.ecoMode),
  g: parseAsFloat.withDefault(WALLPAPER_QUERY_DEFAULTS.grain),
  m: parseAsStringLiteral(WALLPAPER_MODE_IDS).withDefault(
    WALLPAPER_QUERY_DEFAULTS.mode
  ),
  p: parseAsString.withDefault(WALLPAPER_QUERY_DEFAULTS.paletteId),
  ph: parseAsFloat.withDefault(WALLPAPER_QUERY_DEFAULTS.phase),
  s: parseAsFloat.withDefault(WALLPAPER_QUERY_DEFAULTS.speed),
  sc: parseAsFloat.withDefault(WALLPAPER_QUERY_DEFAULTS.scale),
  seed: parseAsInteger.withDefault(WALLPAPER_QUERY_DEFAULTS.seed),
  w: parseAsFloat.withDefault(WALLPAPER_QUERY_DEFAULTS.energy),
};

/** The nine tunable controls and their short query keys. Single source of
 * truth: search params, studio state, and every mutation site derive from
 * this map. */
export const CONTROL_QUERY_KEYS = {
  balance: "b",
  colorMorph: "cm",
  contrast: "c",
  density: "d",
  energy: "w",
  grain: "g",
  phase: "ph",
  scale: "sc",
  speed: "s",
} as const;

export type ControlKey = keyof typeof CONTROL_QUERY_KEYS;
export type ControlValues = Record<ControlKey, number>;
export const CONTROL_KEYS = Object.keys(CONTROL_QUERY_KEYS) as ControlKey[];

export const controlsToQuery = (
  controls: ControlValues
): Record<(typeof CONTROL_QUERY_KEYS)[ControlKey], number> =>
  Object.fromEntries(
    Object.entries(controls).map(([key, value]) => [
      CONTROL_QUERY_KEYS[key as ControlKey],
      value,
    ])
  ) as Record<(typeof CONTROL_QUERY_KEYS)[ControlKey], number>;
