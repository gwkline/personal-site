import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import { ProjectCard } from "@/components/content-preview";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { getProjects } from "@/lib/projects";

const routeApi = getRouteApi("/work/");
const WorkPage = () => {
  const { projects } = routeApi.useLoaderData();
  const workProjects = projects.filter((p) => p.type === "work");
  const personalProjects = projects.filter((p) => p.type === "personal");
  const ossProjects = projects.filter((p) => p.type === "oss");
  return (
    <div className="space-y-20 pb-8 sm:space-y-24">
      <PageHeader
        description="Selected products, platforms, and open-source projects I've built, led, and shipped."
        eyebrow="Portfolio"
        title="Work"
      />

      {workProjects.length > 0 && (
        <section className="space-y-7">
          <SectionHeader
            description="Production systems and product teams shaped through hands-on engineering and technical leadership."
            eyebrow="Professional"
            title="Systems built for real-world use"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {workProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}

      {personalProjects.length > 0 && (
        <section className="space-y-7">
          <SectionHeader
            description="Independent products and experiments driven from first idea through implementation."
            eyebrow="Personal"
            title="Ideas taken all the way to code"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {personalProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}

      {ossProjects.length > 0 && (
        <section className="space-y-7">
          <SectionHeader
            description="Reusable foundations, reference implementations, and contributions shared in the open."
            eyebrow="Open source"
            title="Useful work, shared"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {ossProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
export const Route = createFileRoute("/work/")({
  component: WorkPage,
  head: () => ({
    meta: [
      { title: "Work — Gavin Kline" },
      {
        content:
          "Selected products, platforms, and open-source projects built and led by Gavin Kline.",
        name: "description",
      },
    ],
  }),
  loader: () => ({ projects: getProjects() }),
});
