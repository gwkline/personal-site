import {
  createFileRoute,
  getRouteApi,
  Link,
  notFound,
} from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Markdown from "react-markdown";

import { Comments } from "@/components/comments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAdjacentPosts, getPostBySlug } from "@/lib/posts";

const routeApi = getRouteApi("/posts/$slug");
const PostPage = () => {
  const { post, adjacent } = routeApi.useLoaderData();
  return (
    <div className="space-y-8">
      <Button
        nativeButton={false}
        render={<Link to="/posts" />}
        size="sm"
        variant="ghost"
      >
        <ArrowLeft className="size-4" />
        Back to posts
      </Button>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-muted-foreground text-sm">{post.date}</span>
          <span className="text-muted-foreground text-sm">
            · {post.readingTime}
          </span>
        </div>
        <h1 className="text-4xl tracking-tight md:text-5xl">{post.title}</h1>
        {Array.isArray(post.tags) && post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </header>

      <Separator />

      <article className="prose">
        <Markdown>{post.content}</Markdown>
      </article>

      <Separator />

      <Comments postSlug={post.slug} />

      <Separator />

      <nav className="flex items-center justify-between gap-4">
        {adjacent.prev ? (
          <Button
            nativeButton={false}
            render={
              <Link params={{ slug: adjacent.prev.slug }} to="/posts/$slug" />
            }
            size="sm"
            variant="ghost"
          >
            <ArrowLeft className="size-4" />
            <span className="line-clamp-1">{adjacent.prev.title}</span>
          </Button>
        ) : (
          <div />
        )}
        {adjacent.next ? (
          <Button
            nativeButton={false}
            render={
              <Link params={{ slug: adjacent.next.slug }} to="/posts/$slug" />
            }
            size="sm"
            variant="ghost"
          >
            <span className="line-clamp-1">{adjacent.next.title}</span>
            <ArrowRight className="size-4" />
          </Button>
        ) : null}
      </nav>
    </div>
  );
};
export const Route = createFileRoute("/posts/$slug")({
  component: PostPage,
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) {
      throw notFound();
    }
    const adjacent = getAdjacentPosts(params.slug);
    return { adjacent, post };
  },
});
