/** User-facing routes. Keep in sync with `src/routes`. */
export interface SitePage {
  id: string;
  path: string;
  /** Visible when the page has painted */
  ready: string;
}

const projects = [
  "govdash-capture-cloud",
  "gorjian-platform",
  "whop-backend",
  "pm-ivas",
  "plantry",
  "full-stack-skeleton",
  "artestian",
  "personal-site",
] as const;

export const HOME: SitePage = { id: "home", path: "/", ready: "main h1" };

export const SITE_PAGES: SitePage[] = [
  HOME,
  { id: "about", path: "/about", ready: "main h1" },
  { id: "work-index", path: "/work", ready: "main h1" },
  { id: "posts-index", path: "/posts", ready: "main h1" },
  { id: "playground", path: "/playground", ready: "main h1" },
  {
    id: "wallpaper-lab",
    path: "/wallpaper-lab",
    ready: "main",
  },
  {
    id: "depths",
    path: "/depths",
    ready: "[data-testid='depths-game']",
  },
  { id: "75-hard", path: "/75-hard", ready: "main" },
  {
    id: "post-01-hello-world",
    path: "/posts/01-hello-world",
    ready: "main h1",
  },
  ...projects.map((slug) => ({
    id: `work-${slug}`,
    path: `/work/${slug}`,
    ready: "main h1",
  })),
];

export const NAV_PATHS = ["/work", "/posts", "/about", "/playground"] as const;

/** Representative widths; skip exact `md` (768) where desktop nav is tight. */
export const RESPONSIVE_WIDTHS = [320, 390, 767, 820, 1280] as const;

export const isPhone = (project: string) =>
  /iphone|pixel|galaxy|se\b/iu.test(project) && !/ipad/iu.test(project);

export const isMobile = (project: string) =>
  /iphone|pixel|galaxy|ipad/iu.test(project);
