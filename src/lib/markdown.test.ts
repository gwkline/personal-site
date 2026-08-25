import { describe, expect, it } from "vitest";

import { loadMarkdownEntries, requireFrontmatterString } from "./markdown";

describe("loadMarkdownEntries", () => {
  it("extracts slug from the file path", () => {
    const [entry] = loadMarkdownEntries({
      "/src/content/posts/hello-world.md": "# Hi",
    });
    expect(entry.slug).toBe("hello-world");
  });

  it("falls back to the extensionless path when the slug pattern misses", () => {
    const [entry] = loadMarkdownEntries({ "posts/index": "# Hi" });
    expect(entry.slug).toBe("posts/index");
  });

  it("parses scalar frontmatter values", () => {
    const source = [
      "---",
      'title: "Hello, World!"',
      "date: 2025-12-01",
      "published: true",
      "draft: false",
      "---",
      "Body text.",
    ].join("\n");
    const [entry] = loadMarkdownEntries({ "p/a.md": source });
    expect(entry.data.title).toBe("Hello, World!");
    expect(entry.data.date).toBe("2025-12-01");
    expect(entry.data.published).toBe(true);
    expect(entry.data.draft).toBe(false);
  });

  it("keeps quoted numeric strings as strings", () => {
    const source = ["---", 'period: "2023"', "---", ""].join("\n");
    const [entry] = loadMarkdownEntries({ "p/a.md": source });
    expect(entry.data.period).toBe("2023");
  });

  it("coerces unquoted numeric strings to numbers", () => {
    const source = ["---", "order: 3", "---", ""].join("\n");
    const [entry] = loadMarkdownEntries({ "p/a.md": source });
    expect(entry.data.order).toBe(3);
  });

  it("collects list items into arrays", () => {
    const source = [
      "---",
      "tech:",
      "  - TypeScript",
      "  - React",
      "---",
      "",
    ].join("\n");
    const [entry] = loadMarkdownEntries({ "p/a.md": source });
    expect(entry.data.tech).toEqual(["TypeScript", "React"]);
  });

  it("nests indented keys under their parent", () => {
    const source = [
      "---",
      "links:",
      "  live: https://example.com",
      "---",
      "",
    ].join("\n");
    const [entry] = loadMarkdownEntries({ "p/a.md": source });
    expect(entry.data.links).toEqual({ live: "https://example.com" });
  });

  it("splits body content from frontmatter", () => {
    const source = ["---", "title: A", "---", "", "First line.", ""].join("\n");
    const [entry] = loadMarkdownEntries({ "p/a.md": source });
    expect(entry.markdown).toBe("\nFirst line.\n");
  });

  it("treats a file without frontmatter as all body", () => {
    const [entry] = loadMarkdownEntries({ "p/a.md": "Just text." });
    expect(entry.data).toEqual({});
    expect(entry.markdown).toBe("Just text.");
  });

  it("allows intentionally empty string fields", () => {
    const source = ["---", 'description: ""', "---", ""].join("\n");
    const [entry] = loadMarkdownEntries({ "p/a.md": source });
    expect(entry.data.description).toBe("");
  });
});

describe("requireFrontmatterString", () => {
  it("returns present string values", () => {
    expect(requireFrontmatterString({ title: "A" }, "title")).toBe("A");
  });

  it("throws a TypeError naming the missing field", () => {
    expect(() => requireFrontmatterString({}, "title")).toThrow(TypeError);
    expect(() => requireFrontmatterString({}, "title")).toThrow(/title/u);
  });

  it("rejects non-string values", () => {
    expect(() => requireFrontmatterString({ date: 3 }, "date")).toThrow(
      TypeError
    );
  });
});
