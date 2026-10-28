import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import { MANIFEST_FILE, parseManifest } from "../manifest/manifest.ts";
import { recordClientCalls } from "./client-calls.ts";
import { checkCall } from "./route-check.ts";

const manifest = parseManifest(readFileSync(MANIFEST_FILE, "utf8"));
const calls = await recordClientCalls();

/** Client calls known to fail against the pinned Ghost, with why. */
const EXPECTED_FAILURES: Record<string, string> = {
  "newsletters.read({slug})": "Ghost has no read-newsletter-by-slug route",
  "offers.read({slug})": "Ghost has no read-offer-by-slug route",
  "tiers.read({slug})": "Ghost has no read-tier-by-slug route",
};

describe(`admin-api client against the Ghost ${manifest.ghost} manifest`, () => {
  for (const call of calls) {
    const reason = EXPECTED_FAILURES[call.name];
    const title = `${call.name}: ${call.method} ${call.path}${reason ? ` (expected failure: ${reason})` : ""}`;
    (reason ? test.fails : test)(title, () => {
      expect(checkCall(manifest.routes, call)).toBeUndefined();
    });
  }
});
