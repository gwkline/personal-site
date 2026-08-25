export interface FrontmatterResult {
  data: Record<string, unknown>;
  content: string;
}
const INDENT_REGEX = /^\s*/u;
const KEY_VALUE_REGEX = /^(?<key>[A-Za-z0-9_]+):\s*(?<rest>.*)$/u;
const extractFrontmatterLines = (
  lines: string[]
): {
  frontmatterLines: string[];
  endIndex: number;
} => {
  const frontmatterLines: string[] = [];
  let i = 1;
  for (; i < lines.length; i += 1) {
    if (lines[i].trim() === "---") {
      break;
    }
    frontmatterLines.push(lines[i]);
  }
  return { endIndex: i, frontmatterLines };
};
const coerceScalar = (value: string): string | number | boolean => {
  const trimmed = value.trim();
  if (trimmed === "true") {
    return true;
  }
  if (trimmed === "false") {
    return false;
  }
  const num = Number(trimmed);
  if (!Number.isNaN(num) && trimmed !== "") {
    return num;
  }
  return trimmed;
};

/** A quoted value is always a string, even when its content looks numeric. */
const parseScalarValue = (raw: string): string | number | boolean => {
  const trimmed = raw.trim();
  const first = trimmed.at(0);
  const last = trimmed.at(-1);
  if (
    trimmed.length >= 2 &&
    ((first === '"' && last === '"') || (first === "'" && last === "'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return coerceScalar(trimmed);
};
const handleListItem = (
  line: string,
  data: Record<string, unknown>,
  parentKey: string
): void => {
  const item = parseScalarValue(line.slice(2));
  const existing = data[parentKey];
  if (Array.isArray(existing)) {
    existing.push(item);
  } else {
    data[parentKey] = [item];
  }
};
const handleTopLevelKey = (
  key: string,
  rest: string,
  data: Record<string, unknown>
): void => {
  if (rest) {
    data[key] = parseScalarValue(rest);
  } else if (data[key] === undefined) {
    data[key] = {};
  }
};
const handleNestedKey = (
  key: string,
  rest: string,
  data: Record<string, unknown>,
  parentKey: string
): void => {
  const parent = (data[parentKey] ?? {}) as Record<string, unknown>;
  parent[key] = parseScalarValue(rest);
  data[parentKey] = parent;
};
const processLine = (
  rawLine: string,
  data: Record<string, unknown>,
  currentParentKey: string | null
): string | null => {
  const indentMatch = rawLine.match(INDENT_REGEX);
  const indent = indentMatch ? indentMatch[0].length : 0;
  const line = rawLine.trim();
  if (line.startsWith("- ") && currentParentKey) {
    handleListItem(line, data, currentParentKey);
    return currentParentKey;
  }
  const kvMatch = KEY_VALUE_REGEX.exec(line);
  if (!kvMatch) {
    return currentParentKey;
  }
  const key = kvMatch.groups?.key ?? "";
  const rest = kvMatch.groups?.rest ?? "";
  if (indent === 0) {
    handleTopLevelKey(key, rest, data);
    return key;
  }
  if (currentParentKey) {
    handleNestedKey(key, rest, data, currentParentKey);
  }
  return currentParentKey;
};
const parseFrontmatter = (source: string): FrontmatterResult => {
  const lines = source.split("\n");
  if (lines.length === 0 || lines[0].trim() !== "---") {
    return { content: source, data: {} };
  }
  const { frontmatterLines, endIndex } = extractFrontmatterLines(lines);
  const data: Record<string, unknown> = {};
  let currentParentKey: string | null = null;
  for (const rawLine of frontmatterLines) {
    if (rawLine.trim()) {
      currentParentKey = processLine(rawLine, data, currentParentKey);
    }
  }
  const content = lines.slice(endIndex + 1).join("\n");
  return { content, data };
};

const MD_EXTENSION_REGEX = /\.md$/u;
const SLUG_REGEX = /\/(?<slug>[^/]+)\.md$/u;

export interface MarkdownEntry {
  data: Record<string, unknown>;
  markdown: string;
  slug: string;
}

export const loadMarkdownEntries = (
  files: Record<string, string>
): MarkdownEntry[] =>
  Object.entries(files).map(([filePath, fileContents]) => {
    const match = SLUG_REGEX.exec(filePath);
    const slug =
      match?.groups?.slug ?? filePath.replace(MD_EXTENSION_REGEX, "");
    const { data, content } = parseFrontmatter(fileContents);
    return { data, markdown: content, slug };
  });

export const requireFrontmatterString = (
  data: Record<string, unknown>,
  key: string
): string => {
  const value = data[key];
  if (typeof value !== "string") {
    throw new TypeError(
      `Frontmatter field "${key}" is missing (found keys: ${Object.keys(data).join(", ") || "none"})`
    );
  }
  return value;
};
