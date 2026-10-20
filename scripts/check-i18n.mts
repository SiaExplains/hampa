// Fails when any locale's message catalogue drifts from `en` (the canonical key set):
// missing keys, extra keys, non-string leaves, or ICU arguments that don't match.
// Runs with plain `node` (Node 22 strips types), so keep to erasable TS syntax only.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type Catalogue = { [key: string]: string | Catalogue };

const CANONICAL = "en";
const LOCALES = ["en", "fa", "de"] as const;

export function flatten(node: Catalogue, prefix = ""): Map<string, unknown> {
  const out = new Map<string, unknown>();
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object") {
      for (const [k, v] of flatten(value, path)) out.set(k, v);
    } else {
      out.set(path, value);
    }
  }
  return out;
}

// Top-level ICU argument names: `{name}`, `{count, plural, …}`. Nested `{…}` inside
// plural branches are message text, not arguments, so only depth-0 openings count.
export function icuArguments(message: string): Set<string> {
  const args = new Set<string>();
  let depth = 0;
  for (let i = 0; i < message.length; i++) {
    const ch = message[i];
    if (ch === "{") {
      if (depth === 0) {
        const match = /^\{\s*([A-Za-z_][\w]*)/.exec(message.slice(i));
        if (match) args.add(match[1]);
      }
      depth++;
    } else if (ch === "}") {
      depth = Math.max(0, depth - 1);
    }
  }
  return args;
}

export function compareCatalogues(
  canonical: Catalogue,
  other: Catalogue,
  locale: string,
): string[] {
  const problems: string[] = [];
  const base = flatten(canonical);
  const target = flatten(other);

  for (const [key, value] of base) {
    if (!target.has(key)) {
      problems.push(`${locale}: missing "${key}"`);
      continue;
    }
    const translated = target.get(key);
    if (typeof translated !== "string") {
      problems.push(`${locale}: "${key}" is not a string`);
      continue;
    }
    if (typeof value !== "string") continue;
    const expected = [...icuArguments(value)].sort().join(",");
    const actual = [...icuArguments(translated)].sort().join(",");
    if (expected !== actual) {
      problems.push(
        `${locale}: "${key}" has arguments {${actual}}, expected {${expected}}`,
      );
    }
  }
  for (const key of target.keys()) {
    if (!base.has(key)) problems.push(`${locale}: extra "${key}"`);
  }
  return problems;
}

function main(): void {
  const dir = join(
    dirname(fileURLToPath(import.meta.url)),
    "../src/i18n/messages",
  );
  const load = (locale: string): Catalogue =>
    JSON.parse(readFileSync(join(dir, `${locale}.json`), "utf8")) as Catalogue;

  const canonical = load(CANONICAL);
  const problems = LOCALES.filter((l) => l !== CANONICAL).flatMap((l) =>
    compareCatalogues(canonical, load(l), l),
  );

  if (problems.length > 0) {
    console.error(`i18n check failed (${problems.length}):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(
    `i18n check passed: ${flatten(canonical).size} keys × ${LOCALES.length} locales`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
