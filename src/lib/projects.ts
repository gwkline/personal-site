import { parseMarkdownFile } from "./markdown";

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
const MD_EXTENSION_REGEX = /\.md$/u;
const SLUG_REGEX = /\/(?<slug>[^/]+)\.md$/u;
interface ProjectFrontmatter {
  title: string;
  role: string;
  period: string;
  summary: string;
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
  "gorjian-platform",
  "whop-backend",
  "pm-ivas",
  "plantry",
  "full-stack-skeleton",
  "artestian",
  "personal-site",
];
const projectFiles = import.meta.glob("/src/content/projects/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;
const allProjectsUnordered: Project[] = Object.entries(projectFiles).map(
  ([filePath, fileContents]) => {
    const match = filePath.match(SLUG_REGEX);
    const slug =
      match?.groups?.slug ?? filePath.replace(MD_EXTENSION_REGEX, "");
    const { data, markdown } = parseMarkdownFile(fileContents);
    const frontmatter = data as Partial<ProjectFrontmatter>;
    return {
      description: markdown,
      highlighted: frontmatter.highlighted ?? false,
      links: frontmatter.links as Project["links"],
      period: frontmatter.period as string,
      role: frontmatter.role as string,
      slug,
      summary: frontmatter.summary as string,
      tech: (frontmatter.tech ?? []) as string[],
      title: frontmatter.title as string,
      type: frontmatter.type as "work" | "personal" | "oss",
    } satisfies Project;
  }
);
const allProjectsOrdered = (() => {
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
  // Add any remaining projects that weren't in the order list
  for (const project of projectMap.values()) {
    orderedProjects.push(project);
  }
  return orderedProjects;
})();
export const getProjects = (): Project[] => allProjectsOrdered;
export const getProjectBySlug = (slug: string): Project | undefined =>
  allProjectsUnordered.find((project) => project.slug === slug);
