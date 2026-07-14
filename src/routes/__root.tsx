import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  getRouteApi,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import {
  CommentSidebarProvider,
  CommentsSidebar,
  useCommentSidebar,
} from "@/components/live-stats";
import { Navbar } from "@/components/nav";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { getServerTheme } from "@/lib/theme";

import appCss from "../styles.css?url";

const routeApi = getRouteApi("__root__");
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
const RootDocument = ({ children }: { children: React.ReactNode }) => {
  const { serverTheme } = routeApi.useLoaderData();
  // Determine the class to apply on the server
  // If no cookie, we default to no class (CSS will use prefers-color-scheme)
  // If cookie is "system", we also use no class
  // If cookie is "dark" or "light", we apply that class
  const themeClass =
    serverTheme && serverTheme !== "system" ? serverTheme : undefined;
  return (
    <html className={themeClass} lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script src="/theme-init.js" />
      </head>
      <body className="h-screen overflow-hidden antialiased">
        <ThemeProvider
          defaultTheme="system"
          serverTheme={serverTheme}
          storageKey="vite-ui-theme"
        >
          <TooltipProvider>
            <CommentSidebarProvider>
              <div className="flex h-screen">
                <div
                  className="flex flex-1 flex-col overflow-y-auto"
                  id="app-scroll-container"
                >
                  <Navbar />
                  <ContentWrapper>
                    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
                      {children}
                    </main>
                    <footer className="mt-8 border-t bg-card/35 py-8">
                      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 text-muted-foreground text-xs sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-mono uppercase tracking-[0.14em]">
                          Built with care
                        </p>
                        <p>© 2001–{new Date().getFullYear()} Gavin Kline</p>
                      </div>
                    </footer>
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
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        content: "width=device-width, initial-scale=1",
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
