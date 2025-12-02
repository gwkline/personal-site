import { marked } from "marked";

export type FrontmatterResult = {
	data: Record<string, unknown>;
	content: string;
};

const INDENT_REGEX = /^\s*/;
const KEY_VALUE_REGEX = /^([A-Za-z0-9_]+):\s*(.*)$/;

export function parseMarkdownFile(source: string): {
	data: Record<string, unknown>;
	html: string;
} {
	const { data, content } = parseFrontmatter(source);
	const html = marked(content, { async: false });
	return { data, html };
}

function stripQuotes(value: string): string {
	if (value.length >= 2) {
		const first = value[0];
		const last = value.at(-1) ?? "";
		if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
			return value.slice(1, -1);
		}
	}
	return value;
}

function coerceScalar(value: string): string | number | boolean {
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
}

function extractFrontmatterLines(lines: string[]): {
	frontmatterLines: string[];
	endIndex: number;
} {
	const frontmatterLines: string[] = [];
	let i = 1;
	for (; i < lines.length; i++) {
		if (lines[i].trim() === "---") {
			break;
		}
		frontmatterLines.push(lines[i]);
	}
	return { frontmatterLines, endIndex: i };
}

function handleListItem(
	line: string,
	data: Record<string, unknown>,
	parentKey: string
): void {
	const item = stripQuotes(line.slice(2).trim());
	const existing = data[parentKey];
	if (Array.isArray(existing)) {
		existing.push(coerceScalar(item));
	} else {
		data[parentKey] = [coerceScalar(item)];
	}
}

function handleTopLevelKey(
	key: string,
	rest: string,
	data: Record<string, unknown>
): void {
	if (rest) {
		data[key] = coerceScalar(stripQuotes(rest));
	} else if (data[key] === undefined) {
		data[key] = {};
	}
}

function handleNestedKey(
	key: string,
	rest: string,
	data: Record<string, unknown>,
	parentKey: string
): void {
	const parent = (data[parentKey] ?? {}) as Record<string, unknown>;
	parent[key] = coerceScalar(stripQuotes(rest));
	data[parentKey] = parent;
}

function processLine(
	rawLine: string,
	data: Record<string, unknown>,
	currentParentKey: string | null
): string | null {
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

	const [, key, rest] = kvMatch;

	if (indent === 0) {
		handleTopLevelKey(key, rest, data);
		return key;
	}

	if (currentParentKey) {
		handleNestedKey(key, rest, data, currentParentKey);
	}

	return currentParentKey;
}

function parseFrontmatter(source: string): FrontmatterResult {
	const lines = source.split("\n");
	if (lines.length === 0 || lines[0].trim() !== "---") {
		return { data: {}, content: source };
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
	return { data, content };
}
