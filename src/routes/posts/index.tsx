import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { PostRow } from "@/components/content-preview";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { getPosts } from "@/lib/posts";

import { api } from "../../../convex/_generated/api";

const routeApi = getRouteApi("/posts/");
const WritingPage = () => {
  const { posts } = routeApi.useLoaderData();
  const postSlugs = posts.map((p) => p.slug);
  const commentCounts = useQuery(api.comments.countByPosts, { postSlugs });
  return (
    <div className="space-y-14 pb-8 sm:space-y-16">
      <PageHeader
        eyebrow="Field notes"
        description="Thoughts on software, design, and the craft of building things."
        title="Writing"
      />

      <section className="space-y-6">
        <SectionHeader
          description={`${posts.length} essays and notes, newest first.`}
          eyebrow="Archive"
          size="compact"
          title="All posts"
        />
        <div className="-mx-4 space-y-1">
          {posts.map((post) => (
            <PostRow
              commentCount={commentCounts?.[post.slug] ?? 0}
              key={post.slug}
              post={post}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
export const Route = createFileRoute("/posts/")({
  component: WritingPage,
  head: () => ({
    meta: [
      { title: "Writing — Gavin Kline" },
      {
        content:
          "Thoughts on software, design, engineering leadership, and the craft of building things.",
        name: "description",
      },
      { content: "Writing — Gavin Kline", property: "og:title" },
      {
        content:
          "Thoughts on software, design, engineering leadership, and the craft of building things.",
        property: "og:description",
      },
      { content: "website", property: "og:type" },
    ],
  }),
  loader: () => ({ posts: getPosts() }),
});
