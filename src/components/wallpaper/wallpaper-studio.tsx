import type { LucideIcon } from "lucide-react";
import {
  Binary,
  Check,
  ChevronDown,
  Download,
  Expand,
  Gauge,
  Gem,
  Leaf,
  Minimize2,
  Pause,
  Pipette,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Share2,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Waves,
} from "lucide-react";
import { useQueryStates } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WallpaperCanvas } from "@/components/wallpaper/wallpaper-canvas";
import type { WallpaperCanvasHandle } from "@/components/wallpaper/wallpaper-canvas";
import {
  WALLPAPER_QUERY_DEFAULTS,
  wallpaperSearchParams,
} from "@/components/wallpaper/wallpaper-query";
import { WALLPAPER_PALETTES } from "@/components/wallpaper/wallpaper-types";
import type {
  WallpaperConfig,
  WallpaperMode,
  WallpaperPalette,
} from "@/components/wallpaper/wallpaper-types";
import { cn } from "@/lib/utils";

const CONTROL_KEYS = [
  "balance",
  "colorMorph",
  "contrast",
  "density",
  "energy",
  "grain",
  "phase",
  "scale",
  "speed",
] as const;

type ControlKey = (typeof CONTROL_KEYS)[number];
type ModeDefaults = Pick<WallpaperConfig, Exclude<ControlKey, "grain">>;

type ControlValues = Pick<WallpaperConfig, ControlKey>;
type PaletteColorIndex = 0 | 1 | 2 | 3;

interface ModeOption {
  defaults: ModeDefaults;
  description: string;
  icon: LucideIcon;
  id: WallpaperMode;
  labels: Record<ControlKey, string>;
  name: string;
}

const CONTROL_BOUNDS: Record<
  ControlKey,
  { max: number; min: number; step: number }
> = {
  balance: { max: 0.72, min: 0.25, step: 0.01 },
  colorMorph: { max: 1, min: 0, step: 0.01 },
  contrast: { max: 0.68, min: 0.28, step: 0.01 },
  density: { max: 0.72, min: 0.2, step: 0.01 },
  energy: { max: 0.72, min: 0.15, step: 0.01 },
  grain: { max: 0.2, min: 0, step: 0.005 },
  phase: { max: 0.72, min: 0.2, step: 0.01 },
  scale: { max: 0.65, min: 0.18, step: 0.01 },
  speed: { max: 0.6, min: 0.06, step: 0.01 },
};

const MODE_OPTIONS: ModeOption[] = [
  {
    defaults: {
      balance: 0.5,
      colorMorph: 0,
      contrast: 0.56,
      density: 0.5,
      energy: 0.58,
      phase: 0.5,
      scale: 0.38,
      speed: 0.42,
    },
    description: "Slow, folded light that behaves like weather.",
    icon: Sparkles,
    id: "aurora",
    labels: {
      balance: "Color drift",
      colorMorph: "Color morph",
      contrast: "Depth",
      density: "Layers",
      energy: "Turbulence",
      grain: "Texture",
      phase: "Direction",
      scale: "Field scale",
      speed: "Drift",
    },
    name: "Flow",
  },
  {
    defaults: {
      balance: 0.46,
      colorMorph: 0,
      contrast: 0.62,
      density: 0.62,
      energy: 0.58,
      phase: 0.52,
      scale: 0.48,
      speed: 0.38,
    },
    description: "Full-frame waves, clouds, and textures built from type.",
    icon: Binary,
    id: "ascii",
    labels: {
      balance: "Color spread",
      colorMorph: "Color morph",
      contrast: "Pattern contrast",
      density: "Glyph count",
      energy: "Warp",
      grain: "Dither",
      phase: "Direction",
      scale: "Pattern scale",
      speed: "Flow",
    },
    name: "ascii",
  },
  {
    defaults: {
      balance: 0.65,
      colorMorph: 0,
      contrast: 0.56,
      density: 0.62,
      energy: 0.6,
      phase: 0.44,
      scale: 0.4,
      speed: 0.3,
    },
    description: "Chromatic caustics bending through virtual glass.",
    icon: Gem,
    id: "refraction",
    labels: {
      balance: "Chromatic split",
      colorMorph: "Color morph",
      contrast: "Clarity",
      density: "Caustics",
      energy: "Bend",
      grain: "Diffusion",
      phase: "Light angle",
      scale: "Refraction scale",
      speed: "Drift",
    },
    name: "Glass",
  },
  {
    defaults: {
      balance: 0.48,
      colorMorph: 0,
      contrast: 0.6,
      density: 0.58,
      energy: 0.52,
      phase: 0.57,
      scale: 0.45,
      speed: 0.25,
    },
    description: "Living terrain drawn as luminous elevation lines.",
    icon: Waves,
    id: "topography",
    labels: {
      balance: "Major lines",
      colorMorph: "Color morph",
      contrast: "Ink",
      density: "Line density",
      energy: "Elevation",
      grain: "Paper",
      phase: "Travel",
      scale: "Terrain scale",
      speed: "Drift",
    },
    name: "Contour",
  },
  {
    defaults: {
      balance: 0.52,
      colorMorph: 0,
      contrast: 0.64,
      density: 0.45,
      energy: 0.5,
      phase: 0.48,
      scale: 0.42,
      speed: 0.3,
    },
    description: "Two wave sources creating a shifting moiré pulse.",
    icon: Radio,
    id: "interference",
    labels: {
      balance: "Detune",
      colorMorph: "Color morph",
      contrast: "Separation",
      density: "Frequency",
      energy: "Phase energy",
      grain: "Texture",
      phase: "Source angle",
      scale: "Wave scale",
      speed: "Tempo",
    },
    name: "Pulse",
  },
];

