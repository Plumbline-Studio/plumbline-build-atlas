// Validates the delivery volume's edges before every build.
//
// The puzzle map is drawn from `needs` / `feeds` / `instead`, so a typo in one
// of those names does not fail loudly — it silently drops a line from the
// picture, and a diagram that quietly loses an edge is worse than no diagram.
// This turns that class of mistake into a build failure.
//
// It also guards the one deliberate duplication in the atlas: Docker and
// Kubernetes appear in both the infrastructure and delivery volumes, answering
// different questions. That is fine while both entries stay true; it stops
// being fine the moment they drift, so we check they still exist on both sides.

import { readFileSync } from "node:fs";

const DELIVERY = new URL("../lib/stack-atlas-delivery.ts", import.meta.url);
const INFRA = new URL("../lib/stack-atlas-reference.ts", import.meta.url);

const src = readFileSync(DELIVERY, "utf8");

/** Entry names, in file order. */
const names = [...src.matchAll(/^\s*name: "((?:[^"\\]|\\.)*)", group:/gm)].map((m) => m[1]);
if (names.length === 0) {
  console.error("check-delivery-edges: found no entries — has the file shape changed?");
  process.exit(1);
}

const known = new Set(names);
const errors = [];

const dupes = names.filter((n, i) => names.indexOf(n) !== i);
for (const d of new Set(dupes)) errors.push(`duplicate entry name: "${d}"`);

// Each entry's three edge arrays. Sliced per entry rather than matched with
// one spanning regex: a regex that can run past an entry boundary reports
// neighbours' edges as the current entry's, which is a confusing way to fail.
const starts = [...src.matchAll(/^\s*name: "(?:[^"\\]|\\.)*", group:/gm)].map((m) => m.index);
for (let i = 0; i < starts.length; i++) {
  const block = src.slice(starts[i], i + 1 < starts.length ? starts[i + 1] : src.length);
  const owner = names[i];
  for (const field of ["needs", "feeds", "instead"]) {
    const m = block.match(new RegExp(`\\b${field}:\\s*\\[([^\\]]*)\\]`));
    if (!m) {
      errors.push(`"${owner}" is missing its ${field} array`);
      continue;
    }
    for (const ref of [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1])) {
      if (!known.has(ref)) errors.push(`"${owner}" ${field} references unknown entry "${ref}"`);
      if (ref === owner) errors.push(`"${owner}" ${field} references itself`);
    }
  }
}

// The deliberate duplication: both sides must still carry the entry.
const infra = readFileSync(INFRA, "utf8");
for (const shared of ["Docker", "Kubernetes"]) {
  const inDelivery = known.has(shared);
  const inInfra = new RegExp(`name: "${shared}", group: "[^"]*", standing:`).test(infra);
  if (inDelivery && !inInfra) {
    errors.push(
      `"${shared}" is in the delivery volume but no longer in infrastructure — ` +
        `the duplication is intentional; removing one side needs a deliberate decision, not a silent drop`,
    );
  }
  if (!inDelivery && inInfra) {
    errors.push(`"${shared}" is in infrastructure but missing from the delivery volume`);
  }
}

if (errors.length) {
  console.error(`check-delivery-edges: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

let edgeCount = 0;
for (let i = 0; i < starts.length; i++) {
  const block = src.slice(starts[i], i + 1 < starts.length ? starts[i + 1] : src.length);
  for (const field of ["needs", "feeds", "instead"]) {
    const m = block.match(new RegExp(`\\b${field}:\\s*\\[([^\\]]*)\\]`));
    if (m) edgeCount += [...m[1].matchAll(/"/g)].length / 2;
  }
}

console.log(`check-delivery-edges: ${names.length} entries, ${Math.round(edgeCount)} edges, all resolve`);
