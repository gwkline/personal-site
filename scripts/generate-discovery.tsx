import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import type { Post } from "../src/lib/posts-core";
import { buildPosts } from "../src/lib/posts-core";
import type { Project } from "../src/lib/projects-core";
import { buildProjects } from "../src/lib/projects-core";

const loadProjectFiles = (): Record<string, string> => {
  const dir = path.resolve(import.meta.dir, "../src/content/projects");
  const files: Record<string, string> = {};
  for (const file of readdirSync(dir)) {
    if (file.endsWith(".md")) {
      files[`src/content/projects/${file}`] = readFileSync(
        path.resolve(dir, file),
        "utf-8"
      );
    }
  }
  return files;
};

const loadPostFiles = (): Record<string, string> => {
  const dir = path.resolve(import.meta.dir, "../src/content/posts");
  const files: Record<string, string> = {};
  for (const file of readdirSync(dir)) {
    if (file.endsWith(".md")) {
      files[`src/content/posts/${file}`] = readFileSync(
        path.resolve(dir, file),
        "utf-8"
      );
    }
  }
  return files;
};

const posts: Post[] = buildPosts(loadPostFiles());
const projects: Project[] = buildProjects(loadProjectFiles());

const OgCard = ({
  date,
  description,
  title,
}: {
  date: string;
  description?: string;
  title: string;
}) => (
  <div
    style={{
      backgroundImage:
        "linear-gradient(115deg, #f09a58 0%, #f6c08f 28%, #d8e3e9 62%, #3279c6 100%)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      justifyContent: "space-between",
      padding: 72,
      width: "100%",
    }}
  >
    <div
      style={{
        color: "#031024",
        display: "flex",
        fontSize: 22,
        letterSpacing: "0.16em",
        opacity: 0.75,
        textTransform: "uppercase",
      }}
    >
      FIELD NOTES
    </div>
    <div
      style={{
        backgroundColor: "#061633",
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: 48,
        width: "100%",
      }}
    >
      <div
        style={{
          color: "#f4f0e8",
          display: "flex",
          fontSize: title.length > 42 ? 58 : 72,
          fontWeight: 600,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      {description ? (
        <div
          style={{
            color: "#d8e3e9",
            display: "flex",
            fontSize: 30,
            opacity: 0.85,
          }}
        >
          {description}
        </div>
      ) : null}
    </div>
    <div
      style={{
        color: "#031024",
        display: "flex",
        fontSize: 24,
        justifyContent: "space-between",
        opacity: 0.8,
      }}
    >
      <div style={{ display: "flex" }}>gavinkline.com</div>
      <div style={{ display: "flex" }}>{date}</div>
    </div>
  </div>
);

const ORIGIN = (process.env.SITE_URL ?? "https://gavinkline.com").replace(
  /\/$/u,
  ""
);

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const publicDir = path.resolve(import.meta.dir, "../public");
mkdirSync(publicDir, { recursive: true });

// Render one OG card per post. Runs at build time so the server never
// carries satori, resvg, or the font bytes at runtime.
const font = new Uint8Array(
  readFileSync(
    path.resolve(import.meta.dir, "../src/assets/mona-sans-semibold.ttf")
  )
);
const ogDir = path.resolve(publicDir, "og");
mkdirSync(ogDir, { recursive: true });
await Promise.all(
  posts.map(async (post) => {
    const svg = await satori(
      <OgCard
        date={post.date}
        description={post.description}
        title={post.title}
      />,
      {
        fonts: [
          { data: font, name: "Mona Sans", style: "normal", weight: 600 },
        ],
        height: 630,
        width: 1200,
      }
    );
    const png = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 },
    })
      .render()
      .asPng();
    writeFileSync(path.resolve(ogDir, `${post.slug}.png`), png);
  })
);

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Gavin Kline — Writing</title>
    <link>${ORIGIN}/posts</link>
    <description>Essays and notes on software, design, and the craft of building things.</description>
    <atom:link href="${ORIGIN}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
${posts
  .map(
    (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${ORIGIN}/posts/${post.slug}</link>
      <guid isPermaLink="true">${ORIGIN}/posts/${post.slug}</guid>
      <pubDate>${new Date(post.rawDate).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>
`;
writeFileSync(path.resolve(publicDir, "rss.xml"), rss);

const STATIC_PATHS = [
  { path: "/", priority: "1" },
  { path: "/about", priority: "0.8" },
  { path: "/posts", priority: "0.9" },
  { path: "/work", priority: "0.9" },
  { path: "/playground", priority: "0.6" },
  { path: "/75-hard", priority: "0.6" },
  { path: "/wallpaper-lab", priority: "0.5" },
  { path: "/depths", priority: "0.5" },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
  ...STATIC_PATHS.map(
    (entry) => `  <url>
    <loc>${ORIGIN}${entry.path}</loc>
    <priority>${entry.priority}</priority>
  </url>`
  ),
  ...posts.map(
    (post) => `  <url>
    <loc>${ORIGIN}/posts/${post.slug}</loc>
    <lastmod>${post.rawDate}</lastmod>
    <priority>0.8</priority>
  </url>`
  ),
  ...projects.map(
    (project) => `  <url>
    <loc>${ORIGIN}/work/${project.slug}</loc>
    <priority>0.7</priority>
  </url>`
  ),
].join("\n")}
</urlset>
`;
writeFileSync(path.resolve(publicDir, "sitemap.xml"), sitemap);

const llms = `# Gavin Kline

> Personal site of Gavin Kline, a software builder and Head of Engineering at GovDash. The site hosts essays on software and design, an archive of shipped work, a 75 Hard training log, and interactive playgrounds.

## Blog

${posts
  .map((post) =>
    post.description
      ? `- [${post.title}](${ORIGIN}/posts/${post.slug}): ${post.description}`
      : `- [${post.title}](${ORIGIN}/posts/${post.slug})`
  )
  .join("\n")}

## Work

${projects
  .map(
    (project) =>
      `- [${project.title}](${ORIGIN}/work/${project.slug}): ${project.summary}`
  )
  .join("\n")}

## Pages

- [About](${ORIGIN}/about): career story, principles, and how I work.
- [Playground](${ORIGIN}/playground): interactive toys and experiments.
- [75 Hard](${ORIGIN}/75-hard): daily training log for the 75 Hard challenge.
- [Depths](${ORIGIN}/depths): a browser roguelike built with Effect.
- [Wallpaper Lab](${ORIGIN}/wallpaper-lab): generative wallpaper studio.
- [RSS](${ORIGIN}/rss.xml): full-text feed of new posts.
`;
writeFileSync(path.resolve(publicDir, "llms.txt"), llms);

console.log(
  `discovery files written: rss.xml (${posts.length} posts), sitemap.xml (${
    STATIC_PATHS.length + posts.length + projects.length
  } urls), llms.txt`
);
