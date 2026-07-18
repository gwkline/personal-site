import { createFileRoute } from "@tanstack/react-router";
import { createStandardSchemaV1 } from "nuqs";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

import { wallpaperSearchParams } from "@/components/wallpaper/wallpaper-query";
import { WallpaperStudio } from "@/components/wallpaper/wallpaper-studio";

const WallpaperLabPage = () => (
  <NuqsAdapter>
    <WallpaperStudio />
  </NuqsAdapter>
);

export const Route = createFileRoute("/wallpaper-lab")({
  component: WallpaperLabPage,
  head: () => ({
    meta: [
      { title: "Wallpaper Lab — Gavin Kline" },
      {
        content:
          "Create responsive animated wallpapers from flowing light, ASCII waves, virtual glass, contours, and interference.",
        name: "description",
      },
      { content: "Wallpaper Lab — Gavin Kline", property: "og:title" },
      {
        content:
          "A fast, immersive generator for moving wallpapers and ambient backgrounds.",
        property: "og:description",
      },
      { content: "website", property: "og:type" },
    ],
  }),
  validateSearch: createStandardSchemaV1(wallpaperSearchParams, {
    partialOutput: true,
  }),
});
