import { createFileRoute } from "@tanstack/react-router";

import { LongRunPage } from "@/components/75-hard/long-run-page";

export const Route = createFileRoute("/75-hard")({
  component: LongRunPage,
  head: () => ({
    meta: [
      { title: "75 Hard — Gavin Kline" },
      {
        content:
          "My 75 Hard daily log while training for the NYC Marathon and getting ready for my wedding.",
        name: "description",
      },
      {
        content: "75 Hard — Gavin Kline",
        property: "og:title",
      },
      {
        content:
          "Follow my 75 Hard daily log while I train for the NYC Marathon and get ready for my wedding.",
        property: "og:description",
      },
      { content: "website", property: "og:type" },
      { content: "summary_large_image", name: "twitter:card" },
    ],
  }),
});
