export type PlaygroundAccent = "amber" | "info" | "primary";

export type PlaygroundGraphic =
  | "depths"
  | "endurance"
  | "storybook"
  | "wallpaper";

export type PlaygroundRoute =
  | "/75-hard"
  | "/depths"
  | "/storybook"
  | "/wallpaper-lab";

export interface PlaygroundItem {
  accent: PlaygroundAccent;
  description: string;
  eyebrow: string;
  graphic: PlaygroundGraphic;
  navDescription: string;
  title: string;
  to: PlaygroundRoute;
}

export const playgroundItems: readonly PlaygroundItem[] = [
  {
    accent: "info",
    description:
      "Compose living backdrops from flow, type, glass, contours, and interference.",
    eyebrow: "Interactive · WebGL",
    graphic: "wallpaper",
    navDescription:
      "Compose living backdrops with type, glass, and interference.",
    title: "Wallpaper lab",
    to: "/wallpaper-lab",
  },
  {
    accent: "primary",
    description:
      "Training for the NYC Marathon, getting wedding-ready, and logging all 75 days.",
    eyebrow: "Live · July—September 2026",
    graphic: "endurance",
    navDescription: "Training for the NYC Marathon and logging all 75 days.",
    title: "75 Hard",
    to: "/75-hard",
  },
  {
    accent: "amber",
    description:
      "Read the doors, build a relic set, and chase the public arcade high score.",
    eyebrow: "Playable · Endless",
    graphic: "depths",
    navDescription:
      "An endless procedural dungeon with relic builds and arcade scores.",
    title: "Depths",
    to: "/depths",
  },
  {
    accent: "info",
    description:
      "Every component on one page—tune tokens, variants, and states against real surfaces.",
    eyebrow: "Reference · Living docs",
    graphic: "storybook",
    navDescription:
      "A living gallery for dialing in components, variants, and tokens.",
    title: "Storybook",
    to: "/storybook",
  },
];
