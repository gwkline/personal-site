import { format, parseISO } from "date-fns";
import { parseMarkdownFile } from "./markdown";

export type Post = {
	slug: string;
	title: string;
	date: string;
	description: string;
	content: string;
	tags?: string[];
	readingTime: string;
	status?: "draft" | "published";
};

const WORDS_PER_MINUTE = 200;
const WHITESPACE_REGEX = /\s+/;
const HTML_TAG_REGEX = /<[^>]*>/g;
const MD_EXTENSION_REGEX = /\.md$/;
const SLUG_REGEX = /\/([^/]+)\.md$/;

function formatDate(dateString: string): string {
	try {
		const date = parseISO(dateString);
		return format(date, "MMM d, yyyy");
	} catch {
		return dateString;
	}
}

type PostFrontmatter = {
	title: string;
	date: string;
	description: string;
	tags?: string[];
	status?: "draft" | "published";
};

function calculateReadingTime(text: string): string {
	// Strip HTML tags and count words
	const plainText = text.replace(HTML_TAG_REGEX, "");
	const words = plainText.trim().split(WHITESPACE_REGEX).length;
	const minutes = Math.ceil(words / WORDS_PER_MINUTE);
	return `${minutes} min read`;
}

// Eagerly import all markdown files as raw strings at build time.
const postFiles = import.meta.glob("/src/content/posts/*.md", {
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

const allPosts: Post[] = Object.entries(postFiles)
	.map(([filePath, fileContents]) => {
		const match = filePath.match(SLUG_REGEX);
		const slug = match?.[1] ?? filePath.replace(MD_EXTENSION_REGEX, "");

		const { data, html } = parseMarkdownFile(fileContents);
		const frontmatter = data as Partial<PostFrontmatter>;
		const rawDate = frontmatter.date as string;

		return {
			slug,
			title: frontmatter.title as string,
			date: formatDate(rawDate),
			rawDate,
			description: frontmatter.description as string,
			content: html,
			tags: frontmatter.tags,
			readingTime: calculateReadingTime(html),
			status: frontmatter.status,
		};
	})
	// Filter out drafts
	.filter((post) => post.status !== "draft")
	// Sort by date descending (newest first)
	.sort((a, b) => {
		const dateA = new Date(a.rawDate);
		const dateB = new Date(b.rawDate);
		return dateB.getTime() - dateA.getTime();
	})
	// Remove rawDate from final output
	.map(({ rawDate: _, ...post }) => post satisfies Post);

export function getPosts(): Post[] {
	return allPosts;
}

export function getPostBySlug(slug: string): Post | undefined {
	return allPosts.find((post) => post.slug === slug);
}

export function getAdjacentPosts(slug: string): {
	prev: Post | null;
	next: Post | null;
} {
	const index = allPosts.findIndex((post) => post.slug === slug);

	return {
		prev: index > 0 ? allPosts[index - 1] : null,
		next: index < allPosts.length - 1 ? allPosts[index + 1] : null,
	};
}
