import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cardVariants } from "@/components/ui/card";
import type { Post } from "@/lib/posts";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

const ProjectGraphic = ({ project }: { project: Project }) => {
  if (project.slug === "govdash-capture-cloud") {
    return (
      <div
        aria-hidden="true"
        className="h-24 overflow-hidden rounded-xl border bg-surface-sunken"
      >
        <svg className="size-full" viewBox="0 0 320 96">
          <defs>
            <pattern
              height="12"
              id="govdash-grid"
              patternUnits="userSpaceOnUse"
              width="12"
            >
              <path
                d="M12 0H0V12"
                fill="none"
                stroke="var(--border)"
                strokeOpacity="0.3"
                strokeWidth="0.75"
              />
            </pattern>
          </defs>
          <rect fill="url(#govdash-grid)" height="96" width="320" />
          <path
            d="M88 48H128M192 48H232"
            fill="none"
            stroke="var(--primary)"
            strokeDasharray="3 4"
            strokeLinecap="round"
            strokeOpacity="0.55"
            strokeWidth="1.5"
          />
          <rect
            fill="var(--card)"
            height="42"
            rx="8"
            stroke="var(--border)"
            width="66"
            x="22"
            y="27"
          />
          <rect fill="var(--muted)" height="7" rx="2" width="7" x="33" y="38" />
          <path
            d="M46 39.5H72M46 44H64M33 54H72M33 58.5H59"
            stroke="var(--muted-foreground)"
            strokeLinecap="round"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
          <rect
            fill="var(--card)"
            height="58"
            rx="11"
            stroke="var(--primary)"
            strokeOpacity="0.55"
            width="64"
            x="128"
            y="19"
          />
          <path
            d="M17.166 12C17.166 8.902 19.272 6.186 22.313 5.365C20.13 2.131 16.404 0 12.171 0C5.452 0 0 5.374 0 12C0 18.625 5.452 24 12.171 24C16.404 24 20.13 21.869 22.313 18.635C19.27 17.815 17.163 15.098 17.166 12Z"
            fill="var(--primary)"
            transform="translate(149.4 30.6) scale(0.95)"
          />
          <rect
            fill="var(--primary)"
            fillOpacity="0.55"
            height="3"
            rx="1.5"
            width="24"
            x="148"
            y="61"
          />
          <rect
            fill="var(--card)"
            height="42"
            rx="8"
            stroke="var(--border)"
            width="66"
            x="232"
            y="27"
          />
          <circle
            cx="247"
            cy="42"
            fill="var(--success)"
            fillOpacity="0.14"
            r="7"
          />
          <path
            d="M244 42L246.2 44.2L250.3 39.8"
            fill="none"
            stroke="var(--success)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
          <path
            d="M259 39.5H286M259 44H278M243 55H286M243 59.5H272"
            stroke="var(--muted-foreground)"
            strokeLinecap="round"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
        </svg>
      </div>
    );
  }
  if (project.slug === "gorjian-platform") {
    return (
      <div
        aria-hidden="true"
        className="h-24 overflow-hidden rounded-xl border bg-surface-sunken"
      >
        <svg className="size-full" viewBox="0 0 320 96">
          <rect
            fill="var(--card)"
            height="72"
            rx="9"
            stroke="var(--border)"
            width="276"
            x="22"
            y="12"
          />
          <path d="M22 29H298" stroke="var(--border)" />
          <circle cx="34" cy="20.5" fill="var(--primary)" r="2.3" />
          <circle
            cx="42"
            cy="20.5"
            fill="var(--muted-foreground)"
            fillOpacity="0.25"
            r="2.3"
          />
          <circle
            cx="50"
            cy="20.5"
            fill="var(--muted-foreground)"
            fillOpacity="0.25"
            r="2.3"
          />
          <path d="M62 29V84" stroke="var(--border)" />
          <rect
            fill="var(--primary)"
            fillOpacity="0.15"
            height="6"
            rx="2"
            width="24"
            x="31"
            y="37"
          />
          <rect
            fill="var(--muted)"
            height="4"
            rx="2"
            width="18"
            x="31"
            y="49"
          />
          <rect
            fill="var(--muted)"
            height="4"
            rx="2"
            width="21"
            x="31"
            y="58"
          />
          <rect
            fill="var(--muted)"
            height="4"
            rx="2"
            width="15"
            x="31"
            y="67"
          />
          <rect
            fill="var(--surface-sunken)"
            height="37"
            rx="6"
            stroke="var(--border)"
            width="130"
            x="74"
            y="37"
          />
          <path
            d="M84 64C96 61 103 65 115 56C126 48 134 57 146 47C157 38 167 52 194 42"
            fill="none"
            stroke="var(--primary)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path d="M84 66H194" stroke="var(--border)" strokeDasharray="2 3" />
          <circle cx="146" cy="47" fill="var(--primary)" r="2.5" />
          <rect
            fill="var(--info)"
            fillOpacity="0.1"
            height="16"
            rx="5"
            stroke="var(--info)"
            strokeOpacity="0.25"
            width="72"
            x="216"
            y="37"
          />
          <rect
            fill="var(--primary)"
            fillOpacity="0.1"
            height="16"
            rx="5"
            stroke="var(--primary)"
            strokeOpacity="0.25"
            width="72"
            x="216"
            y="58"
          />
          <circle cx="226" cy="45" fill="var(--info)" r="2.5" />
          <path
            d="M234 43H274M234 47H260"
            stroke="var(--info)"
            strokeLinecap="round"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
          <circle cx="226" cy="66" fill="var(--primary)" r="2.5" />
          <path
            d="M234 64H274M234 68H264"
            stroke="var(--primary)"
            strokeLinecap="round"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    );
  }
  if (project.slug === "whop-backend") {
    return (
      <div
        aria-hidden="true"
        className="h-24 overflow-hidden rounded-xl border bg-surface-sunken"
      >
        <svg className="size-full" viewBox="0 0 320 96">
          <rect
            fill="var(--card)"
            height="66"
            rx="8"
            stroke="var(--border)"
            width="52"
            x="30"
            y="17"
          />
          <rect
            fill="var(--muted)"
            height="28"
            rx="5"
            width="38"
            x="37"
            y="24"
          />
          <circle
            cx="56"
            cy="38"
            fill="var(--muted-foreground)"
            fillOpacity="0.25"
            r="7"
          />
          <path
            d="M40 61H69M40 67H61"
            stroke="var(--muted-foreground)"
            strokeLinecap="round"
            strokeOpacity="0.4"
            strokeWidth="2"
          />
          <rect
            fill="var(--card)"
            height="74"
            rx="9"
            stroke="var(--primary)"
            strokeOpacity="0.55"
            width="60"
            x="91"
            y="11"
          />
          <rect
            fill="var(--primary)"
            fillOpacity="0.08"
            height="34"
            rx="6"
            width="44"
            x="99"
            y="19"
          />
          <g fill="var(--primary)" transform="translate(103 27) scale(0.036)">
            <path d="M158.881 0C93.201 0 47.925 28.993 13.662 61.778C13.662 61.778-0.173 74.969 0.002 75.371L143.897 220.133L287.766 75.371C260.521 37.635 209.152 0 158.881 0Z" />
            <path d="M514.191 0C448.513 0 403.236 28.993 368.971 61.779C368.971 61.779 356.336 74.617 355.763 75.371L177.903 254.326L321.574 398.861L643.077 75.371C615.831 37.635 564.488 0 514.191 0Z" />
            <path d="M870.479 0C804.798 0 759.524 28.993 725.259 61.779C725.259 61.779 712.098 74.717 711.6 75.371L355.806 433.355L393.466 471.241C451.73 529.856 547.101 529.856 605.365 471.241L998.914 75.371H999.365C972.119 37.635 920.773 0 870.479 0Z" />
          </g>
          <path
            d="M102 63H140M102 69H132"
            stroke="var(--muted-foreground)"
            strokeLinecap="round"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
          <rect
            fill="var(--card)"
            height="66"
            rx="8"
            stroke="var(--border)"
            width="52"
            x="160"
            y="17"
          />
          <rect
            fill="var(--info)"
            fillOpacity="0.12"
            height="28"
            rx="5"
            width="38"
            x="167"
            y="24"
          />
          <path
            d="M172 61H200M172 67H193"
            stroke="var(--muted-foreground)"
            strokeLinecap="round"
            strokeOpacity="0.4"
            strokeWidth="2"
          />
          <rect
            fill="var(--card)"
            height="52"
            rx="8"
            stroke="var(--border)"
            width="72"
            x="224"
            y="22"
          />
          <path
            d="M235 60V49M246 60V42M257 60V46M268 60V35M279 60V39"
            stroke="var(--primary)"
            strokeLinecap="round"
            strokeOpacity="0.7"
            strokeWidth="4"
          />
          <path d="M234 64H285" stroke="var(--border)" />
          <circle cx="283" cy="31" fill="var(--success)" r="3" />
        </svg>
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className="h-24 overflow-hidden rounded-xl border bg-surface-sunken"
    >
      <svg className="size-full" viewBox="0 0 320 96">
        <rect
          fill="var(--card)"
          height="58"
          rx="12"
          stroke="var(--border)"
          width="58"
          x="131"
          y="19"
        />
        <text
          fill="var(--foreground)"
          fontFamily="var(--font-heading)"
          fontSize="20"
          fontWeight="600"
          textAnchor="middle"
          x="160"
          y="56"
        >
          {project.title.slice(0, 1)}
        </text>
      </svg>
    </div>
  );
};
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
  showGraphic = false,
}: {
  className?: string;
  commentCount?: number;
  compact?: boolean;
  post: Post;
  showGraphic?: boolean;
}) => (
  <Link
    className={cn(
      "group flex flex-col gap-3 rounded-xl border border-transparent px-4 py-4 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-elevation-1 sm:flex-row sm:items-center sm:justify-between",
      className
    )}
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
