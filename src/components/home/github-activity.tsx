import SiGithub from "@icons-pack/react-simple-icons/icons/SiGithub.mjs";
import { useAction, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  CircleDot,
  FolderPlus,
  GitCommitHorizontal,
  GitFork,
  GitPullRequest,
  Rocket,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MonoLabel } from "@/components/ui/mono-label";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";

import { api } from "../../../convex/_generated/api";

const GITHUB_PROFILE_URL = "https://github.com/gwkline";
// Must match REFRESH_INTERVAL_MS in convex/github.ts.
const SNAPSHOT_TTL_MS = 60 * 60 * 1000;
const SYNC_RETRY_BASE_MS = 15_000;
const SYNC_RETRY_MAX_MS = 5 * 60_000;

const syncRetryDelayMs = (attempt: number): number =>
  Math.min(SYNC_RETRY_BASE_MS * 2 ** attempt, SYNC_RETRY_MAX_MS);

const EVENT_ICONS: Record<string, LucideIcon> = {
  branch: GitFork,
  create: FolderPlus,
  fork: GitFork,
  issue: CircleDot,
  merge: GitPullRequest,
  pr: GitPullRequest,
  push: GitCommitHorizontal,
  release: Rocket,
};

const EventIcon = ({ kind }: { kind: string }) => {
  const Icon = EVENT_ICONS[kind] ?? SiGithub;
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background/60 text-muted-foreground">
      <Icon className="size-4" />
    </span>
  );
};

const GitHubActivity = () => {
  const snapshot = useQuery(api.github.getSnapshot);
  const sync = useAction(api.github.sync);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (snapshot === undefined) {
      return;
    }
    const isMissing = snapshot === null;
    // The hourly cron is the primary refresher; this keeps the section alive
    // for visitors when the cron has not run (or failed) recently.
    const isStale =
      snapshot !== null && Date.now() - snapshot.fetchedAt >= SNAPSHOT_TTL_MS;
    if (!isMissing && !isStale) {
      return;
    }
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const run = async () => {
      try {
        await sync();
      } catch {
        if (!cancelled) {
          retryTimer = setTimeout(() => {
            setAttempt((value) => value + 1);
          }, syncRetryDelayMs(attempt));
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, [snapshot, sync, attempt]);

  if (snapshot === undefined || snapshot === null) {
    return (
      <section className="space-y-7" id="github">
        <SectionHeader
          description="Public commits, releases, and repositories flowing straight from GitHub."
          eyebrow="Live from GitHub"
          title="Recently shipping"
        />
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="gap-3 lg:col-span-3" variant="muted">
            {[0, 1, 2].map((index) => (
              <div className="flex items-center gap-3 px-6" key={index}>
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </Card>
          <Card className="gap-3 lg:col-span-2" variant="muted">
            {[0, 1, 2].map((index) => (
              <div className="flex items-center gap-3 px-6" key={index}>
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="size-4" />
              </div>
            ))}
          </Card>
        </div>
      </section>
    );
  }

  const { events, repos } = snapshot;
  if (events.length === 0 && repos.length === 0) {
    return null;
  }

  return (
    <section className="space-y-7" id="github" data-testid="github-activity">
      <SectionHeader
        action={
          <Button
            nativeButton={false}
            render={
              <a
                aria-label="View GitHub profile"
                href={GITHUB_PROFILE_URL}
                rel="noreferrer"
                target="_blank"
              />
            }
            size="sm"
            variant="ghost"
          >
            <SiGithub className="size-4" />
            Follow along
            <ArrowUpRight />
          </Button>
        }
        description="Public commits, releases, and repositories flowing straight from GitHub."
        eyebrow="Live from GitHub"
        title="Recently shipping"
      />

      <div className="grid gap-4 lg:grid-cols-5">
        {events.length > 0 ? (
          <Card className="lg:col-span-3" variant="muted">
            <ul className="divide-y">
              {events.map((event) => (
                <li
                  className="flex items-center gap-3 px-5 py-3.5"
                  key={event.id}
                >
                  <EventIcon kind={event.kind} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm leading-snug">
                      {event.message}{" "}
                      <a
                        className="font-medium text-foreground/80 transition-colors hover:text-primary"
                        href={`https://github.com/${event.repo}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {event.repo}
                      </a>
                    </p>
                    <MonoLabel className="mt-0.5" tracking="label">
                      {formatDistanceToNow(new Date(event.createdAt), {
                        addSuffix: true,
                      })}
                    </MonoLabel>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {repos.length > 0 ? (
          <Card
            className={events.length > 0 ? "lg:col-span-2" : "lg:col-span-5"}
            variant="muted"
          >
            <ul className="divide-y">
              {repos.map((repo) => (
                <li key={repo.name}>
                  <a
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/60"
                    href={repo.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">
                        {repo.name}
                      </p>
                      {repo.description ? (
                        <p className="mt-0.5 truncate text-muted-foreground text-xs">
                          {repo.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground">
                      {repo.language ? (
                        <span className="mr-1 hidden sm:inline">
                          {repo.language}
                        </span>
                      ) : null}
                      <Star className="size-3.5" />
                      {repo.stars}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </section>
  );
};

export { GitHubActivity };
