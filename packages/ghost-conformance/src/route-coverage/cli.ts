import { appendFile, readFile } from "node:fs/promises";

import type { VitestJsonReport } from "../drift/pr-body.ts";
import { MANIFEST_FILE, parseManifest } from "../manifest/manifest.ts";
import { clientCalls, measureCoverage, renderCoverage } from "./coverage.ts";

/** Prints the pinned manifest's coverage from a client check JSON report and adds it to the job summary. */
const reportFile = process.argv[2];
if (!reportFile) {
  console.error("Usage: coverage <client-check-report.json>");
  process.exit(2);
}
const report = JSON.parse(await readFile(reportFile, "utf8")) as VitestJsonReport;
const manifest = parseManifest(await readFile(MANIFEST_FILE, "utf8"));
const coverage = renderCoverage([measureCoverage(manifest, clientCalls(report))]);
const markdown = `## Client coverage of the Admin API\n\n${coverage}`;
console.log(markdown);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
