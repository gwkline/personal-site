import { useEffect } from "react";

declare global {
  interface Navigator {
    modelContext?: {
      provideContext?: (context: { tools: unknown[] }) => void;
    };
  }
}

const listPostsTool = {
  description:
    "List every post on gavinkline.com with titles, URLs, and one-line summaries.",
  execute: async () => {
    const response = await fetch("/llms.txt");
    return response.text();
  },
  inputSchema: { properties: {}, required: [], type: "object" },
  name: "list_posts",
};

const getPostTool = {
  description:
    "Fetch one post from gavinkline.com as markdown. Pass the post slug, for example 01-hello-world.",
  execute: async (args: { slug?: string }) => {
    const response = await fetch(`/posts/${args.slug}.md`, {
      headers: { Accept: "text/markdown" },
    });
    if (!response.ok) {
      return `Post not found: ${args.slug}`;
    }
    return response.text();
  },
  inputSchema: {
    properties: {
      slug: { description: "The post slug", type: "string" },
    },
    required: ["slug"],
    type: "object",
  },
  name: "get_post",
};

export const WebMcpProvider = () => {
  useEffect(() => {
    navigator.modelContext?.provideContext?.({
      tools: [listPostsTool, getPostTool],
    });
  }, []);
  return null;
};
