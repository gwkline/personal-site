import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { PlaygroundCard } from "@/components/playground-card";
import { Badge } from "@/components/ui/badge";
import { playgroundItems } from "@/lib/playground";

const PlaygroundPage = () => (
  <div className="space-y-12 sm:space-y-16">
    <PageHeader
      action={<Badge variant="info">Experiments</Badge>}
      description="Things I’m building that don’t fit anywhere else."
      eyebrow="Open lab"
      title="Playground"
    />

    <div className="grid gap-4 md:grid-cols-2">
      {playgroundItems.map((item, index) => (
        <PlaygroundCard
          className={
            index === playgroundItems.length - 1 ? "md:col-span-2" : ""
          }
          item={item}
          key={item.to}
        />
      ))}
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