const MOTION_CONTROLS: ControlKey[] = [
  "speed",
  "phase",
  "energy",
  "balance",
  "colorMorph",
];
const APPEARANCE_CONTROLS: ControlKey[] = [
  "scale",
  "density",
  "contrast",
  "grain",
];
const FADER_TICKS = [0, 25, 50, 75, 100] as const;
const CUSTOM_COLOR_INDICES: readonly PaletteColorIndex[] = [0, 1, 2, 3];
const CUSTOM_COLOR_LABELS = [
  "Background",
  "Primary",
  "Secondary",
  "Highlight",
] as const;
const CUSTOM_PALETTE_ID = "custom";
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/iu;

const clamp = (value: number, key: ControlKey) => {
  const bounds = CONTROL_BOUNDS[key];
  return Math.min(bounds.max, Math.max(bounds.min, value));
};

const roundForUrl = (value: number) => Math.round(value * 1000) / 1000;

const randomizeControlValue = (key: ControlKey) => {
  switch (key) {
    case "balance": {
      return roundForUrl(0.3 + Math.random() * 0.4);
    }
    case "colorMorph": {
      return Math.random() < 0.2 ? 0 : roundForUrl(0.08 + Math.random() * 0.92);
    }
    case "contrast": {
      return roundForUrl(0.34 + Math.random() * 0.3);
    }
    case "density": {
      return roundForUrl(0.28 + Math.random() * 0.4);
    }
    case "energy": {
      return roundForUrl(0.22 + Math.random() * 0.44);
    }
    case "grain": {
      return roundForUrl(Math.random() * 0.18);
    }
    case "phase": {
      return roundForUrl(0.24 + Math.random() * 0.44);
    }
    case "scale": {
      return roundForUrl(0.22 + Math.random() * 0.38);
    }
    case "speed": {
      return roundForUrl(0.12 + Math.random() * 0.42);
    }
    default: {
      const exhaustiveKey: never = key;
      return exhaustiveKey;
    }
  }
};

const normalizeHexColor = (value: string, fallback: string) =>
  HEX_COLOR_PATTERN.test(value) ? value.toLowerCase() : fallback;

