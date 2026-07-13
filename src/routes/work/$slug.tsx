import SiGithub from "@icons-pack/react-simple-icons/icons/SiGithub.mjs";
import {
  createFileRoute,
  getRouteApi,
  Link,
  notFound,
} from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Markdown from "react-markdown";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getProjectBySlug } from "@/lib/projects";

const routeApi = getRouteApi("/work/$slug");
const ProjectDetailPage = () => {
  const { project } = routeApi.useLoaderData();
  return (
    <div className="space-y-8">
      <Button
        nativeButton={false}
        render={<Link to="/work" />}
        size="sm"
        variant="ghost"
      >
        <ArrowLeft className="size-4" />
        Back to work
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
            <Button
              nativeButton={false}
              render={
                <a
                  aria-label="View live project"
                  href={project.links.live}
                  rel="noopener noreferrer"
                  target="_blank"
                />
              }
              size="sm"
              variant="outline"
            >
              <ExternalLink className="size-4" />
              View live
            </Button>
          ) : null}
          {project.links.github ? (
            <Button
              nativeButton={false}
              render={
                <a
                  aria-label="View source on GitHub"
                  href={project.links.github}
                  rel="noopener noreferrer"
                  target="_blank"
                />
              }
              size="sm"
              variant="outline"
            >
              <SiGithub className="size-4" />
              Source
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
            <Markdown>{project.description}</Markdown>
          </>
        ) : null}
      </article>
    </div>
  );
};
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
