import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/playground")({
	component: PlaygroundPage,
});

function PlaygroundPage() {
	return (
		<div className="space-y-12">
			<header className="space-y-4">
				<div className="flex items-center gap-3">
					<h1 className="text-4xl tracking-tight md:text-5xl">Playground</h1>
					<Badge variant="outline">Coming soon</Badge>
				</div>
				<p className="text-lg text-muted-foreground">
					A space for experiments, interactive demos, and things that don't fit
					anywhere else.
				</p>
			</header>

			<Separator />

			<div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
				<div className="rounded-full bg-muted p-4">
					<Sparkles className="size-8 text-muted-foreground" />
				</div>
				<div className="space-y-2">
					<h2 className="font-medium font-sans text-xl">
						Something interesting is brewing
					</h2>
					<p className="max-w-md text-muted-foreground">
						I'm working on some interactive experiments to share here. Check
						back soon for live demos, multiplayer experiences, and creative
						coding projects.
					</p>
				</div>
			</div>
		</div>
	);
}
