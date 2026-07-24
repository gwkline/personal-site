import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  DoorOpen,
  Route as RouteIcon,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cardVariants } from "@/components/ui/card";
import type {
  PlaygroundAccent,
  PlaygroundGraphic,
  PlaygroundItem,
} from "@/lib/playground";
import { cn } from "@/lib/utils";

const accentStyles = {
  amber: {
    arrow:
      "group-hover/card:text-amber-700 dark:group-hover/card:text-amber-200",
    background:
      "bg-[radial-gradient(circle_at_80%_12%,color-mix(in_oklch,#e9a23b_14%,transparent),transparent_40%),radial-gradient(circle_at_12%_95%,color-mix(in_oklch,#6a3e73_18%,transparent),transparent_42%),var(--surface-sunken)]",
    eyebrow: "text-amber-700 dark:text-amber-200",
    icon: "bg-amber-500/12 text-amber-700 ring-amber-600/25 dark:bg-amber-300/10 dark:text-amber-200 dark:ring-amber-200/20",
    line: "via-amber-500/70 dark:via-amber-300/70",
  },
  info: {
    arrow: "group-hover/card:text-info",
    background:
      "bg-[radial-gradient(circle_at_82%_12%,color-mix(in_oklch,var(--info)_15%,transparent),transparent_38%),radial-gradient(circle_at_12%_92%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_42%),var(--card)]",
    eyebrow: "text-info",
    icon: "bg-info/12 text-info ring-info/20",
    line: "via-info/70",
  },
  primary: {
    arrow: "group-hover/card:text-primary",
    background:
      "bg-[radial-gradient(circle_at_85%_15%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_38%),var(--card)]",
    eyebrow: "text-primary",
    icon: "bg-primary/12 text-primary ring-primary/20",
    line: "via-primary/70",
  },
} satisfies Record<
  PlaygroundAccent,
  {
    arrow: string;
    background: string;
    eyebrow: string;
    icon: string;
    line: string;
  }
>;

const graphicIcons = {
  depths: DoorOpen,
  endurance: RouteIcon,
  wallpaper: Waves,
} satisfies Record<PlaygroundGraphic, LucideIcon>;

