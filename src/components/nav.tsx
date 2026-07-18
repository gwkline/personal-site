import SiGithub from "@icons-pack/react-simple-icons/icons/SiGithub.mjs";
import SiX from "@icons-pack/react-simple-icons/icons/SiX.mjs";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  FlaskConical,
  MailIcon,
  Menu,
  Moon,
  Send,
  Sun,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import { LiveStatsNav } from "@/components/live-stats";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getPosts } from "@/lib/posts";
import { getProjects } from "@/lib/projects";
import { cn } from "@/lib/utils";

const NAV_PREVIEW_ITEM_LIMIT = 3;
type NavSubitem =
  | {
      description: string;
      params: { slug: string };
      title: string;
      to: "/posts/$slug" | "/work/$slug";
    }
  | {
      description: string;
      title: string;
      to: "/75-hard" | "/wallpaper-lab";
    }
  | {
      description: string;
      hash: "background" | "toolkit" | "working-style";
      title: string;
      to: "/about";
    };
const workSubitems: NavSubitem[] = getProjects()
  .slice(0, NAV_PREVIEW_ITEM_LIMIT)
  .map((project) => ({
    description: `${project.role} · ${project.period}`,
    params: { slug: project.slug },
    title: project.title,
    to: "/work/$slug",
  }));
const postSubitems: NavSubitem[] = getPosts()
  .slice(0, NAV_PREVIEW_ITEM_LIMIT)
  .map((post) => ({
    description: `${post.date} · ${post.readingTime}`,
    params: { slug: post.slug },
    title: post.title,
    to: "/posts/$slug",
  }));
