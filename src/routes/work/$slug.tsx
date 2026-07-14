import SiGithub from "@icons-pack/react-simple-icons/icons/SiGithub.mjs";
import {
  createFileRoute,
  getRouteApi,
  Link,
  notFound,
} from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Markdown from "react-markdown";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { getProjectBySlug } from "@/lib/projects";
import type { Project } from "@/lib/projects";

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
    <div className="space-y-14 pb-8 sm:space-y-18">
      <Button
        nativeButton={false}
        render={<Link to="/work" />}
        size="sm"
        variant="ghost"
      >
        <ArrowLeft className="size-4" />
        Back to work
      </Button>

      <PageHeader
        description={project.summary}
        eyebrow={`${getProjectTypeLabel(project.type)} · ${project.period}`}
        size="detail"
        title={project.title}
      >
        <div className="space-y-5">
          <p className="font-heading text-lg font-medium tracking-[-0.02em] text-foreground">
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
      </PageHeader>

      {project.description ? (
        <section className="grid gap-8 lg:grid-cols-[0.38fr_1fr] lg:gap-14">
          <SectionHeader
            description="The decisions, constraints, and implementation behind the project."
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