const WallpaperVisual = () => (
  <div
    aria-hidden="true"
    className="relative my-7 h-32 overflow-hidden rounded-xl border bg-[#070914]"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(247,241,227,0.1),transparent_30%),radial-gradient(circle_at_82%_74%,rgba(255,92,53,0.12),transparent_36%),linear-gradient(135deg,#070914_0%,#0d0c14_46%,#16100f_100%)]" />
    <div className="absolute -top-16 left-4 h-36 w-64 rotate-[-18deg] rounded-full bg-[#f7f1e3]/8 blur-2xl transition-transform duration-300 ease-out group-hover/card:translate-x-4" />
    <div className="absolute right-0 -bottom-14 h-32 w-56 rotate-[16deg] rounded-full bg-[#ff5c35]/12 blur-2xl transition-transform duration-300 ease-out group-hover/card:-translate-x-3" />
    <svg
      className="absolute inset-0 size-full"
      preserveAspectRatio="none"
      viewBox="0 0 320 128"
    >
      <defs>
        <filter id="wallpaper-flow-grain">
          <feTurbulence
            baseFrequency="0.72"
            numOctaves="4"
            seed="2049"
            type="fractalNoise"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <linearGradient id="wallpaper-flow-vein" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#f7f1e3" stopOpacity="0" />
          <stop offset="0.38" stopColor="#f7f1e3" stopOpacity="0.18" />
          <stop offset="0.58" stopColor="#ff5c35" stopOpacity="0.24" />
          <stop offset="1" stopColor="#ffc857" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        filter="url(#wallpaper-flow-grain)"
        height="128"
        opacity="0.2"
        width="320"
      />
      <path
        className="origin-center transition-transform duration-300 ease-in-out group-hover/card:-translate-x-2"
        d="M-34 79C18 39 57 91 109 59C161 27 204 32 251 63C288 87 317 71 351 42"
        fill="none"
        stroke="url(#wallpaper-flow-vein)"
        strokeLinecap="round"
        strokeWidth="28"
      />
      <path
        className="origin-center transition-transform duration-300 ease-in-out group-hover/card:translate-x-3"
        d="M-30 45C24 70 58 13 108 38C158 64 190 91 244 58C284 33 309 42 350 68"
        fill="none"
        stroke="url(#wallpaper-flow-vein)"
        strokeLinecap="round"
        strokeOpacity="0.72"
        strokeWidth="18"
      />
      <path
        d="M8 72C56 44 92 74 136 51C179 28 217 51 266 39"
        fill="none"
        stroke="#f7f1e3"
        strokeLinecap="round"
        strokeOpacity="0.28"
        strokeWidth="2"
      />
      <g fill="#f7f1e3" opacity="0.12">
        <circle cx="38" cy="27" r="1.2" />
        <circle cx="74" cy="93" r="0.9" />
        <circle cx="232" cy="24" r="1.1" />
        <circle cx="286" cy="88" r="0.8" />
        <circle cx="156" cy="96" r="0.7" />
        <circle cx="198" cy="42" r="0.6" />
      </g>
    </svg>
    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,rgba(247,241,227,0.035)_3px)] opacity-70 mix-blend-screen" />
    <span className="absolute top-3 left-3 font-mono text-[0.5625rem] text-[#ffc857] uppercase tracking-[0.14em]">
      Flow / granite field
    </span>
    <div className="absolute right-3 bottom-3 flex gap-1.5">
      {["#070914", "#ff5c35", "#ffc857", "#f7f1e3"].map((color) => (
        <span
          className="size-3 rounded-full border border-white/25"
          key={color}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  </div>
);

const EnduranceVisual = () => (
  <div
    aria-hidden="true"
    className="relative my-7 h-32 overflow-hidden rounded-xl border bg-surface-sunken"
  >
    <svg className="absolute inset-0 size-full" viewBox="0 0 320 128">
      <g fill="none" stroke="var(--border)" strokeWidth="1">
        <path d="M18 22H300M18 48H300M18 76H300M18 104H300" />
        <path d="M42 10V118M82 10V118M128 10V118M176 10V118M224 10V118M278 10V118" />
        <path d="M18 33H70V90H112V17H160V110H205V55H252V97H300" />
      </g>
      <path
        className="[stroke-dasharray:1] [stroke-dashoffset:0.18] transition-[stroke-dashoffset] duration-300 ease-out group-hover/card:[stroke-dashoffset:0]"
        d="M35 96C52 84 45 63 69 61C93 58 91 89 117 85C146 81 134 43 164 41C195 39 190 76 216 73C246 70 246 42 286 35"
        fill="none"
        pathLength="1"
        stroke="var(--primary)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <circle
        cx="35"
        cy="96"
        fill="var(--card)"
        r="5"
        stroke="var(--primary)"
      />
      <circle
        className="transition-transform duration-300 ease-out group-hover/card:translate-x-1 group-hover/card:-translate-y-1"
        cx="286"
        cy="35"
        fill="var(--primary)"
        r="6"
      />
      <path
        d="M283 35L285 37L289 32.5"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
    <span className="absolute top-3 left-3 font-mono text-[0.5625rem] text-primary uppercase tracking-[0.14em]">
      NYC / 26.2 miles
    </span>
    <span className="absolute right-3 bottom-3 rounded-md border bg-card/80 px-2 py-1 font-mono text-[0.5625rem] text-muted-foreground backdrop-blur">
      DAY 01 → 75
    </span>
  </div>
);

const DepthsVisual = () => (
  <div
    aria-hidden="true"
    className="relative my-7 h-32 overflow-hidden rounded-xl border bg-[radial-gradient(circle_at_50%_28%,rgba(233,162,59,0.14),transparent_52%),linear-gradient(135deg,#080711_0%,#120b14_62%,#1a0f09_100%)]"
  >
    <svg className="absolute inset-0 size-full" viewBox="0 0 320 128">
      <g
        className="origin-center transition-transform duration-300 ease-in-out group-hover/card:scale-105"
        fill="#17111f"
        stroke="color-mix(in oklch, #e9a23b 58%, var(--border))"
      >
        <path d="M45 108V35C45 26 52 19 61 19H111C120 19 127 26 127 35V108Z" />
        <path d="M193 108V35C193 26 200 19 209 19H259C268 19 275 26 275 35V108Z" />
      </g>
      <g
        fill="none"
        stroke="color-mix(in oklch, #e9a23b 70%, var(--foreground))"
      >
        <path d="M59 108V39C59 34 63 30 68 30H104C109 30 113 34 113 39V108" />
        <path d="M207 108V39C207 34 211 30 216 30H252C257 30 261 34 261 39V108" />
      </g>
      <circle cx="101" cy="70" fill="#e9a23b" r="3" />
      <circle cx="249" cy="70" fill="#e9a23b" r="3" />
      <path
        className="transition-[opacity,transform] duration-300 ease-out group-hover/card:translate-y-1 group-hover/card:opacity-100"
        d="M133 73H187M151 59L161 73L151 87M169 59L159 73L169 87"
        fill="none"
        stroke="var(--muted-foreground)"
        strokeDasharray="3 5"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
      <path
        d="M22 109H298"
        stroke="var(--muted-foreground)"
        strokeOpacity="0.28"
      />
    </svg>
    <span className="absolute top-3 left-3 font-mono text-[0.5625rem] text-amber-700 uppercase tracking-[0.14em] dark:text-amber-200">
      Choose a door
    </span>
  </div>
);

const PlaygroundVisual = ({ graphic }: { graphic: PlaygroundGraphic }) => {
  switch (graphic) {
    case "wallpaper": {
      return <WallpaperVisual />;
    }
    case "endurance": {
      return <EnduranceVisual />;
    }
    case "depths": {
      return <DepthsVisual />;
    }
    default: {
      const exhaustiveGraphic: never = graphic;
      return exhaustiveGraphic;
    }
  }
};

export const PlaygroundCard = ({
  className,
  compact = false,
  item,
}: {
  className?: string;
  compact?: boolean;
  item: PlaygroundItem;
}) => {
  const styles = accentStyles[item.accent];
  const Icon = graphicIcons[item.graphic];

  return (
    <Link
      className={cn(
        cardVariants({ variant: "interactive" }),
        "group/card relative block overflow-hidden rounded-2xl p-6 sm:p-8",
        styles.background,
        compact ? "min-h-72" : "min-h-96",
        className
      )}
      to={item.to}
    >
      <div
        className={cn(
          "absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent to-transparent",
          styles.line
        )}
      />
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "grid size-11 place-content-center rounded-xl ring-1",
            styles.icon
          )}
        >
          <Icon className="size-5" />
        </span>
        <ArrowUpRight
          className={cn(
            "size-5 text-muted-foreground transition-[color,transform] duration-200 ease-out group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5",
            styles.arrow
          )}
        />
      </div>

      <PlaygroundVisual graphic={item.graphic} />

      <p
        className={cn(
          "mb-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em]",
          styles.eyebrow
        )}
      >
        {item.eyebrow}
      </p>
      <h3 className="font-heading text-3xl font-semibold tracking-[-0.04em]">
        {item.title}
      </h3>
      <p className="mt-3 max-w-xl text-muted-foreground text-sm leading-relaxed">
        {item.description}
      </p>
    </Link>
  );
};