const aboutSubitems = (
  [
    {
      description: "The path from computer science to engineering leadership.",
      hash: "background",
      title: "Background",
      to: "/about",
    },
    {
      description:
        "How I balance architecture, product, and hands-on execution.",
      hash: "working-style",
      title: "How I work",
      to: "/about",
    },
    {
      description: "The technologies I reach for to build dependable systems.",
      hash: "toolkit",
      title: "Core technologies",
      to: "/about",
    },
  ] satisfies NavSubitem[]
).slice(0, NAV_PREVIEW_ITEM_LIMIT);
const playgroundSubitems = (
  [
    {
      description:
        "Compose living backdrops with type, glass, and interference.",
      title: "Wallpaper lab",
      to: "/wallpaper-lab",
    },
    {
      description: "Training for the NYC Marathon and logging all 75 days.",
      title: "75 Hard",
      to: "/75-hard",
    },
  ] satisfies NavSubitem[]
).slice(0, NAV_PREVIEW_ITEM_LIMIT);
const navItems = [
  {
    allLabel: "View all work",
    description:
      "Selected products, platforms, and open-source projects built to hold up in the real world.",
    eyebrow: "Portfolio",
    icon: BriefcaseBusiness,
    path: "/work",
    subitems: workSubitems,
    title: "Work",
  },
  {
    allLabel: "View all posts",
    description:
      "Notes on software, design, engineering leadership, and the craft of shipping.",
    eyebrow: "Field notes",
    icon: FileText,
    path: "/posts",
    subitems: postSubitems,
    title: "Posts",
  },
  {
    allLabel: "View about",
    description:
      "My background, the tools I reach for, and how I approach building and leading.",
    eyebrow: "About Gavin",
    icon: UserRound,
    path: "/about",
    subitems: aboutSubitems,
    title: "About",
  },
  {
    allLabel: "View all experiments",
    description:
      "Interactive experiments and ongoing builds that do not fit anywhere else.",
    eyebrow: "Open lab",
    icon: FlaskConical,
    path: "/playground",
    subitems: playgroundSubitems,
    title: "Playground",
  },
] as const;
type NavItem = (typeof navItems)[number];
const NavGraphicPreview = ({ path }: Pick<NavItem, "path">) => {
  if (path === "/work") {
    return (
      <div
        aria-hidden="true"
        className="relative h-20 overflow-hidden rounded-xl border bg-surface-sunken p-2"
      >
        <div className="h-full rounded-md border bg-card p-2 shadow-elevation-1">
          <div className="flex gap-1">
            <span className="size-1 rounded-full bg-primary/70" />
            <span className="size-1 rounded-full bg-muted-foreground/30" />
            <span className="size-1 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="mt-2 grid h-8 grid-cols-3 items-end gap-1.5">
            <span className="h-4 rounded-sm bg-primary/20 ring-1 ring-primary/25" />
            <span className="h-7 rounded-sm bg-primary/35 ring-1 ring-primary/30" />
            <span className="h-5 rounded-sm bg-info/25 ring-1 ring-info/25" />
          </div>
        </div>
      </div>
    );
  }
  if (path === "/posts") {
    return (
      <div
        aria-hidden="true"
        className="relative h-20 overflow-hidden rounded-xl border bg-surface-sunken"
      >
        <div className="absolute inset-y-2 right-2 left-3 rotate-2 rounded-md border bg-card p-2 shadow-elevation-1">
          <span className="block h-1.5 w-7 rounded-full bg-primary/55" />
          <span className="mt-2 block h-1 w-full rounded-full bg-muted-foreground/25" />
          <span className="mt-1.5 block h-1 w-11/12 rounded-full bg-muted-foreground/20" />
          <span className="mt-1.5 block h-1 w-3/4 rounded-full bg-muted-foreground/20" />
        </div>
      </div>
    );
  }
  if (path === "/about") {
    return (
      <div
        aria-hidden="true"
        className="relative grid h-20 place-content-center overflow-hidden rounded-xl border bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_65%),var(--surface-sunken)]"
      >
        <span className="absolute top-2 left-2 rounded border bg-card/80 px-1.5 py-0.5 font-mono text-[0.5rem] text-muted-foreground shadow-sm">
          TS
        </span>
        <span className="absolute right-2 bottom-2 rounded border bg-card/80 px-1.5 py-0.5 font-mono text-[0.5rem] text-muted-foreground shadow-sm">
          AI
        </span>
        <span className="grid size-10 place-content-center rounded-xl border bg-card shadow-elevation-2">
          <img alt="" height="22" src="/logo.png" width="22" />
        </span>
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className="relative h-20 overflow-hidden rounded-xl border bg-[radial-gradient(circle_at_25%_30%,color-mix(in_oklch,var(--info)_35%,transparent),transparent_34%),radial-gradient(circle_at_75%_70%,color-mix(in_oklch,var(--primary)_35%,transparent),transparent_38%),var(--surface-sunken)]"
    >
      <span className="absolute top-3 left-2 h-8 w-14 -rotate-12 rounded-full border border-info/40 bg-info/10 blur-[0.5px]" />
      <span className="absolute right-1 bottom-2 h-7 w-12 rotate-12 rounded-full border border-primary/45 bg-primary/10 blur-[0.5px]" />
      <span className="absolute inset-x-3 top-1/2 h-px -rotate-6 bg-linear-to-r from-transparent via-foreground/35 to-transparent" />
      <span className="absolute inset-x-3 top-[58%] h-px rotate-3 bg-linear-to-r from-transparent via-foreground/20 to-transparent" />
    </div>
  );
};
const NavSubitemGraphic = ({ item }: { item: NavSubitem }) => {
  if (item.to === "/work/$slug") {
    return (
      <span
        aria-hidden="true"
        className="relative grid size-9 shrink-0 place-content-center overflow-hidden rounded-md border bg-[radial-gradient(circle_at_75%_20%,color-mix(in_oklch,var(--primary)_35%,transparent),transparent_45%),var(--surface-sunken)] font-heading text-xs font-semibold shadow-sm"
      >
        <span className="absolute inset-x-1.5 bottom-1.5 h-1 rounded-full bg-primary/20" />
        <span className="relative">{item.title.slice(0, 1)}</span>
      </span>
    );
  }
  if (item.to === "/posts/$slug") {
    return (
      <span
        aria-hidden="true"
        className="relative size-9 shrink-0 overflow-hidden rounded-md border bg-surface-sunken p-1.5"
      >
        <span className="block h-full rotate-3 rounded-[0.2rem] border bg-card p-1 shadow-sm">
          <span className="block h-0.5 w-3 rounded-full bg-primary/60" />
          <span className="mt-1 block h-px w-full rounded-full bg-muted-foreground/25" />
          <span className="mt-1 block h-px w-4/5 rounded-full bg-muted-foreground/20" />
        </span>
      </span>
    );
  }
  if (item.to === "/about") {
    return (
      <span
        aria-hidden="true"
        className="relative grid size-9 shrink-0 place-content-center overflow-hidden rounded-md border bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_55%),var(--surface-sunken)]"
      >
        <span className="size-3 rounded-sm border border-primary/40 bg-primary/15 shadow-[7px_7px_0_color-mix(in_oklch,var(--info)_20%,transparent)]" />
      </span>
    );
  }
  if (item.to === "/wallpaper-lab") {
    return (
      <span
        aria-hidden="true"
        className="size-9 shrink-0 overflow-hidden rounded-md border bg-surface-sunken"
      >
        <svg className="size-full" viewBox="0 0 36 36">
          <path
            d="M-3 24C3 24 4 12 10 12C16 12 15 25 21 25C27 25 27 10 33 10C36 10 38 13 40 16"
            fill="none"
            stroke="var(--primary)"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
          <path
            d="M-2 29C5 29 6 18 12 18C18 18 18 30 24 30C30 30 31 18 38 18"
            fill="none"
            stroke="var(--info)"
            strokeLinecap="round"
            strokeOpacity="0.6"
            strokeWidth="1.25"
          />
          <circle
            cx="27.5"
            cy="10.5"
            fill="var(--card)"
            r="3.25"
            stroke="var(--primary)"
            strokeOpacity="0.65"
          />
        </svg>
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="size-9 shrink-0 overflow-hidden rounded-md border bg-surface-sunken"
    >
      <svg className="size-full" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          fill="var(--card)"
          r="11"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <circle
          cx="18"
          cy="18"
          fill="none"
          pathLength="100"
          r="11"
          stroke="var(--primary)"
          strokeDasharray="75 100"
          strokeLinecap="round"
          strokeWidth="2"
          transform="rotate(-90 18 18)"
        />
        <text
          fill="var(--foreground)"
          fontFamily="var(--font-mono)"
          fontSize="7"
          fontWeight="650"
          textAnchor="middle"
          x="18"
          y="20.5"
        >
          75
        </text>
      </svg>
    </span>
  );
};
const NavSubitemContent = ({ item }: { item: NavSubitem }) => (
  <>
    <span className="flex min-w-0 items-center gap-2.5">
      <NavSubitemGraphic item={item} />
      <span className="min-w-0">
        <span className="block truncate font-medium text-sm">{item.title}</span>
        <span className="mt-0.5 block truncate text-muted-foreground text-xs">
          {item.description}
        </span>
      </span>
    </span>
    <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover/nav-subitem:text-primary" />
  </>
);
const navSubitemClassName =
  "group/nav-subitem flex items-start justify-between gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none";
const NavSubitemLink = ({ item }: { item: NavSubitem }) => {
  if (item.to === "/about") {
    return (
      <Link className={navSubitemClassName} hash={item.hash} to={item.to}>
        <NavSubitemContent item={item} />
      </Link>
    );
  }
  if (item.to === "/posts/$slug" || item.to === "/work/$slug") {
    return (
      <Link className={navSubitemClassName} params={item.params} to={item.to}>
        <NavSubitemContent item={item} />
      </Link>
    );
  }
  return (
    <Link className={navSubitemClassName} to={item.to}>
      <NavSubitemContent item={item} />
    </Link>
  );
};
const NavHoverCard = ({ item }: { item: NavItem }) => (
  <>
    <div className="relative bg-[radial-gradient(circle_at_88%_8%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_42%),var(--popover)] p-4">
      <div className="absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
      <div className="grid grid-cols-[minmax(0,1fr)_5rem] gap-4">
        <div>
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-content-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
              <item.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[0.625rem] font-medium text-primary uppercase tracking-[0.16em]">
                {item.eyebrow}
              </p>
              <p className="mt-1 font-heading text-base font-semibold tracking-[-0.02em]">
                {item.title}
              </p>
            </div>
          </div>
          <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
            {item.description}
          </p>
        </div>
        <NavGraphicPreview path={item.path} />
      </div>
    </div>
    <div className="space-y-0.5 border-t p-1.5">
      {item.subitems.map((subitem) => (
        <NavSubitemLink item={subitem} key={subitem.title} />
      ))}
    </div>
    <Link
      className="flex items-center justify-between border-t bg-surface-sunken/60 px-4 py-2.5 font-medium text-xs transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
      to={item.path}
    >
      <span>{item.allLabel}</span>
      <ArrowUpRight className="size-3.5 text-primary" />
    </Link>
  </>
);
const DesktopNav = ({ isActive }: { isActive: (path: string) => boolean }) => (
  <HoverCard<NavItem>>
    {({ payload }) => (
      <>
        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <HoverCardTrigger
                  payload={item}
                  render={
                    <Link
                      className={cn(
                        "rounded-lg px-3 py-2 font-medium text-sm transition-[color,background-color,box-shadow]",
                        active
                          ? "bg-card text-foreground shadow-elevation-1"
                          : "text-muted-foreground hover:bg-muted/65 hover:text-foreground"
                      )}
                      to={item.path}
                    />
                  }
                >
                  {item.title}
                </HoverCardTrigger>
              </li>
            );
          })}
        </ul>
        <HoverCardContent
          align="start"
          className="w-80 overflow-hidden p-0 shadow-elevation-3"
          sideOffset={10}
        >
          {payload ? <NavHoverCard item={payload} /> : null}
        </HoverCardContent>
      </>
    )}
  </HoverCard>
);
const contactLinks = [
  {
    href: "https://github.com/gwkline",
    icon: SiGithub,
    title: "GitHub",
  },
  {
    href: "https://x.com/washedkline",
    icon: SiX,
    title: "Twitter",
  },
  {
    href: "https://linkedin.com/in/gavinkline",
    icon: BriefcaseBusiness,
    title: "LinkedIn",
  },
  {
    href: "mailto:hello@gavinkline.com",
    icon: MailIcon,
    title: "Email",
  },
];
const useReadingProgress = (enabled: boolean) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const scrollContainer = document.querySelector<HTMLElement>(
      "#app-scroll-container"
    );
    if (!scrollContainer) {
      return;
    }
    const updateProgress = () => {
      const scrollable =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      setProgress((scrollContainer.scrollTop / scrollable) * 100);
    };
    updateProgress();
    scrollContainer.addEventListener("scroll", updateProgress, {
      passive: true,
    });
    return () => scrollContainer.removeEventListener("scroll", updateProgress);
  }, [enabled]);
  return enabled ? progress : 0;
};
const MobileNav = ({ isActive }: { isActive: (path: string) => boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger
        render={<Button className="md:hidden" size="icon-sm" variant="ghost" />}
      >
        <Menu className="size-5" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent
        className="w-80 border-r bg-card/95 backdrop-blur-xl"
        side="left"
      >
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <img alt="Gavin Kline" height="auto" src="/logo.png" width={20} />
            <span>Navigation</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <SheetClose
              key={item.path}
              nativeButton={false}
              render={
                <Link
                  className={cn(
                    "rounded-lg px-3 py-2.5 font-semibold text-sm transition-colors",
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground shadow-elevation-1"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  to={item.path}
                />
              }
            >
              {item.title}
            </SheetClose>
          ))}
        </nav>

        <Separator />

        <div className="p-4">
          <p className="mb-3 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Connect
          </p>
          <div className="flex flex-col gap-1">
            {contactLinks.map((link) => (
              <a
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                href={link.href}
                key={link.title}
                rel="noopener noreferrer"
                target="_blank"
              >
                <link.icon className="size-4" />
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
const ContactPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  className={isOpen ? "bg-accent text-accent-foreground" : ""}
                  size="icon-sm"
                  variant="ghost"
                />
              }
            />
          }
        >
          <Send className="size-4" />
          <span className="sr-only">Contact</span>
        </TooltipTrigger>
        <TooltipContent>Connect</TooltipContent>
      </Tooltip>

      <PopoverContent
        align="center"
        className="w-auto border-none bg-transparent p-0 shadow-none"
        sideOffset={-4}
      >
        <div className="relative flex items-center justify-center">
          {contactLinks.map((link, index) => {
            // Arrange in a semi-circle arc below the trigger
            const totalItems = contactLinks.length;
            // Degrees of the arc.
            const arcSpread = 120;
            // Center the arc at 90 degrees, pointing down.
            const startAngle = 90 - arcSpread / 2;
            const angleStep = arcSpread / (totalItems - 1);
            const angle = startAngle + index * angleStep;
            const radius = 55;
            // In screen coords: x right is positive, y down is positive
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            return (
              <Tooltip key={link.title}>
                <TooltipTrigger
                  render={
                    <a
                      className={cn(
                        "absolute flex size-9 items-center justify-center rounded-full border bg-background shadow-md transition-all duration-300 ease-out hover:scale-110 hover:bg-accent",
                        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
                      )}
                      href={link.href}
                      rel="noopener noreferrer"
                      style={{
                        transform: isOpen
                          ? `translate(${x}px, ${y}px) scale(1)`
                          : "translate(0, 0) scale(0)",
                        transitionDelay: isOpen
                          ? `${index * 50}ms`
                          : `${(totalItems - index - 1) * 30}ms`,
                      }}
                      target="_blank"
                    >
                      <link.icon className="size-4" />
                      <span className="sr-only">{link.title}</span>
                    </a>
                  }
                />
                <TooltipContent side="bottom">{link.title}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
export const Navbar = () => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isWritingPage =
    currentPath.startsWith("/posts/") && currentPath !== "/posts/";
  const { resolvedTheme, setTheme } = useTheme();
  const readingProgress = useReadingProgress(isWritingPage);
  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };
  return (
    <header className="sticky top-0 z-50 bg-background/82 backdrop-blur-xl supports-backdrop-filter:bg-background/72">
      <div
        className="absolute right-0 bottom-0 left-0 h-px border-border bg-border"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      />
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <MobileNav isActive={isActive} />

          <Link
            className="group flex items-center gap-2.5 font-semibold tracking-tight"
            to="/"
          >
            <span className="flex size-8 items-center justify-center rounded-lg border bg-card shadow-elevation-1 transition-transform group-hover:-translate-y-0.5">
              <img alt="" height="auto" src="/logo.png" width={18} />
            </span>
            <span className="hidden text-sm sm:inline">Gavin Kline</span>
            <span className="sr-only sm:hidden">Gavin Kline</span>
          </Link>

          <DesktopNav isActive={isActive} />
        </div>

        <div className="flex items-center gap-1">
          <LiveStatsNav />

          <Separator className="mx-2 hidden sm:block" orientation="vertical" />

          <ContactPopover />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={() =>
                    setTheme(resolvedTheme === "light" ? "dark" : "light")
                  }
                  size="icon-sm"
                  variant="ghost"
                />
              }
            >
              {resolvedTheme === "light" ? <Moon /> : <Sun />}
              <span className="sr-only">Toggle theme</span>
            </TooltipTrigger>
            <TooltipContent>
              {resolvedTheme === "light" ? "Dark mode" : "Light mode"}
            </TooltipContent>
          </Tooltip>
        </div>
      </nav>
      <div className="relative h-px w-full bg-border">
        {isWritingPage ? (
          <div
            className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_10px_color-mix(in_oklch,var(--primary),transparent_20%)] transition-[width] duration-100 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        ) : null}
      </div>
    </header>
  );
};
