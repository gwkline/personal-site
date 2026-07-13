import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import type { AuthClient } from "@convex-dev/better-auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexReactClient } from "convex/react";

import { authClient } from "@/lib/auth-client";

import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const CONVEX_URL =
    (
      import.meta.env as {
        VITE_CONVEX_URL?: string;
      }
    ).VITE_CONVEX_URL ?? "";
  if (!CONVEX_URL) {
    throw new Error("missing VITE_CONVEX_URL envar");
  }
  const convex = new ConvexReactClient(CONVEX_URL, {
    unsavedChangesWarning: false,
  });
  const convexQueryClient = new ConvexQueryClient(convex);
  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 5000,
        queryFn: convexQueryClient.queryFn(),
        queryKeyHashFn: convexQueryClient.hashFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);
  // Better Auth 1.6.23 currently widens the plugin client beyond the integration's public union.
  const convexAuthClient = authClient as unknown as AuthClient;
  const router = routerWithQueryClient(
    createRouter({
      Wrap: ({ children }) => (
        <ConvexBetterAuthProvider
          authClient={convexAuthClient}
          client={convexQueryClient.convexClient}
        >
          {children}
        </ConvexBetterAuthProvider>
      ),
      context: { queryClient },
      defaultErrorComponent: (err) => <p>{err.error.stack}</p>,
      defaultNotFoundComponent: () => <p>not found</p>,
      defaultPreload: "render",
      // Let React Query handle all caching.
      defaultPreloadStaleTime: 0,
      routeTree,
      scrollRestoration: true,
    }),
    queryClient
  );
  return router;
};
