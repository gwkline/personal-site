import type { Post } from "./posts-core";
import { buildPosts } from "./posts-core";

export type { Post } from "./posts-core";

// Eagerly import all markdown files as raw strings at build time.
const postFiles = import.meta.glob("/src/content/posts/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;
const allPosts: Post[] = buildPosts(postFiles);
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
