import { loadMarkdownEntries, requireFrontmatterString } from "./markdown";

export interface Project {
  slug: string;
  title: string;
  role: string;
  period: string;
  summary: string;
  description?: string;
  tech: string[];
  type: "work" | "personal" | "oss";
  highlighted?: boolean;
  links?: {
    live?: string;
    github?: string;
  };
}
const projectOrder = [
  "govdash-capture-cloud",
  "whop-backend",
  "gorjian-platform",
  "pm-ivas",
  "plantry",
  "full-stack-skeleton",
  "artestian",
  "personal-site",
];

export const buildProjects = (files: Record<string, string>): Project[] => {
  const allProjectsUnordered: Project[] = loadMarkdownEntries(files).map(
    ({ data, markdown, slug }) => ({
      description: markdown,
      highlighted: data.highlighted === true,
      links: data.links as Project["links"],
      period: requireFrontmatterString(data, "period"),
      role: requireFrontmatterString(data, "role"),
      slug,
      summary: requireFrontmatterString(data, "summary"),
      tech: (data.tech ?? []) as string[],
      title: requireFrontmatterString(data, "title"),
      type: requireFrontmatterString(data, "type") as Project["type"],
    })
  );
  const projectMap = new Map<string, Project>();
  for (const project of allProjectsUnordered) {
    projectMap.set(project.slug, project);
  }
  // Return projects in the defined order, then any remaining projects
  const orderedProjects: Project[] = [];
  for (const slug of projectOrder) {
    const project = projectMap.get(slug);
    if (project) {
      orderedProjects.push(project);
      projectMap.delete(slug);
    }
  }
  for (const project of projectMap.values()) {
    orderedProjects.push(project);
  }
  return orderedProjects;
};
