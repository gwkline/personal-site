import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getPosts } from "@/lib/posts";
import type { Post } from "@/lib/posts";
import { getProjects } from "@/lib/projects";
import type { Project } from "@/lib/projects";

const routeApi = getRouteApi("/");
const Hero = () => (
  <section className="space-y-6">
    <h1 className="text-5xl tracking-tight md:text-6xl">
      Building software
      <br />
      <span className="text-muted-foreground italic">with intention</span>
    </h1>
    <p className="text-lg text-muted-foreground">
      I&apos;m Gavin, Head of Engineering at GovDash. I lead engineering and AI
      strategy while staying hands-on with backend systems, product
      architecture, and shipping software that drives real business impact.
    </p>
    <div className="flex gap-3">
      <Button nativeButton={false} render={<Link to="/work" />}>
        View my work
        <ArrowRight className="size-4" />
      </Button>
      <Button
        nativeButton={false}
        render={<Link to="/about" />}
        variant="outline"
      >
        About me
      </Button>
    </div>
  </section>
);
const FeaturedWork = ({ projects }: { projects: Project[] }) => (
  <section className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl">My Work</h2>
      <Link
        className="text-muted-foreground text-sm hover:text-foreground"
        to="/work"
      >
        View all →
      </Link>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {projects.map((project) => (
        <Link
          className="group rounded-lg border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
          key={project.slug}
          params={{ slug: project.slug }}
          to="/work/$slug"
        >
          <div className="mb-3 flex items-start justify-between">
            <h3 className="font-medium font-sans">{project.title}</h3>
            <Badge variant="outline">{project.type}</Badge>
          </div>
          <p className="line-clamp-4 text-muted-foreground text-xs">
            {project.summary}
          </p>
        </Link>
      ))}
    </div>
  </section>
);
const RecentPosts = ({ posts }: { posts: Post[] }) => (
  <section className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl">Recent Posts</h2>
      <Link
        className="text-muted-foreground text-sm hover:text-foreground"
        to="/posts"
      >
        View all →
      </Link>
    </div>
    <div className="space-y-4">
      {posts.map((post) => (
        <Link
          className="group flex items-baseline justify-between gap-4 py-2"
          key={post.slug}
          params={{ slug: post.slug }}
          to="/posts/$slug"
        >
          <span className="font-medium transition-colors group-hover:text-muted-foreground">
            {post.title}
          </span>
          <span className="shrink-0 text-muted-foreground text-sm">
            {post.date}
          </span>
        </Link>
      ))}
    </div>
  </section>
);
const HomePage = () => {
  const { posts, projects } = routeApi.useLoaderData();
  const featuredProjects = projects.filter((p) => p.highlighted).slice(0, 3);
  const recentPosts = posts.slice(0, 3);
  return (
    <div className="space-y-16">
      <Hero />
      <Separator />
      <FeaturedWork projects={featuredProjects} />
      <RecentPosts posts={recentPosts} />
    </div>
  );
};
export const Route = createFileRoute("/")({
  component: HomePage,
  loader: () => ({ posts: getPosts(), projects: getProjects() }),
});
