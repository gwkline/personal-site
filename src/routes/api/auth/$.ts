import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";
import { createFileRoute } from "@tanstack/react-router";

const { handler } = convexBetterAuthReactStart({
  convexSiteUrl: process.env.CONVEX_SITE_URL ?? "",
  convexUrl: process.env.VITE_CONVEX_URL ?? "",
});
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request),
    },
  },
});
