import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cardVariants } from "@/components/ui/card";
import type { Post } from "@/lib/posts";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

export const ProjectCard = ({
  className,
  compact = false,
  project,
}: {
  className?: string;
  compact?: boolean;
  project: Project;
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
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <Badge size="sm" variant="outline">
          {project.type}
        </Badge>
        <h3 className="font-heading text-xl font-semibold tracking-[-0.03em]">
          {project.title}
        </h3>
        <p className="text-muted-foreground text-sm">{project.role}</p>
      </div>
      <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 group-hover/card:text-primary" />
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
        <span className="ml-auto font-mono text-[0.6875rem] text-muted-foreground">
          {project.period}
        </span>
      </div>
    </div>
  </Link>
);

export const PostRow = ({
  className,
  commentCount = 0,
  compact = false,
  post,
}: {
  className?: string;
  commentCount?: number;
  compact?: boolean;
  post: Post;
}) => (
  <Link
    className={cn(
      "group flex flex-col gap-3 rounded-xl border border-transparent px-4 py-4 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-elevation-1 sm:flex-row sm:items-center sm:justify-between",
      className
    )}
    params={{ slug: post.slug }}
    to="/posts/$slug"
  >
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
    <div className="flex shrink-0 items-center gap-3 font-mono text-[0.6875rem] text-muted-foreground uppercase tracking-[0.08em]">
      {commentCount > 0 ? (
        <span className="flex items-center gap-1">
          <MessageCircle className="size-3.5" />
          {commentCount}
        </span>
      ) : null}
      <span>{post.date}</span>
    </div>
  </Link>
);