const StudioFader = ({
  label,
  onChange,
  onCommit,
  onReset,
  parameter,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
  onReset: () => void;
  parameter: ControlKey;
  value: number;
}) => {
  const bounds = CONTROL_BOUNDS[parameter];
  const progress = (value - bounds.min) / (bounds.max - bounds.min);
  const percentage = Math.round(progress * 100);

  return (
    <div className="group flex min-w-0 flex-col items-center gap-2 text-center">
      <div className="relative h-20 w-10 rounded-md border border-border bg-linear-to-b from-muted/70 to-background shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_3px_10px_rgba(0,0,0,0.1)] transition-[border-color,box-shadow] duration-150 ease-out group-hover:border-foreground/25 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 motion-reduce:transition-none">
        <div aria-hidden="true" className="absolute inset-y-3 inset-x-2">
          {FADER_TICKS.map((tick) => (
            <span
              className="absolute inset-x-0 flex items-center justify-between"
              key={tick}
              style={{ bottom: `${tick}%` }}
            >
              <span className="h-px w-1.5 bg-border" />
              <span className="h-px w-1.5 bg-border" />
            </span>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-y-3 left-1/2 w-1 -translate-x-1/2 overflow-hidden rounded-full bg-background shadow-inner"
        >
          <span
            className="absolute inset-x-0 bottom-0 rounded-full bg-primary/70"
            style={{ height: `${percentage}%` }}
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-3 left-1/2"
        >
          <span
            className="absolute left-0 grid h-3 w-7 place-items-center rounded-[3px] border border-foreground/20 bg-linear-to-b from-foreground/90 to-foreground/70 shadow-[0_2px_5px_rgba(0,0,0,0.28)]"
            style={{
              bottom: `${percentage}%`,
              transform: "translate(-50%, 50%)",
            }}
          >
            <span className="h-px w-5 bg-background/55" />
          </span>
        </div>
        <input
          aria-label={label}
          aria-orientation="vertical"
          aria-valuetext={`${percentage}%`}
          className="absolute inset-y-2 left-1/2 w-9 -translate-x-1/2 cursor-ns-resize touch-none opacity-0"
          max={bounds.max}
          min={bounds.min}
          onBlur={(event) => onCommit(Number(event.currentTarget.value))}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
          onDoubleClick={onReset}
          onKeyUp={(event) => {
            if (
              event.key === "ArrowLeft" ||
              event.key === "ArrowRight" ||
              event.key === "ArrowDown" ||
              event.key === "ArrowUp" ||
              event.key === "Home" ||
              event.key === "End"
            ) {
              onCommit(Number(event.currentTarget.value));
            }
          }}
          onPointerUp={(event) => onCommit(Number(event.currentTarget.value))}
          step={bounds.step}
          title={`${label}: ${percentage}%. Double-click to reset.`}
          type="range"
          value={value}
          style={{ direction: "rtl", writingMode: "vertical-lr" }}
        />
      </div>
      <span
        className="line-clamp-2 min-h-6 text-[0.625rem] font-medium leading-3 text-muted-foreground"
        title={label}
      >
        {label}
      </span>
    </div>
  );
};

const PanelLabel = ({
  children,
  detail,
}: {
  children: React.ReactNode;
  detail?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-3">
    <h2 className="font-mono text-[0.6875rem] font-medium text-primary uppercase tracking-[0.16em]">
      {children}
    </h2>
    {detail}
  </div>
);

const ModeDock = ({
  activeMode,
  onSelect,
}: {
  activeMode: WallpaperMode;
  onSelect: (mode: ModeOption) => void;
}) => (
  <nav
    aria-label="Motion systems"
    className="pointer-events-auto flex max-w-full gap-1 overflow-x-auto rounded-md border border-white/12 bg-black/40 p-1 shadow-[0_16px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl"
  >
    {MODE_OPTIONS.map((mode) => {
      const Icon = mode.icon;
      const isActive = mode.id === activeMode;
      return (
        <button
          aria-pressed={isActive}
          className={cn(
            "flex min-w-fit items-center justify-center gap-1.5 rounded-sm px-2.5 py-2 text-[0.6875rem] font-semibold transition-[color,background-color,transform] duration-150 active:scale-[0.97]",
            isActive
              ? "bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
              : "text-white/50 hover:bg-white/8 hover:text-white/85"
          )}
          key={mode.id}
          onClick={() => onSelect(mode)}
          title={mode.name}
          type="button"
        >
          <Icon className={cn("size-3.5", isActive ? "text-primary" : "")} />
          <span className={cn(!isActive && "hidden xl:inline")}>
            {mode.name}
          </span>
        </button>
      );
    })}
  </nav>
);

interface InspectorProps {
  activeMode: ModeOption;
  config: WallpaperConfig;
  copied: boolean;
  customPalette: WallpaperPalette;
  onControlChange: (key: ControlKey, value: number) => void;
  onControlCommit: (key: ControlKey, value: number) => void;
  onCopy: () => void;
  onCustomColorChange: (index: PaletteColorIndex, color: string) => void;
  onDownload: () => void;
  onPaletteChange: (palette: WallpaperPalette) => void;
  onQualityChange: () => void;
  onReset: () => void;
  palette: WallpaperPalette;
}

const Inspector = ({
  activeMode,
  config,
  copied,
  customPalette,
  onControlChange,
  onControlCommit,
  onCopy,
  onCustomColorChange,
  onDownload,
  onPaletteChange,
  onQualityChange,
  onReset,
  palette,
}: InspectorProps) => {
  const getControlDefault = (key: ControlKey) =>
    key === "grain" ? 0.12 : activeMode.defaults[key];
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-4 p-4 pb-6">
          <section className="rounded-lg border bg-muted/25 p-3">
            <PanelLabel
              detail={
                <Button
                  aria-label={`Reset ${activeMode.name} motion`}
                  onClick={onReset}
                  size="icon-xs"
                  variant="ghost"
                >
                  <RotateCcw />
                </Button>
              }
            >
              System
            </PanelLabel>
            <div className="mt-2">
              <h2 className="font-heading text-lg font-semibold tracking-[-0.035em]">
                {activeMode.name}
              </h2>
              <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-muted-foreground">
                {activeMode.description}
              </p>
            </div>
          </section>

          <section className="space-y-2.5">
            <PanelLabel>Render</PanelLabel>
            <button
              aria-label={`Use ${config.ecoMode ? "high fidelity" : "adaptive"} rendering`}
              aria-pressed={config.ecoMode}
              className="flex w-full items-center justify-between rounded-md border bg-muted/35 p-2.5 text-left transition-colors duration-150 ease hover:bg-muted/60 motion-reduce:transition-none"
              onClick={onQualityChange}
              type="button"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-sm",
                    config.ecoMode
                      ? "bg-success/12 text-success"
                      : "bg-info/12 text-info"
                  )}
                >
                  {config.ecoMode ? (
                    <Leaf className="size-3.5" />
                  ) : (
                    <Gauge className="size-3.5" />
                  )}
                </span>
                <span>
                  <span className="block text-xs font-semibold">
                    {config.ecoMode ? "Adaptive" : "High fidelity"}
                  </span>
                  <span className="block text-[0.625rem] text-muted-foreground">
                    {config.ecoMode
                      ? "30 fps · capped DPR"
                      : "60 fps · full DPR"}
                  </span>
                </span>
              </span>
              <span
                className={cn(
                  "size-2 rounded-full",
                  config.ecoMode ? "bg-success" : "bg-info"
                )}
              />
            </button>
          </section>

          <section className="space-y-3 border-t pt-4">
            <PanelLabel detail={palette.name}>Color</PanelLabel>
            <div className="grid grid-cols-5 gap-2">
              {WALLPAPER_PALETTES.map((candidate) => (
                <button
                  aria-label={candidate.name}
                  aria-pressed={palette.id === candidate.id}
                  className={cn(
                    "aspect-square rounded-sm border bg-card p-1 shadow-xs transition-[border-color,transform,box-shadow] duration-150 ease active:scale-95 motion-reduce:transition-none",
                    palette.id === candidate.id
                      ? "border-primary shadow-[0_0_0_2px_color-mix(in_oklch,var(--primary),transparent_76%)]"
                      : "hover:border-foreground/30"
                  )}
                  key={candidate.id}
                  onClick={() => onPaletteChange(candidate)}
                  title={candidate.name}
                  type="button"
                >
                  <span
                    className="block size-full rounded-[1px]"
                    style={{
                      background: `linear-gradient(135deg, ${candidate.colors[0]} 12%, ${candidate.colors[1]} 48%, ${candidate.colors[2]} 78%, ${candidate.colors[3]})`,
                    }}
                  />
                </button>
              ))}
              <button
                aria-label="Custom palette"
                aria-pressed={palette.id === CUSTOM_PALETTE_ID}
                className={cn(
                  "relative aspect-square rounded-sm border bg-card p-1 shadow-xs transition-[border-color,transform,box-shadow] duration-150 ease active:scale-95 motion-reduce:transition-none",
                  palette.id === CUSTOM_PALETTE_ID
                    ? "border-primary shadow-[0_0_0_2px_color-mix(in_oklch,var(--primary),transparent_76%)]"
                    : "hover:border-foreground/30"
                )}
                onClick={() => onPaletteChange(customPalette)}
                title="Custom palette"
                type="button"
              >
                <span
                  className="block size-full rounded-[1px]"
                  style={{
                    background: `linear-gradient(135deg, ${customPalette.colors[0]} 12%, ${customPalette.colors[1]} 48%, ${customPalette.colors[2]} 78%, ${customPalette.colors[3]})`,
                  }}
                />
                <span className="absolute inset-0 grid place-items-center">
                  <Pipette className="size-3.5 rounded-full bg-black/55 p-0.5 text-white shadow-sm" />
                </span>
              </button>
            </div>
            {palette.id === CUSTOM_PALETTE_ID ? (
              <div className="grid grid-cols-4 gap-2 rounded-md border bg-muted/25 p-2">
                {CUSTOM_COLOR_INDICES.map((index) => (
                  <label
                    className="flex min-w-0 flex-col gap-1 text-center"
                    key={index}
                  >
                    <input
                      aria-label={`Custom palette ${CUSTOM_COLOR_LABELS[index].toLowerCase()}`}
                      className="h-8 w-full cursor-pointer rounded-sm border bg-transparent p-0.5"
                      onChange={(event) =>
                        onCustomColorChange(index, event.currentTarget.value)
                      }
                      type="color"
                      value={customPalette.colors[index]}
                    />
                    <span className="truncate text-[0.5625rem] text-muted-foreground">
                      {CUSTOM_COLOR_LABELS[index]}
                    </span>
                  </label>
                ))}
              </div>
            ) : null}
          </section>

          <section className="space-y-3 rounded-lg border bg-muted/20 p-3">
            <PanelLabel>Motion</PanelLabel>
            <div className="grid grid-cols-5 gap-2">
              {MOTION_CONTROLS.map((key) => (
                <StudioFader
                  key={key}
                  label={activeMode.labels[key]}
                  onChange={(value) => onControlChange(key, value)}
                  onCommit={(value) => onControlCommit(key, value)}
                  onReset={() => {
                    onControlChange(key, getControlDefault(key));
                    onControlCommit(key, getControlDefault(key));
                  }}
                  parameter={key}
                  value={config[key]}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-lg border bg-muted/20 p-3">
            <PanelLabel>Appearance</PanelLabel>
            <div className="grid grid-cols-4 gap-2">
              {APPEARANCE_CONTROLS.map((key) => (
                <StudioFader
                  key={key}
                  label={activeMode.labels[key]}
                  onChange={(value) => onControlChange(key, value)}
                  onCommit={(value) => onControlCommit(key, value)}
                  onReset={() => {
                    onControlChange(key, getControlDefault(key));
                    onControlCommit(key, getControlDefault(key));
                  }}
                  parameter={key}
                  value={config[key]}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2 border-t bg-card/95 p-3 backdrop-blur-xl">
        <Button onClick={onDownload}>
          <Download />
          Save
        </Button>
        <Button onClick={onCopy} variant="outline">
          {copied ? <Check /> : <Share2 />}
          {copied ? "Copied" : "Share"}
        </Button>
      </div>
    </div>
  );
};

export const WallpaperStudio = () => {
  const [query, setQuery] = useQueryStates(wallpaperSearchParams, {
    history: "replace",
    shallow: true,
  });
  const [areFullscreenControlsVisible, setAreFullscreenControlsVisible] =
    useState(true);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRandomizeMenuOpen, setIsRandomizeMenuOpen] = useState(false);
  const [controlValues, setControlValues] = useState<ControlValues>(() => ({
    balance: clamp(query.b, "balance"),
    colorMorph: clamp(query.cm, "colorMorph"),
    contrast: clamp(query.c, "contrast"),
    density: clamp(query.d, "density"),
    energy: clamp(query.w, "energy"),
    grain: clamp(query.g, "grain"),
    phase: clamp(query.ph, "phase"),
    scale: clamp(query.sc, "scale"),
    speed: clamp(query.s, "speed"),
  }));
  const canvasRef = useRef<WallpaperCanvasHandle>(null);
  const fullscreenControlsTimeoutRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const clearFullscreenControlsTimeout = useCallback(() => {
    if (fullscreenControlsTimeoutRef.current !== null) {
      window.clearTimeout(fullscreenControlsTimeoutRef.current);
      fullscreenControlsTimeoutRef.current = null;
    }
  }, []);
  const revealFullscreenControls = useCallback(() => {
    if (document.fullscreenElement !== stageRef.current) {
      return;
    }
    setAreFullscreenControlsVisible(true);
    clearFullscreenControlsTimeout();
    fullscreenControlsTimeoutRef.current = window.setTimeout(() => {
      setAreFullscreenControlsVisible(false);
      fullscreenControlsTimeoutRef.current = null;
    }, 2000);
  }, [clearFullscreenControlsTimeout]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const nextIsFullscreen = document.fullscreenElement === stageRef.current;
      setIsFullscreen(nextIsFullscreen);
      if (nextIsFullscreen) {
        revealFullscreenControls();
        return;
      }
      clearFullscreenControlsTimeout();
      setAreFullscreenControlsVisible(true);
      setIsRandomizeMenuOpen(false);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      clearFullscreenControlsTimeout();
    };
  }, [clearFullscreenControlsTimeout, revealFullscreenControls]);

  const activeMode = useMemo(
    () => MODE_OPTIONS.find((mode) => mode.id === query.m) ?? MODE_OPTIONS[0],
    [query.m]
  );
  const customPalette = useMemo<WallpaperPalette>(
    () => ({
      colors: [
        normalizeHexColor(query.c0, WALLPAPER_QUERY_DEFAULTS.customColor0),
        normalizeHexColor(query.c1, WALLPAPER_QUERY_DEFAULTS.customColor1),
        normalizeHexColor(query.c2, WALLPAPER_QUERY_DEFAULTS.customColor2),
        normalizeHexColor(query.c3, WALLPAPER_QUERY_DEFAULTS.customColor3),
      ],
      id: CUSTOM_PALETTE_ID,
      name: "Custom",
    }),
    [query.c0, query.c1, query.c2, query.c3]
  );
  const palette = useMemo(() => {
    if (query.p === CUSTOM_PALETTE_ID) {
      return customPalette;
    }
    return (
      WALLPAPER_PALETTES.find((candidate) => candidate.id === query.p) ??
      WALLPAPER_PALETTES[0]
    );
  }, [customPalette, query.p]);
  const config = useMemo<WallpaperConfig>(
    () => ({
      ...controlValues,
      ecoMode: query.e,
      isPaused,
      mode: activeMode.id,
      palette,
      seed: Math.max(0, Math.min(9999, query.seed)),
    }),
    [activeMode.id, controlValues, isPaused, palette, query.e, query.seed]
  );

  const updateControl = (key: ControlKey, nextValue: number) => {
    const value = roundForUrl(clamp(nextValue, key));
    setControlValues((current) => ({ ...current, [key]: value }));
  };

  const commitControl = (key: ControlKey, nextValue: number) => {
    const value = roundForUrl(clamp(nextValue, key));
    switch (key) {
      case "balance": {
        void setQuery({ b: value });
        return;
      }
      case "colorMorph": {
        void setQuery({ cm: value });
        return;
      }
      case "contrast": {
        void setQuery({ c: value });
        return;
      }
      case "density": {
        void setQuery({ d: value });
        return;
      }
      case "energy": {
        void setQuery({ w: value });
        return;
      }
      case "grain": {
        void setQuery({ g: value });
        return;
      }
      case "phase": {
        void setQuery({ ph: value });
        return;
      }
      case "scale": {
        void setQuery({ sc: value });
        return;
      }
      case "speed": {
        void setQuery({ s: value });
        return;
      }
      default: {
        const exhaustiveKey: never = key;
        return exhaustiveKey;
      }
    }
  };

  const selectMode = (mode: ModeOption) => {
    setControlValues({
      ...mode.defaults,
      colorMorph: controlValues.colorMorph,
      grain: controlValues.grain,
    });
    void setQuery({
      b: mode.defaults.balance,
      c: mode.defaults.contrast,
      cm: controlValues.colorMorph,
      d: mode.defaults.density,
      m: mode.id,
      ph: mode.defaults.phase,
      s: mode.defaults.speed,
      sc: mode.defaults.scale,
      w: mode.defaults.energy,
    });
  };

  const randomizeSettings = (mode?: WallpaperMode) => {
    const nextPalette =
      WALLPAPER_PALETTES[
        Math.floor(Math.random() * WALLPAPER_PALETTES.length)
      ] ?? WALLPAPER_PALETTES[0];
    const nextControls: ControlValues = {
      balance: randomizeControlValue("balance"),
      colorMorph: randomizeControlValue("colorMorph"),
      contrast: randomizeControlValue("contrast"),
      density: randomizeControlValue("density"),
      energy: randomizeControlValue("energy"),
      grain: randomizeControlValue("grain"),
      phase: randomizeControlValue("phase"),
      scale: randomizeControlValue("scale"),
      speed: randomizeControlValue("speed"),
    };
    setControlValues(nextControls);
    void setQuery({
      b: nextControls.balance,
      c: nextControls.contrast,
      cm: nextControls.colorMorph,
      d: nextControls.density,
      g: nextControls.grain,
      p: nextPalette.id,
      ph: nextControls.phase,
      s: nextControls.speed,
      sc: nextControls.scale,
      seed: Math.floor(Math.random() * 9999),
      w: nextControls.energy,
      ...(mode === undefined ? {} : { m: mode }),
    });
  };

  const shuffleSettings = () => {
    randomizeSettings();
  };

  const surpriseMe = () => {
    const mode =
      MODE_OPTIONS[Math.floor(Math.random() * MODE_OPTIONS.length)] ??
      MODE_OPTIONS[0];
    randomizeSettings(mode.id);
  };

  const resetMode = () => {
    setControlValues({
      ...activeMode.defaults,
      grain: 0.12,
    });
    void setQuery({
      b: activeMode.defaults.balance,
      c: activeMode.defaults.contrast,
      cm: activeMode.defaults.colorMorph,
      d: activeMode.defaults.density,
      g: 0.12,
      ph: activeMode.defaults.phase,
      s: activeMode.defaults.speed,
      sc: activeMode.defaults.scale,
      w: activeMode.defaults.energy,
    });
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const updateCustomColor = (index: PaletteColorIndex, color: string) => {
    switch (index) {
      case 0: {
        void setQuery({ c0: color, p: CUSTOM_PALETTE_ID });
        return;
      }
      case 1: {
        void setQuery({ c1: color, p: CUSTOM_PALETTE_ID });
        return;
      }
      case 2: {
        void setQuery({ c2: color, p: CUSTOM_PALETTE_ID });
        return;
      }
      case 3: {
        void setQuery({ c3: color, p: CUSTOM_PALETTE_ID });
        return;
      }
      default: {
        const exhaustiveIndex: never = index;
        return exhaustiveIndex;
      }
    }
  };

  const inspectorProps: InspectorProps = {
    activeMode,
    config,
    copied,
    customPalette,
    onControlChange: updateControl,
    onControlCommit: commitControl,
    onCopy: () => void copyShareLink(),
    onCustomColorChange: updateCustomColor,
    onDownload: () => canvasRef.current?.download(),
    onPaletteChange: (nextPalette) => void setQuery({ p: nextPalette.id }),
    onQualityChange: () => void setQuery({ e: !config.ecoMode }),
    onReset: resetMode,
    palette,
  };
  const fullscreenControlsClassName = cn(
    "transition-opacity duration-150 ease-out motion-reduce:transition-none",
    isFullscreen &&
      !areFullscreenControlsVisible &&
      !isRandomizeMenuOpen &&
      "pointer-events-none opacity-0"
  );

  return (
    <Sheet>
      <section className="flex h-full min-h-0 flex-col overflow-hidden bg-black">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-card/96 px-3 backdrop-blur-xl sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/12 text-primary ring-1 ring-primary/20">
              <Sparkles className="size-3.5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-heading text-sm font-semibold tracking-tight">
                Motion canvas
              </h1>
              <p className="hidden font-mono text-[0.5rem] text-muted-foreground uppercase tracking-[0.13em] sm:block">
                Generative wallpaper studio
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Badge className="hidden xl:inline-flex" variant="success">
              <span className="size-1.5 rounded-full bg-current" />
              WebGL live
            </Badge>
            <SheetTrigger
              render={
                <Button
                  className="lg:hidden"
                  size="icon-sm"
                  variant="outline"
                />
              }
            >
              <SlidersHorizontal />
              <span className="sr-only">Open controls</span>
            </SheetTrigger>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div
            className={cn(
              "relative min-w-0 flex-1 overflow-hidden fullscreen:size-full fullscreen:bg-black",
              isFullscreen &&
                !areFullscreenControlsVisible &&
                !isRandomizeMenuOpen &&
                "cursor-none"
            )}
            onMouseMove={revealFullscreenControls}
            onPointerDown={revealFullscreenControls}
            ref={stageRef}
          >
            <WallpaperCanvas config={config} ref={canvasRef} />

            <div
              className={cn(
                "absolute right-3 bottom-20 flex items-center gap-2 lg:right-4 lg:bottom-3",
                fullscreenControlsClassName
              )}
            >
              <Button
                className="border-white/15 bg-black/30 text-white backdrop-blur-xl hover:border-white/25 hover:bg-black/45"
                onClick={() => setIsPaused((current) => !current)}
                size="icon-sm"
                variant="outline"
              >
                {isPaused ? <Play /> : <Pause />}
                <span className="sr-only">
                  {isPaused ? "Play animation" : "Pause animation"}
                </span>
              </Button>
              <DropdownMenu
                onOpenChange={(open) => {
                  setIsRandomizeMenuOpen(open);
                  revealFullscreenControls();
                }}
                open={isRandomizeMenuOpen}
              >
                <DropdownMenuTrigger
                  render={
                    <Button
                      className="border-white/15 bg-black/30 text-white backdrop-blur-xl hover:border-white/25 hover:bg-black/45"
                      size="sm"
                      variant="outline"
                    />
                  }
                >
                  <RefreshCw />
                  Seed {String(config.seed).padStart(4, "0")}
                  <ChevronDown className="size-3 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56"
                  portalContainer={isFullscreen ? stageRef : undefined}
                  side="top"
                  sideOffset={8}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Randomize wallpaper</DropdownMenuLabel>
                    <DropdownMenuItem
                      className="items-start py-2"
                      closeOnClick={false}
                      onClick={() =>
                        void setQuery({
                          seed: Math.floor(Math.random() * 9999),
                        })
                      }
                    >
                      <RefreshCw className="mt-0.5" />
                      <span>
                        <span className="block font-medium">New seed</span>
                        <span className="block text-muted-foreground text-xs">
                          Change the pattern, keep your settings
                        </span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="items-start py-2"
                      closeOnClick={false}
                      onClick={shuffleSettings}
                    >
                      <SlidersHorizontal className="mt-0.5" />
                      <span>
                        <span className="block font-medium">
                          Shuffle settings
                        </span>
                        <span className="block text-muted-foreground text-xs">
                          Keep {activeMode.name}, randomize the rest
                        </span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="items-start py-2"
                      closeOnClick={false}
                      onClick={surpriseMe}
                    >
                      <Shuffle className="mt-0.5" />
                      <span>
                        <span className="block font-medium">Surprise me</span>
                        <span className="block text-muted-foreground text-xs">
                          Randomize everything
                        </span>
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                className="border-white/15 bg-black/30 text-white backdrop-blur-xl hover:border-white/25 hover:bg-black/45"
                onClick={() => void copyShareLink()}
                size="icon-sm"
                variant="outline"
              >
                {copied ? <Check /> : <Share2 />}
                <span className="sr-only">
                  {copied ? "Share link copied" : "Copy share link"}
                </span>
              </Button>
              <Button
                className="border-white/15 bg-black/30 text-white backdrop-blur-xl hover:border-white/25 hover:bg-black/45"
                onClick={() => {
                  if (isFullscreen) {
                    void document.exitFullscreen();
                    return;
                  }
                  void stageRef.current?.requestFullscreen();
                }}
                size="icon-sm"
                variant="outline"
              >
                {isFullscreen ? <Minimize2 /> : <Expand />}
                <span className="sr-only">
                  {isFullscreen ? "Exit full screen" : "Full screen"}
                </span>
              </Button>
            </div>

            <div
              className={cn(
                "pointer-events-none absolute inset-x-2 bottom-3 flex justify-center lg:inset-x-44",
                fullscreenControlsClassName
              )}
            >
              <ModeDock activeMode={config.mode} onSelect={selectMode} />
            </div>
          </div>

          <aside className="hidden h-full w-80 shrink-0 border-l bg-card lg:block">
            <Inspector {...inspectorProps} />
          </aside>
        </div>
      </section>

      <SheetContent
        className="flex h-full w-[min(22rem,92vw)] flex-col bg-card p-0"
        side="right"
      >
        <SheetHeader className="shrink-0 border-b px-4 py-3">
          <SheetTitle>Controls</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1">
          <Inspector {...inspectorProps} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
