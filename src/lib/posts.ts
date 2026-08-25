import { format, parseISO } from "date-fns";

import { loadMarkdownEntries, requireFrontmatterString } from "./markdown";

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
const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy");
  } catch {
    return dateString;
  }
};
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
const allPosts: Post[] = loadMarkdownEntries(postFiles)
  .map(({ data, markdown, slug }) => {
    const rawDate = requireFrontmatterString(data, "date");
    return {
      content: markdown,
      date: formatDate(rawDate),
      description: requireFrontmatterString(data, "description"),
      rawDate,
      readingTime: calculateReadingTime(markdown),
      slug,
      status: data.status as Post["status"],
      tags: data.tags as Post["tags"],
      title: requireFrontmatterString(data, "title"),
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
