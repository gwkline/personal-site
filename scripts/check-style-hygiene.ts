#!/usr/bin/env bun
/**
 * Fails when Tailwind arbitrary colors or font sizes appear in source.
 * These are the two shapes the design-system migration eliminated;
 * the gate keeps them from creeping back.
 */
const ROOT = `${import.meta.dir}/../src`;
const glob = new Bun.Glob("**/*.{ts,tsx}");

const HEX_IN_CLASS = /\[[#][0-9a-fA-F]{3,8}\]/gu;
const ARBITRARY_TEXT_SIZE = /text-\[(?:\d+(?:\.\d+)?(?:px|rem)|0\.\d+)\]/gu;

interface Hit {
  file: string;
  kind: string;
  line: number;
  text: string;
}

const hits: Hit[] = [];

for await (const rel of glob.scan({ cwd: ROOT, onlyFiles: true })) {
  const path = `${ROOT}/${rel}`;
  const content = await Bun.file(path).text();
  const lines = content.split("\n");
  for (const [i, line] of lines.entries()) {
    for (const [kind, re] of [
      ["hex-color", HEX_IN_CLASS],
      ["arbitrary-text-size", ARBITRARY_TEXT_SIZE],
    ] as const) {
      re.lastIndex = 0;
      const m = re.exec(line);
      if (m) {
        hits.push({
          file: `src/${rel}`,
          kind,
          line: i + 1,
          text: m[0],
        });
      }
    }
  }
}

if (process.argv.includes("--count-only")) {
  console.log(hits.length);
} else if (hits.length > 0) {
  for (const h of hits) {
    console.log(`${h.file}:${h.line}: ${h.kind} ${h.text}`);
  }
  console.error(
    `\n${hits.length} arbitrary style value(s) found. Use design tokens or ui components instead.`
  );
  process.exit(1);
} else {
  console.log("style hygiene: clean");
}
