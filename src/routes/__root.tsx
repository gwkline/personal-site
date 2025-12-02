import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Navbar } from "@/components/nav";
import { ThemeProvider } from "@/components/theme-provider";
import { getServerTheme } from "@/lib/theme";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Gavin Kline",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Sora:wght@300;400;500;600&display=swap",
			},
		],
	}),
	loader: async () => {
		const serverTheme = await getServerTheme();
		return { serverTheme };
	},
	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	return <Outlet />;
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const { serverTheme } = Route.useLoaderData();

	// Determine the class to apply on the server
	// If no cookie, we default to no class (CSS will use prefers-color-scheme)
	// If cookie is "system", we also use no class
	// If cookie is "dark" or "light", we apply that class
	const themeClass =
		serverTheme && serverTheme !== "system" ? serverTheme : undefined;

	return (
		<html className={themeClass} lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="flex min-h-screen flex-col antialiased">
				<ThemeProvider
					defaultTheme="system"
					serverTheme={serverTheme}
					storageKey="vite-ui-theme"
				>
					<Navbar />
					<main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
						{children}
					</main>
					<footer className="border-t py-8">
						<div className="mx-auto max-w-4xl px-6">
							<p className="text-center text-muted-foreground text-sm">
								Built with care. © 2001–{new Date().getFullYear()} Gavin Kline
							</p>
						</div>
					</footer>
				</ThemeProvider>
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
				<Scripts />
			</body>
		</html>
	);
}
