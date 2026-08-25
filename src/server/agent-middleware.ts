import { createMiddleware } from "@tanstack/react-start";

import { getPostBySlug } from "@/lib/posts";

const STATIC_PAGE_MARKDOWN: Record<string, string> = {
  "/": `# Gavin Kline

Software builder and Head of Engineering at GovDash. This site hosts
essays on software and design, an archive of shipped work, a 75 Hard
training log, and interactive playgrounds.

## Where to go next

- /posts: essays and notes, newest first
- /work: shipped projects with case studies
- /about: career story and principles
- /playground: interactive experiments
- /llms.txt: machine-readable index of everything above
`,
  "/75-hard": `# 75 Hard

A daily training log for the 75 Hard challenge: two workouts, a diet,
ten pages of reading, a gallon of water, and a progress photo every
day for 75 days.
`,
  "/about": `# About Gavin Kline

Head of Engineering at GovDash. Career story, principles, and how I
work live on this page.

See /work for shipped projects and /posts for writing.
`,
  "/playground": `# Playground

Interactive toys and experiments, including a generative wallpaper
studio and a browser roguelike.
`,
  "/work": `# Work

Shipped projects with case studies, newest first. Each project page
covers role, period, and a technical summary.

See /llms.txt for the full project index.
`,
};

const postToMarkdown = (
  post: NonNullable<ReturnType<typeof getPostBySlug>>
): string =>
  `# ${post.title}

${post.description ? `${post.description}\n` : ""}
- Published: ${post.date}
- Reading time: ${post.readingTime}
- URL: https://gavinkline.com/posts/${post.slug}

${post.content}
`;

const agentLinks = [
  '</llms.txt>; rel="service-doc"; type="text/plain"',
  '</rss.xml>; rel="alternate"; type="application/rss+xml"',
  '</sitemap.xml>; rel="describedby"; type="application/xml"',
  '/.well-known/api-catalog; rel="api-catalog"; type="application/linkset+json"',
].join(", ");

/** Agent discovery: RFC 8288 Link headers on every HTML response and
 * text/markdown negotiation for agents that prefer it. */
export const agentDiscovery = createMiddleware({ type: "request" }).server(
  async ({ request, next }) => {
    const url = new URL(request.url);
    const accept = request.headers.get("accept") ?? "";
    const wantsMarkdown = accept.includes("text/markdown");
    const postMatch = /^\/posts\/(?<slug>[\w-]+?)(?:\.md)?$/u.exec(
      url.pathname
    );
    // The .md suffix negotiates by itself; no Accept header required.
    const wantsMarkdownOrSuffix =
      wantsMarkdown || (postMatch?.[0].endsWith(".md") ?? false);

    if (wantsMarkdownOrSuffix && postMatch) {
      const post = getPostBySlug(postMatch.groups?.slug ?? "");
      if (post) {
        return new Response(postToMarkdown(post), {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            Link: agentLinks,
          },
        });
      }
    }

    if (wantsMarkdown && !postMatch && STATIC_PAGE_MARKDOWN[url.pathname]) {
      return new Response(STATIC_PAGE_MARKDOWN[url.pathname], {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          Link: agentLinks,
        },
      });
    }

    // The Link header mutation must run after next(), so the middleware
    // cannot return the next() call directly.
    const result =
      // oxlint-disable-next-line node/callback-return
      await next();
    result.response.headers.append("Link", agentLinks);
    return result;
  }
);
