import type { Project } from "./projects-core";
import { buildProjects } from "./projects-core";

export type { Project } from "./projects-core";

const projectFiles = import.meta.glob("/src/content/projects/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;
const allProjectsOrdered = buildProjects(projectFiles);
const allProjectsUnordered = allProjectsOrdered;
export const getProjects = (): Project[] => allProjectsOrdered;
export const getProjectBySlug = (slug: string): Project | undefined =>
  allProjectsUnordered.find((project) => project.slug === slug);
