import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Route as RouteIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PlaygroundPage = () => (
  <div className="space-y-12">
    <header className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-4xl tracking-tight md:text-5xl">Playground</h1>
        <Badge variant="outline">Experiments</Badge>
      </div>
      <p className="text-lg text-muted-foreground">
        Interactive experiments, living data, and things that don&apos;t fit
        anywhere else.
      </p>
    </header>

    <Separator />

    <Link
      className="group relative block overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_85%_15%,color-mix(in_oklch,var(--chart-2)_18%,transparent),transparent_35%),var(--card)] p-6 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg sm:p-8"
      to="/75-hard"
    >
      <div className="mb-16 flex items-start justify-between">
        <span className="grid size-11 place-content-center rounded-full border bg-background/70 backdrop-blur">
          <RouteIcon className="size-5 text-chart-2" />
        </span>
        <ArrowUpRight className="size-5 text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
      <p className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.22em]">
        Live · July—September 2026
      </p>
      <h2 className="text-4xl tracking-tight">The Long Game</h2>
      <p className="mt-3 max-w-lg text-muted-foreground text-sm leading-relaxed">
        Seventy-five days of workouts, miles, water, reading, and showing up—on
        the road to a wedding and the New York City Marathon.
      </p>
    </Link>
  </div>
);
export const Route = createFileRoute("/playground")({
  component: PlaygroundPage,
});
