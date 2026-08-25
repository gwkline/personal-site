import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, cardVariants } from "@/components/ui/card";
import { MonoLabel } from "@/components/ui/mono-label";
import {
  projectTypeLabels,
  ProjectGraphic,
} from "@/components/work/project-graphics";
import type { Post } from "@/lib/posts";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

const PostGraphic = () => (
  <span
    aria-hidden="true"
    className="size-12 shrink-0 overflow-hidden rounded-lg border bg-surface-sunken"
  >
    <svg className="size-full" viewBox="0 0 48 48">
      <path
        d="M13 7.5H28L36 15.5V40.5H13V7.5Z"
        fill="var(--card)"
        stroke="var(--border)"
      />
      <path
        d="M28 7.5V15.5H36"
        fill="none"
        stroke="var(--border)"
        strokeLinejoin="round"
      />
      <path
        d="M18 21H31M18 26H31M18 31H27"
        stroke="var(--muted-foreground)"
        strokeLinecap="round"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      <rect
        fill="var(--info)"
        fillOpacity="0.7"
        height="2"
        rx="1"
        width="8"
        x="18"
        y="16"
      />
    </svg>
  </span>
);
export const ProjectCard = ({
  className,
  compact = false,
  project,
  showGraphic = false,
}: {
  className?: string;
  compact?: boolean;
  project: Project;
  showGraphic?: boolean;
}) => (
  <Link
    className={cn(
      cardVariants({ variant: "interactive" }),
      "relative min-h-56 justify-between p-5 sm:p-6",
      compact && "min-h-48",
      className
    )}
    params={{ slug: project.slug }}
    to="/work/$slug"
  >
    {showGraphic ? <ProjectGraphic project={project} /> : null}
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 pr-8">
        <Badge size="sm" variant="outline">
          {projectTypeLabels[project.type]}
        </Badge>
        <MonoLabel render={<span />} tracking="label">
          {project.period}
        </MonoLabel>
      </div>
      <div className="space-y-1.5 pr-8">
        <h3 className="font-heading text-xl font-semibold tracking-[-0.03em] text-balance">
          {project.title}
        </h3>
        <p className="text-muted-foreground text-sm">{project.role}</p>
      </div>
    </div>
    <div className="space-y-4">
      <p
        className={cn(
          "text-muted-foreground text-sm leading-relaxed",
          compact ? "line-clamp-2" : "line-clamp-3"
        )}
      >
        {project.summary}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {project.tech.slice(0, compact ? 3 : 4).map((technology) => (
          <Badge key={technology} size="sm" variant="secondary">
            {technology}
          </Badge>
        ))}
      </div>
    </div>
    <ArrowUpRight className="absolute top-5 right-5 size-4 text-muted-foreground transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 group-hover/card:text-primary sm:top-6 sm:right-6" />
  </Link>
);

export const PostRow = ({
  className,
  commentCount = 0,
  compact = false,
  post,
  showGraphic = false,
}: {
  className?: string;
  commentCount?: number;
  compact?: boolean;
  post: Post;
  showGraphic?: boolean;
}) => (
  <Card
    className={cn("px-4 py-4 hover:-translate-y-0.5", className)}
    variant="interactive"
  >
    <Link
      className="group flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      params={{ slug: post.slug }}
      to="/posts/$slug"
    >
      <div className="flex min-w-0 items-center gap-3">
        {showGraphic ? <PostGraphic /> : null}
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading font-semibold tracking-[-0.02em] transition-colors group-hover:text-info">
              {post.title}
            </h3>
            {compact
              ? null
              : post.tags?.map((tag) => (
                  <Badge key={tag} size="sm" variant="outline">
                    {tag}
                  </Badge>
                ))}
          </div>
          {post.description ? (
            <p className="line-clamp-1 text-muted-foreground text-sm">
              {post.description}
            </p>
          ) : null}
        </div>
      </div>
      <MonoLabel
        className="flex shrink-0 items-center gap-3"
        render={<div />}
        tracking="label"
      >
        {commentCount > 0 ? (
          <span
            className="flex items-center gap-1"
            data-testid="post-comment-count"
          >
            <MessageCircle className="size-3.5" />
            {commentCount}
          </span>
        ) : null}
        <span>{post.date}</span>
      </MonoLabel>
    </Link>
  </Card>
);
