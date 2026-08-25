import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Comments } from "@/components/comments";
import { ProjectCard } from "@/components/content-preview";
import { DitheredLandscape } from "@/components/home/dithered-landscape";
import { GitHubActivity } from "@/components/home/github-activity";
import { Eyebrow } from "@/components/page-header";
import { PlaygroundCard } from "@/components/playground-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Grid } from "@/components/ui/grid";
import { SectionHeader } from "@/components/ui/section-header";
import { playgroundItems } from "@/lib/playground";
import { getProjects } from "@/lib/projects";
import type { Project } from "@/lib/projects";

const routeApi = getRouteApi("/");
const Hero = () => (
  <section
    className="relative isolate -mx-4 min-h-184 overflow-hidden border-hero-glow/20 border-y bg-hero-night sm:-mx-6 lg:mx-0 lg:min-h-200 lg:rounded-3xl lg:border"
    data-landscape-surface
  >
    <DitheredLandscape />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,25,0.01)_0%,rgba(2,8,25,0.08)_46%,rgba(2,8,25,0.86)_100%)]" />
    <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(2,8,25,0.68)_0%,rgba(2,8,25,0.3)_44%,transparent_72%)] lg:block" />
    <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_110px_rgba(1,5,18,0.46)]" />

    <p className="pointer-events-none absolute top-5 right-5 z-10 border-hero-glow/45 border-l pl-3 font-mono text-pico text-hero-ember/80 uppercase tracking-[0.18em] sm:top-8 sm:right-8">
      Move to drift · press to disrupt
    </p>

    <div className="relative z-10 flex min-h-184 max-w-3xl flex-col justify-end px-6 py-8 sm:px-10 sm:py-10 lg:min-h-200 lg:px-14 lg:py-12">
      <div className="max-w-2xl">
        <Eyebrow className="inline-flex rounded-full border border-hero-glow/25 bg-hero-deep/55 px-3 py-1.5 text-hero-light shadow-[0_8px_28px_rgba(1,5,18,0.38)] backdrop-blur-sm">
          Software craftsman · serial shipper
        </Eyebrow>
        <h1 className="mt-6 font-heading text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-hero-sand text-balance sm:text-6xl lg:text-7xl">
          Building dependable software for{" "}
          <span className="text-hero-glow">ambitious ideas.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-hero-haze sm:text-lg">
          I&apos;m Gavin, Head of Engineering at GovDash. I lead engineering and
          AI strategy while staying close to the architecture, the code, and the
          people using what we ship.
        </p>
        <nav
          aria-label="Homepage destinations"
          className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-white/15 border-t pt-5"
        >
          <Link
            className="group flex items-center gap-2 font-mono text-micro text-hero-mist uppercase tracking-[0.12em] transition-colors duration-150 hover:text-hero-glow"
            to="/work"
          >
            Explore my work
            <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-1" />
          </Link>
          <Link
            className="group flex items-center gap-2 font-mono text-micro text-hero-mist uppercase tracking-[0.12em] transition-colors duration-150 hover:text-hero-glow"
            to="/about"
          >
            More about me
            <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-1" />
          </Link>
          <Link
            className="group flex items-center gap-2 font-mono text-micro text-hero-mist uppercase tracking-[0.12em] transition-colors duration-150 hover:text-hero-glow"
            to="/playground"
          >
            Playground
            <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-1" />
          </Link>
        </nav>
      </div>
    </div>
  </section>
);

const FeaturedWork = ({ projects }: { projects: Project[] }) => {
  const primaryProjects = projects.slice(0, 2);
  const supportProjects = projects.slice(2);

  return (
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
        size="lg"
        title="Current work and momentum"
      />

      <Grid cols="2" from="lg">
        {primaryProjects.map((project) => (
          <ProjectCard
            className="min-h-72"
            key={project.slug}
            project={project}
            showGraphic
          />
        ))}
      </Grid>

      {supportProjects.length > 0 ? (
        <Grid cols="2" from="md">
          {supportProjects.map((project) => (
            <ProjectCard
              compact
              key={project.slug}
              project={project}
              showGraphic
            />
          ))}
        </Grid>
      ) : null}
    </section>
  );
};

const LabPreview = () => (
  <section className="space-y-7 rounded-[2rem] border bg-surface-sunken/55 p-4 sm:p-6 lg:p-8">
    <SectionHeader
      action={
        <Button
          nativeButton={false}
          render={<Link to="/playground" />}
          size="sm"
          variant="ghost"
        >
          Playground
          <ArrowRight />
        </Button>
      }
      description="Small worlds, useful tools, and ongoing experiments built to learn by making."
      eyebrow="Open lab"
      title="Experiments and other live wires"
    />

    <Grid cols="3" from="lg">
      {playgroundItems.map((item) => (
        <PlaygroundCard compact item={item} key={item.to} />
      ))}
    </Grid>
  </section>
);

const Guestbook = () => (
  <section className="space-y-7" id="guestbook">
    <SectionHeader
      description="A small corner of the site for hellos, questions, and notes from people passing through."
      eyebrow="Open channel"
      title="Leave a signal."
    />
    <Card className="space-y-6 p-6 sm:p-8" elevated>
      <div className="max-w-2xl border-b pb-6">
        <Badge variant="info">Guestbook</Badge>
        <h3 className="mt-4 font-heading text-2xl font-semibold tracking-[-0.035em]">
          Say hello.
        </h3>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          Sign in, leave a note, or join an existing conversation. Recent
          activity also appears in the live panel.
        </p>
      </div>
      <Comments compact title="Guestbook" />
    </Card>
  </section>
);

const HomePage = () => {
  const { projects } = routeApi.useLoaderData();
  const featuredProjects = projects.filter((p) => p.highlighted).slice(0, 3);
  return (
    <div className="space-y-24 pb-8 sm:space-y-28">
      <Hero />
      <FeaturedWork projects={featuredProjects} />
      <GitHubActivity />
      <LabPreview />
      <Guestbook />
    </div>
  );
};
export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Gavin Kline — Software Builder" },
      {
        content:
          "Engineering leader and hands-on builder working across AI, backend systems, product architecture, and high-performing teams.",
        name: "description",
      },
      {
        content: "Gavin Kline — Software Builder",
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
  loader: () => ({ projects: getProjects() }),
});
