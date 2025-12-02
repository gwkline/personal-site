import { parseMarkdownFile } from "./markdown";

export type Project = {
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
};

const MD_EXTENSION_REGEX = /\.md$/;
const SLUG_REGEX = /\/([^/]+)\.md$/;

type ProjectFrontmatter = {
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
};

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
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

const allProjectsUnordered: Project[] = Object.entries(projectFiles).map(
	([filePath, fileContents]) => {
		const match = filePath.match(SLUG_REGEX);
		const slug = match?.[1] ?? filePath.replace(MD_EXTENSION_REGEX, "");

		const { data, html } = parseMarkdownFile(fileContents);
		const frontmatter = data as Partial<ProjectFrontmatter>;

		return {
			slug,
			title: frontmatter.title as string,
			role: frontmatter.role as string,
			period: frontmatter.period as string,
			summary: frontmatter.summary as string,
			description: html,
			tech: (frontmatter.tech ?? []) as string[],
			type: frontmatter.type as "work" | "personal" | "oss",
			highlighted: frontmatter.highlighted ?? false,
			links: frontmatter.links as Project["links"],
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

export function getProjects(): Project[] {
	return allProjectsOrdered;
}

export function getProjectBySlug(slug: string): Project | undefined {
	return allProjectsUnordered.find((project) => project.slug === slug);
}
