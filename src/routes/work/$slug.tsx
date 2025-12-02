import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getProjectBySlug } from "@/lib/projects";

export const Route = createFileRoute("/work/$slug")({
	component: ProjectDetailPage,
	loader: ({ params }) => {
		const project = getProjectBySlug(params.slug);
		if (!project) {
			throw notFound();
		}
		return { project };
	},
});

function ProjectDetailPage() {
	const { project } = Route.useLoaderData();

	return (
		<div className="space-y-8">
			<Button asChild size="sm" variant="ghost">
				<Link to="/work">
					<ArrowLeft className="size-4" />
					Back to work
				</Link>
			</Button>

			<header className="space-y-4">
				<div className="flex flex-wrap items-center gap-3">
					<Badge variant="outline">{project.type}</Badge>
					<span className="text-muted-foreground text-sm">
						{project.period}
					</span>
				</div>
				<h1 className="text-4xl tracking-tight md:text-5xl">{project.title}</h1>
				<p className="text-lg text-muted-foreground">{project.role}</p>
			</header>

			<div className="flex flex-wrap gap-2">
				{project.tech.map((t) => (
					<Badge key={t} variant="secondary">
						{t}
					</Badge>
				))}
			</div>

			{project.links ? (
				<div className="flex gap-3">
					{project.links.live ? (
						<Button asChild size="sm" variant="outline">
							<a
								href={project.links.live}
								rel="noopener noreferrer"
								target="_blank"
							>
								<ExternalLink className="size-4" />
								View live
							</a>
						</Button>
					) : null}
					{project.links.github ? (
						<Button asChild size="sm" variant="outline">
							<a
								href={project.links.github}
								rel="noopener noreferrer"
								target="_blank"
							>
								<Github className="size-4" />
								Source
							</a>
						</Button>
					) : null}
				</div>
			) : null}

			<Separator />

			<article className="prose">
				<h2>Overview</h2>
				<p>{project.summary}</p>

				{project.description ? (
					<>
						<h2>Details</h2>
						<div
							// biome-ignore lint/security/noDangerouslySetInnerHtml: this is my own markdown
							dangerouslySetInnerHTML={{ __html: project.description }}
						/>
					</>
				) : null}
			</article>
		</div>
	);
}
