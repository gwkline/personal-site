import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Code2, MapPin, Sparkles } from "lucide-react";

import { Comments } from "@/components/comments";
import { PostRow, ProjectCard } from "@/components/content-preview";
import { Eyebrow } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getPosts } from "@/lib/posts";
import type { Post } from "@/lib/posts";
import { getProjects } from "@/lib/projects";
import type { Project } from "@/lib/projects";

const routeApi = getRouteApi("/");
const Hero = () => (
  <section className="grid gap-10 pt-3 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end lg:gap-14 lg:pt-8">
    <div className="space-y-7">
      <Eyebrow>Engineering leadership · hands-on execution</Eyebrow>
      <div className="space-y-6">
        <h1 className="max-w-3xl font-heading text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-balance sm:text-6xl md:text-7xl">
          Building dependable software for{" "}
          <span className="text-primary">ambitious ideas.</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          I&apos;m Gavin, Head of Engineering at GovDash. I lead engineering and
          AI strategy while staying close to the architecture, the code, and the
          people using what we ship.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button nativeButton={false} render={<Link to="/work" />} size="lg">
          Explore my work
          <ArrowRight className="size-4" />
        </Button>
        <Button
          nativeButton={false}
          render={<Link to="/about" />}
          size="lg"
          variant="outline"
        >
          More about me
        </Button>
      </div>
    </div>

    <Card className="relative" variant="glass">
      <div className="absolute top-0 right-6 left-6 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
      <CardHeader>
        <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
          <Sparkles className="size-5" />
        </div>
        <CardTitle>Currently building</CardTitle>
        <CardDescription size="lg">
          AI-native systems and engineering teams at GovDash.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Building2 className="size-4 text-info" />
          Head of Engineering
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Code2 className="size-4 text-info" />
          Backend, product, and AI systems
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <MapPin className="size-4 text-info" />
          New York
        </div>
      </CardContent>
    </Card>
  </section>
);
const FeaturedWork = ({ projects }: { projects: Project[] }) => (
  <section className="space-y-7">
    <SectionHeader
      action={
        <Button
          nativeButton={false}
          render={<Link to="/work" />}
          size="sm"
          variant="ghost"
        >
          View all
          <ArrowRight />
        </Button>
      }
      description="Selected systems, products, and teams I've helped move from idea to durable execution."
      eyebrow="Selected work"
      title="Built to hold up in the real world"
    />
    <div className="grid gap-4 md:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard compact key={project.slug} project={project} />
      ))}
    </div>
  </section>
);
const RecentPosts = ({ posts }: { posts: Post[] }) => (
  <section className="space-y-5">
    <SectionHeader
      action={
        <Button
          nativeButton={false}
          render={<Link to="/posts" />}
          size="sm"
          variant="ghost"
        >
          All posts
          <ArrowRight />
        </Button>
      }
      description="Notes on engineering leadership, software design, and building with intent."
      eyebrow="Field notes"
      title="Thinking in public"
    />
    <div className="-mx-4 space-y-1">
      {posts.map((post) => (
        <PostRow compact key={post.slug} post={post} />
      ))}
    </div>
  </section>
);

const Guestbook = () => (
  <section className="space-y-6" id="guestbook">
    <SectionHeader
      description="A small corner of the site for hellos, questions, and notes from people passing through."
      eyebrow="Open channel"
      title="Leave a signal"
    />
    <Card
      className="grid gap-0 p-0 lg:grid-cols-[0.72fr_1.28fr]"
      variant="feature"
    >
      <div className="border-b bg-surface-sunken p-6 lg:border-r lg:border-b-0 sm:p-8">
        <Badge variant="info">Guestbook</Badge>
        <h3 className="mt-5 font-heading text-2xl font-semibold tracking-[-0.035em]">
          Say hello.
        </h3>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          Sign in, leave a note, or join an existing conversation. Recent
          activity also appears in the live panel.
        </p>
      </div>
      <div className="p-6 sm:p-8">
        <Comments compact title="Guestbook" />
      </div>
    </Card>
  </section>
);

const HomePage = () => {
  const { posts, projects } = routeApi.useLoaderData();
  const featuredProjects = projects.filter((p) => p.highlighted).slice(0, 3);
  const recentPosts = posts.slice(0, 3);
  return (
    <div className="space-y-24 pb-8 sm:space-y-28">
      <Hero />
      <FeaturedWork projects={featuredProjects} />
      <RecentPosts posts={recentPosts} />
      <Guestbook />
    </div>
  );
};
export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Gavin Kline — Engineering Leader & Software Builder" },
      {
        content:
          "Engineering leader and hands-on builder working across AI, backend systems, product architecture, and high-performing teams.",
        name: "description",
      },
      {
        content: "Gavin Kline — Engineering Leader & Software Builder",
        property: "og:title",
      },
      {
        content:
          "Engineering leadership, software systems, selected work, and field notes from Gavin Kline.",
        property: "og:description",
      },
      { content: "website", property: "og:type" },
    ],
  }),
  loader: () => ({ posts: getPosts(), projects: getProjects() }),
});
