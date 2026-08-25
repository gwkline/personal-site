import SiGithub from "@icons-pack/react-simple-icons/icons/SiGithub.mjs";
import {
  createFileRoute,
  getRouteApi,
  Link,
  notFound,
} from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Markdown from "react-markdown";

import { Eyebrow } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { gridVariants } from "@/components/ui/grid";
import { SectionHeader } from "@/components/ui/section-header";
import { ProjectGraphic } from "@/components/work/project-graphics";
import { getProjectBySlug } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

const routeApi = getRouteApi("/work/$slug");
const getProjectTypeLabel = (type: Project["type"]): string => {
  switch (type) {
    case "work": {
      return "Professional";
    }
    case "personal": {
      return "Personal";
    }
    case "oss": {
      return "Open source";
    }
    default: {
      const exhaustiveType: never = type;
      return exhaustiveType;
    }
  }
};

const ProjectDetailPage = () => {
  const { slug } = routeApi.useParams();
  const project = getProjectBySlug(slug);
  if (!project) {
    return null;
  }

  return (
    <div className="space-y-8 pb-8 sm:space-y-10">
      <Button
        nativeButton={false}
        render={<Link to="/work" />}
        size="sm"
        variant="ghost"
      >
        <ArrowLeft className="size-4" />
        Back to work
      </Button>

      <section
        className={cn(
          "border-b pb-8",
          gridVariants({ gap: "loose", split: "hero" })
        )}
      >
        <div className="space-y-4">
          <Eyebrow>{`${getProjectTypeLabel(project.type)} · ${project.period}`}</Eyebrow>
          <div className="space-y-3">
            <h1 className="font-heading text-4xl font-semibold tracking-[-0.055em] text-balance sm:text-5xl">
              {project.title}
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
              {project.summary}
            </p>
          </div>

          <p className="font-heading text-base font-medium tracking-[-0.02em] text-foreground">
            {project.role}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.tech.map((technology) => (
              <Badge key={technology} size="sm" variant="secondary">
                {technology}
              </Badge>
            ))}
          </div>
          {project.links ? (
            <div className="flex flex-wrap gap-3">
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
        </div>

        <div className="[&>[aria-hidden=true]]:h-36 sm:[&>[aria-hidden=true]]:h-44 lg:[&>[aria-hidden=true]]:h-48">
          <ProjectGraphic project={project} />
        </div>
      </section>

      {project.description ? (
        <section className={gridVariants({ gap: "loose", split: "rail" })}>
          <SectionHeader
            eyebrow="Case study"
            size="compact"
            title="Inside the work"
          />
          <article className="prose max-w-none">
            <Markdown>{project.description}</Markdown>
          </article>
        </section>
      ) : null}
    </div>
  );
};
export const Route = createFileRoute("/work/$slug")({
  component: ProjectDetailPage,
  head: ({ params }) => {
    const project = getProjectBySlug(params.slug);
    return {
      meta: project
        ? [
            { title: `${project.title} — Gavin Kline` },
            {
              content: project.summary,
              name: "description",
            },
          ]
        : [{ title: "Work — Gavin Kline" }],
    };
  },
  loader: ({ params }) => {
    const project = getProjectBySlug(params.slug);
    if (!project) {
      throw notFound();
    }
    return { project };
  },
});
