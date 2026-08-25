import { v } from "convex/values";

import { internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";

const SNAPSHOT_KEY = "public-activity";
const DEFAULT_USERNAME = "gwkline";
const REFRESH_INTERVAL_MS = 60 * 60 * 1000;
const MAX_EVENTS = 8;
const MAX_REPOS = 5;

interface GitHubApiEvent {
  created_at?: string;
  id?: string;
  payload?: Record<string, unknown>;
  repo?: { name?: string };
  type?: string;
}

interface GitHubApiRepo {
  archived?: boolean;
  description?: string | null;
  fork?: boolean;
  html_url?: string;
  language?: string | null;
  name?: string;
  pushed_at?: string;
  stargazers_count?: number;
}

interface EventSummary {
  createdAt: number;
  id: string;
  kind: string;
  message: string;
  repo: string;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const describePullRequest = (
  payload: Record<string, unknown>
): { kind: string; message: string } | null => {
  const pullRequest = asRecord(payload.pull_request);
  const number = asNumber(pullRequest.number);
  if (asString(payload.action) === "opened") {
    return { kind: "pr", message: `Opened pull request #${number}` };
  }
  if (asString(payload.action) === "closed") {
    return pullRequest.merged === true
      ? { kind: "merge", message: `Merged pull request #${number}` }
      : { kind: "pr", message: `Closed pull request #${number}` };
  }
  return null;
};

const describeEvent = (
  event: GitHubApiEvent
): { kind: string; message: string } | null => {
  const repo = asString(event.repo?.name);
  if (!repo) {
    return null;
  }
  const payload = asRecord(event.payload);
  switch (event.type) {
    case "PushEvent": {
      const commits =
        asArray(payload.commits).length || asNumber(payload.size) || 1;
      const branch = (asString(payload.ref) ?? "main").replace(
        "refs/heads/",
        ""
      );
      return {
        kind: "push",
        message: `Pushed ${commits} commit${commits === 1 ? "" : "s"} to ${branch}`,
      };
    }
    case "PullRequestEvent": {
      return describePullRequest(payload);
    }
    case "IssuesEvent": {
      if (asString(payload.action) !== "opened") {
        return null;
      }
      const issue = asRecord(payload.issue);
      return {
        kind: "issue",
        message: `Opened issue #${asNumber(issue.number)}`,
      };
    }
    case "ReleaseEvent": {
      const release = asRecord(payload.release);
      return {
        kind: "release",
        message: `Released ${
          asString(release.tag_name) ?? asString(release.name) ?? "a version"
        }`,
      };
    }
    case "CreateEvent": {
      const refType = asString(payload.ref_type);
      if (refType === "repository") {
        return { kind: "create", message: "Created a new repository" };
      }
      if (refType === "branch") {
        return {
          kind: "branch",
          message: `Created branch ${asString(payload.ref)}`,
        };
      }
      return null;
    }
    case "WatchEvent": {
      return { kind: "star", message: "Starred the repo" };
    }
    case "ForkEvent": {
      return { kind: "fork", message: "Forked the repo" };
    }
    case "PublicEvent": {
      return { kind: "open-source", message: "Open-sourced the repo" };
    }
    default: {
      return null;
    }
  }
};

const normalizeEvents = (payload: unknown): EventSummary[] => {
  const seen = new Set<string>();
  const summaries: EventSummary[] = [];
  for (const raw of asArray(payload)) {
    const event = asRecord(raw) as GitHubApiEvent;
    const described = describeEvent(event);
    const repo = asString(event.repo?.name);
    if (!described || !repo) {
      continue;
    }
    const id = asString(event.id) ?? `${repo}-${event.type}`;
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    summaries.push({
      createdAt: Date.parse(event.created_at ?? "") || Date.now(),
      id,
      kind: described.kind,
      message: described.message,
      repo,
    });
    if (summaries.length >= MAX_EVENTS) {
      break;
    }
  }
  return summaries;
};

const normalizeRepos = (payload: unknown) => {
  const repos = asArray(payload)
    .map((raw) => asRecord(raw) as GitHubApiRepo)
    .filter((repo) => repo.fork !== true && repo.archived !== true)
    .filter((repo) => Boolean(asString(repo.name) && asString(repo.html_url)))
    .toSorted(
      (a, b) => Date.parse(b.pushed_at ?? "") - Date.parse(a.pushed_at ?? "")
    )
    .slice(0, MAX_REPOS);

  return repos.map((repo) => ({
    description: asString(repo.description ?? undefined),
    language: asString(repo.language ?? undefined),
    name: asString(repo.name) ?? "",
    pushedAt: Date.parse(repo.pushed_at ?? "") || Date.now(),
    stars: asNumber(repo.stargazers_count) ?? 0,
    url: asString(repo.html_url) ?? "",
  }));
};

export const getFetchedAt = internalQuery({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("githubSnapshots")
      .withIndex("by_key", (q) => q.eq("key", SNAPSHOT_KEY))
      .unique();
    return existing?.fetchedAt ?? null;
  },
});

export const sync = action({
  args: {},
  handler: async (ctx) => {
    const fetchedAt = await ctx.runQuery(internal.github.getFetchedAt);
    if (fetchedAt !== null && Date.now() - fetchedAt < REFRESH_INTERVAL_MS) {
      return;
    }

    const username = process.env.GITHUB_USERNAME?.trim() || DEFAULT_USERNAME;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "gavinkline.com",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    const token = process.env.GITHUB_TOKEN?.trim();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const [eventsResponse, reposResponse] = await Promise.all([
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`,
        { headers }
      ),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100`,
        { headers }
      ),
    ]);
    if (!eventsResponse.ok || !reposResponse.ok) {
      throw new Error(
        `GitHub API error: events=${eventsResponse.status} repos=${reposResponse.status}`
      );
    }

    await ctx.runMutation(internal.github.storeSnapshot, {
      events: normalizeEvents(await eventsResponse.json()),
      fetchedAt: Date.now(),
      key: SNAPSHOT_KEY,
      repos: normalizeRepos(await reposResponse.json()),
    });
  },
});

export const storeSnapshot = internalMutation({
  args: {
    events: v.array(
      v.object({
        createdAt: v.number(),
        id: v.string(),
        kind: v.string(),
        message: v.string(),
        repo: v.string(),
      })
    ),
    fetchedAt: v.number(),
    key: v.string(),
    repos: v.array(
      v.object({
        description: v.optional(v.string()),
        language: v.optional(v.string()),
        name: v.string(),
        pushedAt: v.number(),
        stars: v.number(),
        url: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("githubSnapshots")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return;
    }
    await ctx.db.insert("githubSnapshots", args);
  },
});

export const getSnapshot = query({
  args: {},
  handler: (ctx) =>
    ctx.db
      .query("githubSnapshots")
      .withIndex("by_key", (q) => q.eq("key", SNAPSHOT_KEY))
      .unique(),
});
