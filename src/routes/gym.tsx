import { createFileRoute } from "@tanstack/react-router";

import { GymPage } from "@/components/gym/gym-page";

export const Route = createFileRoute("/gym")({
  component: GymPage,
  head: () => ({
    meta: [
      { title: "Gym tracker — Gavin Kline" },
      {
        content:
          "Weekly training plan, session logs, goal bars, and an LLM coach that explains every adjustment.",
        name: "description",
      },
      {
        content: "Gym tracker — Gavin Kline",
        property: "og:title",
      },
      {
        content:
          "A run/lift-balance program with a GLM-5.3 coach: today's call, plan drafts with reasons, and charts of the work actually done.",
        property: "og:description",
      },
      { content: "website", property: "og:type" },
      { content: "summary_large_image", name: "twitter:card" },
    ],
  }),
});
