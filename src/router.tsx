import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import type { AuthClient } from "@convex-dev/better-auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter, Link } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexReactClient } from "convex/react";
import { Home, RefreshCw, SearchX, TriangleAlert } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { routeTree } from "./routeTree.gen";

const FallbackLayout = ({ children }: { children: React.ReactNode }) => (
  <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-16 sm:px-6">
    {children}
  </main>
);

const NotFoundFallback = () => (
  <FallbackLayout>
    <Card className="w-full" variant="feature">
      <CardHeader>
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-info/12 text-info ring-1 ring-info/18">
          <SearchX aria-hidden="true" className="size-5" />
        </div>
        <CardTitle variant="section">This page is out of signal</CardTitle>
        <CardDescription size="lg">
          The address may have changed, or the page may no longer be available.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Check the URL, or head home to find your way back.
        </p>
      </CardContent>
      <CardFooter>
        <Link className={cn(buttonVariants())} to="/">
          <Home aria-hidden="true" className="size-4" />
          Go home
        </Link>
      </CardFooter>
    </Card>
  </FallbackLayout>
);

const ErrorFallback = ({ error, reset }: ErrorComponentProps) => (
  <FallbackLayout>
    <Card className="w-full" variant="feature">
      <CardHeader>
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-destructive/15">
          <TriangleAlert aria-hidden="true" className="size-5" />
        </div>
        <CardTitle variant="section">
          Something interrupted the signal
        </CardTitle>
        <CardDescription size="lg">
          This page could not be loaded. You can try again or return home.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p
          aria-live="assertive"
          className="rounded-lg bg-surface-sunken px-3 py-2 text-muted-foreground text-sm"
          role="alert"
        >
          {error.message || "An unexpected error occurred."}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button onClick={reset}>
          <RefreshCw aria-hidden="true" className="size-4" />
          Try again
        </Button>
        <Link className={cn(buttonVariants({ variant: "outline" }))} to="/">
          <Home aria-hidden="true" className="size-4" />
          Go home
        </Link>
      </CardFooter>
    </Card>
  </FallbackLayout>
);

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
      defaultErrorComponent: ErrorFallback,
      defaultNotFoundComponent: NotFoundFallback,
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
