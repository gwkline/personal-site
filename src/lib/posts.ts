import { format, parseISO } from "date-fns";

import { parseMarkdownFile } from "./markdown";

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
  tags?: string[];
  readingTime: string;
  status?: "draft" | "published";
}
const WORDS_PER_MINUTE = 200;
const WHITESPACE_REGEX = /\s+/u;
const HTML_TAG_REGEX = /<[^>]*>/gu;
const MD_EXTENSION_REGEX = /\.md$/u;
const SLUG_REGEX = /\/(?<slug>[^/]+)\.md$/u;
const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy");
  } catch {
    return dateString;
  }
};
interface PostFrontmatter {
  title: string;
  date: string;
  description: string;
  tags?: string[];
  status?: "draft" | "published";
}
const calculateReadingTime = (text: string): string => {
  // Strip HTML tags and count words
  const plainText = text.replace(HTML_TAG_REGEX, "");
  const words = plainText.trim().split(WHITESPACE_REGEX).length;
  const minutes = Math.ceil(words / WORDS_PER_MINUTE);
  return `${minutes} min read`;
};
// Eagerly import all markdown files as raw strings at build time.
const postFiles = import.meta.glob("/src/content/posts/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;
const allPosts: Post[] = Object.entries(postFiles)
  .map(([filePath, fileContents]) => {
    const match = filePath.match(SLUG_REGEX);
    const slug =
      match?.groups?.slug ?? filePath.replace(MD_EXTENSION_REGEX, "");
    const { data, markdown } = parseMarkdownFile(fileContents);
    const frontmatter = data as Partial<PostFrontmatter>;
    const rawDate = frontmatter.date as string;
    return {
      content: markdown,
      date: formatDate(rawDate),
      description: frontmatter.description as string,
      rawDate,
      readingTime: calculateReadingTime(markdown),
      slug,
      status: frontmatter.status,
      tags: frontmatter.tags,
      title: frontmatter.title as string,
    };
  })
  // Filter out drafts
  .filter((post) => post.status !== "draft")
  // Sort by date descending (newest first)
  .toSorted((a, b) => {
    const dateA = new Date(a.rawDate);
    const dateB = new Date(b.rawDate);
    return dateB.getTime() - dateA.getTime();
  })
  // Remove rawDate from final output
  .map(({ rawDate: _, ...post }) => post satisfies Post);
export const getPosts = (): Post[] => allPosts;
export const getPostBySlug = (slug: string): Post | undefined =>
  allPosts.find((post) => post.slug === slug);
export const getAdjacentPosts = (
  slug: string
): {
  prev: Post | null;
  next: Post | null;
} => {
  const index = allPosts.findIndex((post) => post.slug === slug);
  return {
    next: index < allPosts.length - 1 ? allPosts[index + 1] : null,
    prev: index > 0 ? allPosts[index - 1] : null,
  };
};
