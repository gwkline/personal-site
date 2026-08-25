import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  getRouteApi,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import {
  CommentSidebarProvider,
  CommentsSidebar,
  useCommentSidebar,
} from "@/components/comments-sidebar";
import { Navbar } from "@/components/nav";
import { ThemeProvider } from "@/components/theme-provider";
import { Container, containerVariants } from "@/components/ui/container";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVisualViewport } from "@/hooks/use-visual-viewport";
import { getServerTheme } from "@/lib/theme";
import type { Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

import appCss from "../styles.css?url";

const routeApi = getRouteApi("__root__");
const getThemeClass = (serverTheme?: Theme) => {
  if (serverTheme === undefined) {
    return "dark";
  }
  if (serverTheme === "system") {
    return;
  }
  return serverTheme;
};
const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, width } = useCommentSidebar();
  const isMobile = useIsMobile();
  return (
    <div
      className="flex flex-1 flex-col transition-[margin] duration-300 ease-in-out"
      style={{ marginRight: isOpen && !isMobile ? width : 0 }}
    >
      {children}
    </div>
  );
};
const SiteContent = ({ children }: { children: React.ReactNode }) => {
  const routerState = useRouterState();
  const isImmersiveRoute =
    routerState.location.pathname === "/wallpaper-lab" ||
    routerState.location.pathname === "/depths";
  return (
    <>
      <main
        className={cn(
          isImmersiveRoute
            ? "h-[calc(var(--app-height,100dvh)-4rem-1px)] w-full flex-none overflow-hidden"
            : cn(containerVariants({}), "flex-1")
        )}
      >
        {children}
      </main>
      {isImmersiveRoute ? null : (
        <footer className="mt-8 border-t bg-card/35 py-8">
          <Container
            className="flex flex-col gap-2 text-muted-foreground text-xs sm:flex-row sm:items-center sm:justify-between"
            padding="gutter"
          >
            <p className="font-mono uppercase tracking-tag">Built with care</p>
            <p>© 2001–{new Date().getFullYear()} Gavin Kline</p>
          </Container>
        </footer>
      )}
    </>
  );
};
const RootDocument = ({ children }: { children: React.ReactNode }) => {
  const { serverTheme } = routeApi.useLoaderData();
  // Default new visitors to dark while preserving an explicit theme choice.
  const themeClass = getThemeClass(serverTheme);
  useVisualViewport();
  return (
    <html className={themeClass} lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script src="/theme-init.js" />
      </head>
      <body className="h-(--app-height,100dvh) overflow-hidden bg-background antialiased">
        <ThemeProvider
          defaultTheme="dark"
          serverTheme={serverTheme}
          storageKey="vite-ui-theme"
        >
          <TooltipProvider>
            <CommentSidebarProvider>
              <div className="flex h-(--app-height,100dvh) bg-background">
                <div
                  className="flex flex-1 flex-col overflow-y-auto overscroll-y-contain"
                  id="app-scroll-container"
                >
                  <Navbar />
                  <ContentWrapper>
                    <SiteContent>{children}</SiteContent>
                  </ContentWrapper>
                </div>
                <CommentsSidebar />
              </div>
            </CommentSidebarProvider>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
        {import.meta.env.DEV ? (
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        ) : null}
        <Scripts />
      </body>
    </html>
  );
};
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: Outlet,
  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
      },
      {
        href: "/manifest.json",
        rel: "manifest",
      },
      {
        href: "/rss.xml",
        rel: "alternate",
        title: "Gavin Kline — Writing",
        type: "application/rss+xml",
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
        name: "viewport",
      },
      {
        title: "Gavin Kline",
      },
      {
        content:
          "Engineering leader and hands-on software builder working across AI, backend systems, and product architecture.",
        name: "description",
      },
      {
        content: "#f26a1b",
        name: "theme-color",
      },
    ],
  }),
  loader: async () => {
    const serverTheme = await getServerTheme();
    return { serverTheme };
  },
  shellComponent: RootDocument,
});
