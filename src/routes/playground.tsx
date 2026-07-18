import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Route as RouteIcon, Waves } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { cardVariants } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PlaygroundPage = () => (
  <div className="space-y-12 sm:space-y-16">
    <PageHeader
      action={<Badge variant="info">Experiments</Badge>}
      description="Things I’m building that don’t fit anywhere else."
      eyebrow="Open lab"
      title="Playground"
    />

    <div className="grid gap-4 md:grid-cols-2">
      <Link
        className={cn(
          cardVariants({ variant: "interactive" }),
          "group relative block overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_82%_12%,color-mix(in_oklch,var(--info)_15%,transparent),transparent_38%),radial-gradient(circle_at_12%_92%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_42%),var(--card)] p-6 sm:p-8"
        )}
        to="/wallpaper-lab"
      >
        <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-info/70 to-transparent" />
        <div className="mb-20 flex items-start justify-between">
          <span className="grid size-11 place-content-center rounded-xl bg-info/12 text-info ring-1 ring-info/20">
            <Waves className="size-5" />
          </span>
          <ArrowUpRight className="size-5 text-muted-foreground transition-[color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-info" />
        </div>
        <p className="mb-2 font-mono text-[0.6875rem] font-medium text-info uppercase tracking-[0.16em]">
          Interactive · WebGL
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-[-0.04em]">
          Wallpaper lab
        </h2>
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          Compose living backdrops from flow, type, glass, contours, and
          interference.
        </p>
      </Link>

      <Link
        className={cn(
          cardVariants({ variant: "interactive" }),
          "group relative block overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_85%_15%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_38%),var(--card)] p-6 sm:p-8"
        )}
        to="/75-hard"
      >
        <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
        <div className="mb-20 flex items-start justify-between">
          <span className="grid size-11 place-content-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 backdrop-blur">
            <RouteIcon className="size-5" />
          </span>
          <ArrowUpRight className="size-5 text-muted-foreground transition-[color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </div>
        <p className="mb-2 font-mono text-[0.6875rem] font-medium text-primary uppercase tracking-[0.16em]">
          Live · July—September 2026
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-[-0.04em]">
          75 Hard
        </h2>
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          Training for the NYC Marathon, getting wedding-ready, and logging all
          75 days.
        </p>
      </Link>
    </div>
  </div>
);
export const Route = createFileRoute("/playground")({
  component: PlaygroundPage,
  head: () => ({
    meta: [
      { title: "Playground — Gavin Kline" },
      {
        content:
          "Interactive experiments, living data, and ongoing builds by Gavin Kline.",
        name: "description",
      },
      { content: "Playground — Gavin Kline", property: "og:title" },
      {
        content:
          "Interactive experiments, living data, and ongoing builds by Gavin Kline.",
        property: "og:description",
      },
      { content: "website", property: "og:type" },
    ],
  }),
});
