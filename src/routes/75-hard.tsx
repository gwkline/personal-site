import { createFileRoute } from "@tanstack/react-router";

import { LongRunPage } from "@/components/75-hard/long-run-page";

export const Route = createFileRoute("/75-hard")({
  component: LongRunPage,
  head: () => ({
    meta: [
      { title: "The Long Game — Gavin Kline" },
      {
        content:
          "75 days of showing up on the road to an October wedding and the New York City Marathon.",
        name: "description",
      },
      {
        content: "The Long Game — 75 days of showing up",
        property: "og:title",
      },
      {
        content:
          "Follow Gavin's live 75-day challenge on the road to his wedding and the New York City Marathon.",
        property: "og:description",
      },
      { content: "website", property: "og:type" },
      { content: "summary_large_image", name: "twitter:card" },
    ],
  }),
});
