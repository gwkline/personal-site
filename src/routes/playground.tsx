import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Route as RouteIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { cardVariants } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PlaygroundPage = () => (
  <div className="space-y-12 sm:space-y-16">
    <PageHeader
      action={<Badge variant="info">Experiments</Badge>}
      description="Interactive experiments, living data, and things that don’t fit anywhere else."
      eyebrow="Open lab"
      title="Playground"
    />

    <Link
      className={cn(
        cardVariants({ variant: "interactive" }),
        "group relative block overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_85%_15%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_38%),var(--card)] p-6 sm:p-8"
      )}
      to="/75-hard"
    >
      <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
      <div className="mb-14 flex items-start justify-between sm:mb-20">
        <span className="grid size-11 place-content-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 backdrop-blur">
          <RouteIcon className="size-5" />
        </span>
        <ArrowUpRight className="size-5 text-muted-foreground transition-[color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
      </div>
      <p className="mb-2 font-mono text-[0.6875rem] font-medium text-primary uppercase tracking-[0.16em]">
        Live · July—September 2026
      </p>
      <h2 className="font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
        The Long Game
      </h2>
      <p className="mt-3 max-w-xl text-muted-foreground text-sm leading-relaxed sm:text-base">
        Seventy-five days of workouts, miles, water, reading, and showing up—on
        the road to a wedding and the New York City Marathon.
      </p>
    </Link>
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
