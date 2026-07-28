// Populates the MARKS constant in lib/stack-atlas-marks.ts from the
// simple-icons package. Runs automatically before every build (see
// package.json prebuild), so deploys always ship real brand logos while the
// repo carries only the small name→slug map.
//
// Icons are inlined rather than fetched at runtime so the site makes no
// third-party request to render a logo. Marks with very large path data are
// skipped — a lettermark is cheaper than 5 KB of bezier for one 20px chip.

import { readFileSync, writeFileSync } from "node:fs";
import * as si from "simple-icons";

const FILE = new URL("../lib/stack-atlas-marks.ts", import.meta.url);
const MAX_PATH = 4500;

const source = readFileSync(FILE, "utf8");

const mapMatch = source.match(/export const MARK_FOR: Record<string, string> = (\{[\s\S]*?\});/);
if (!mapMatch) throw new Error("MARK_FOR not found in lib/stack-atlas-marks.ts");
const markFor = JSON.parse(mapMatch[1]);

const toKey = (slug) =>
  "si" + slug.charAt(0).toUpperCase() + slug.slice(1).replace(/[^a-zA-Z0-9]/g, "");

const marks = {};
const missing = [];
const skipped = [];

for (const slug of new Set(Object.values(markFor))) {
  const icon = si[toKey(slug)];
  if (!icon) {
    missing.push(slug);
    continue;
  }
  if (icon.path.length > MAX_PATH) {
    skipped.push(`${slug} (${icon.path.length} chars)`);
    continue;
  }
  marks[slug] = { path: icon.path, hex: icon.hex, title: icon.title };
}

const body =
  "export const MARKS: Record<string, BrandMark> = " +
  JSON.stringify(Object.fromEntries(Object.entries(marks).sort()), null, 2) +
  ";";

writeFileSync(
  FILE,
  source.replace(
    /\/\* MARKS:START[\s\S]*?\/\* MARKS:END \*\//,
    "/* MARKS:START — generated, do not edit by hand */\n" + body + "\n/* MARKS:END */",
  ),
);

console.log(`wrote ${Object.keys(marks).length} marks`);
if (skipped.length) console.log(`skipped (too large): ${skipped.join(", ")}`);
if (missing.length) console.log(`no icon in simple-icons: ${missing.join(", ")}`);
