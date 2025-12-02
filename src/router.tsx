import { createRouter, Link } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: NotFound,
	});

	return router;
};

function NotFound() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
			<h1 className="font-bold text-6xl text-muted-foreground">404</h1>
			<p className="text-lg text-muted-foreground">Page not found</p>
			<Link
				className="text-primary underline underline-offset-4 hover:text-primary/80"
				to="/"
			>
				Go home
			</Link>
		</div>
	);
}
