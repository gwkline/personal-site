import { RegistryProvider } from "@effect/atom-react";
import { createFileRoute } from "@tanstack/react-router";

import { DepthsGame } from "@/components/depths/depths-game";

const DepthsPage = () => (
  <RegistryProvider>
    <DepthsGame />
  </RegistryProvider>
);

export const Route = createFileRoute("/depths")({
  component: DepthsPage,
  head: () => ({
    meta: [
      { title: "Depths — Gavin Kline" },
      {
        content:
          "An original endless pixel-art dungeon crawler with procedural floors and an arcade leaderboard.",
        name: "description",
      },
      { content: "Depths — Gavin Kline", property: "og:title" },
      {
        content:
          "Descend through an endless procedurally generated dungeon and chase the public high score.",
        property: "og:description",
      },
      { content: "website", property: "og:type" },
    ],
  }),
});
