import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/projects";
import { getProjects } from "@/lib/projects";

export const Route = createFileRoute("/work/")({
	component: WorkPage,
	loader: () => ({ projects: getProjects() }),
});

function WorkPage() {
	const { projects } = Route.useLoaderData();
	const workProjects = projects.filter((p) => p.type === "work");
	const personalProjects = projects.filter((p) => p.type === "personal");
	const ossProjects = projects.filter((p) => p.type === "oss");

	return (
		<div className="space-y-12">
			<PageHeader
				description="A collection of projects I've built, contributed to, and shipped over the years."
				title="Work"
			/>

			{workProjects.length > 0 && (
				<section className="space-y-6">
					<h2 className="text-muted-foreground text-xl">Professional</h2>
					<div className="grid gap-4 md:grid-cols-2">
						{workProjects.map((project) => (
							<ProjectCard key={project.slug} project={project} />
						))}
					</div>
				</section>
			)}

			{personalProjects.length > 0 && (
				<section className="space-y-6">
					<h2 className="text-muted-foreground text-xl">Personal</h2>
					<div className="grid gap-4 md:grid-cols-2">
						{personalProjects.map((project) => (
							<ProjectCard key={project.slug} project={project} />
						))}
					</div>
				</section>
			)}

			{ossProjects.length > 0 && (
				<section className="space-y-6">
					<h2 className="text-muted-foreground text-xl">Open Source</h2>
					<div className="grid gap-4 md:grid-cols-2">
						{ossProjects.map((project) => (
							<ProjectCard key={project.slug} project={project} />
						))}
					</div>
				</section>
			)}
		</div>
	);
}

function ProjectCard({ project }: { project: Project }) {
	return (
		<Link
			className="group flex flex-col gap-4 rounded-lg border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
			params={{ slug: project.slug }}
			to="/work/$slug"
		>
			<div className="flex items-start justify-between gap-3">
				<div className="space-y-1">
					<h3 className="font-medium font-sans">{project.title}</h3>
					<p className="text-muted-foreground text-sm">{project.role}</p>
				</div>
				<span className="shrink-0 text-muted-foreground text-xs">
					{project.period}
				</span>
			</div>
			<p className="line-clamp-2 text-muted-foreground text-sm">
				{project.summary}
			</p>
			<div className="flex flex-wrap gap-1.5">
				{project.tech.slice(0, 4).map((t) => (
					<Badge className="text-xs" key={t} variant="secondary">
						{t}
					</Badge>
				))}
				{project.tech.length > 4 && (
					<Badge className="text-xs" variant="outline">
						+{project.tech.length - 4}
					</Badge>
				)}
			</div>
		</Link>
	);
}
