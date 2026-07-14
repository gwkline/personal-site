import {
  createFileRoute,
  getRouteApi,
  Link,
  notFound,
} from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Markdown from "react-markdown";

import { Comments } from "@/components/comments";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { Separator } from "@/components/ui/separator";
import { getAdjacentPosts, getPostBySlug } from "@/lib/posts";

const routeApi = getRouteApi("/posts/$slug");
const PostPage = () => {
  const { slug } = routeApi.useParams();
  const post = getPostBySlug(slug);
  if (!post) {
    return null;
  }
  const adjacent = getAdjacentPosts(slug);
  return (
    <div className="space-y-10 pb-8 sm:space-y-12">
      <Button
        nativeButton={false}
        render={<Link to="/posts" />}
        size="sm"
        variant="ghost"
      >
        <ArrowLeft className="size-4" />
        Back to posts
      </Button>

      <PageHeader
        description={
          post.description ||
          "A field note on software, systems, and the craft of building."
        }
        eyebrow={`${post.date} · ${post.readingTime}`}
        size="detail"
        title={post.title}
      >
        {Array.isArray(post.tags) && post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} size="sm" variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </PageHeader>

      <article className="prose mx-auto">
        <Markdown>{post.content}</Markdown>
      </article>

      <Separator />

      <div className="mx-auto w-full max-w-3xl">
        <Comments postSlug={post.slug} />
      </div>

      <Separator />

      <section className="space-y-6">
        <SectionHeader
          eyebrow="More writing"
          size="compact"
          title="Keep reading"
        />
        <nav aria-label="Adjacent posts" className="grid gap-3 sm:grid-cols-2">
          {adjacent.prev ? (
            <Button
              className="h-auto min-h-24 justify-start whitespace-normal p-4 text-left"
              nativeButton={false}
              render={
                <Link params={{ slug: adjacent.prev.slug }} to="/posts/$slug" />
              }
              variant="outline"
            >
              <ArrowLeft className="size-4 self-start text-primary" />
              <span className="min-w-0 space-y-1">
                <span className="block font-mono text-[0.6875rem] text-muted-foreground uppercase tracking-[0.12em]">
                  Previous
                </span>
                <span className="line-clamp-2 block">
                  {adjacent.prev.title}
                </span>
              </span>
            </Button>
          ) : (
            <div className="hidden sm:block" />
          )}
          {adjacent.next ? (
            <Button
              className="h-auto min-h-24 justify-end whitespace-normal p-4 text-right sm:col-start-2"
              nativeButton={false}
              render={
                <Link params={{ slug: adjacent.next.slug }} to="/posts/$slug" />
              }
              variant="outline"
            >
              <span className="min-w-0 space-y-1">
                <span className="block font-mono text-[0.6875rem] text-muted-foreground uppercase tracking-[0.12em]">
                  Next
                </span>
                <span className="line-clamp-2 block">
                  {adjacent.next.title}
                </span>
              </span>
              <ArrowRight className="size-4 self-start text-primary" />
            </Button>
          ) : null}
        </nav>
      </section>
    </div>
  );
};
export const Route = createFileRoute("/posts/$slug")({
  component: PostPage,
  head: ({ params }) => {
    const post = getPostBySlug(params.slug);
    return {
      meta: [
        { title: `${post?.title ?? "Writing"} — Gavin Kline` },
        {
          content: post?.description || "Writing by Gavin Kline.",
          name: "description",
        },
        { content: post?.title ?? "Writing", property: "og:title" },
        {
          content: post?.description || "Writing by Gavin Kline.",
          property: "og:description",
        },
        { content: "article", property: "og:type" },
        { content: "summary", name: "twitter:card" },
      ],
    };
  },
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) {
      throw notFound();
    }
    const adjacent = getAdjacentPosts(params.slug);
    return { adjacent, post };
  },
});
