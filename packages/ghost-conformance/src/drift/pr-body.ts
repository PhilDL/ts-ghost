import type { Manifest, ManifestRoute } from "../manifest/manifest.ts";
import { renderCoverage, type Coverage } from "../route-coverage/coverage.ts";
import type { DriftPlan, GhostRelease } from "./plan.ts";

export type ManifestDiff = {
  added: ManifestRoute[];
  removed: ManifestRoute[];
  changed: { before: ManifestRoute; after: ManifestRoute }[];
};

export type SuiteSummary = {
  ok: boolean;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  /** `test.fails` tests that failed as expected; Vitest reports them as passed. */
  expectedFailures: number;
  failures: string[];
  /** The suite produced no report, e.g. Ghost never became healthy. */
  crashed?: true;
  /** Why the suite was not run at all. */
  notRun?: string;
};

/** The subset of Vitest's JSON reporter output the summary reads. */
export type VitestJsonReport = {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  numTodoTests: number;
  testResults: {
    assertionResults: {
      fullName: string;
      status: string;
      meta?: {
        expectedFailure?: boolean;
        clientResource?: string;
        clientCall?: { method: string; path: string };
      };
    }[];
  }[];
};

const ACCESS = ["public", "integration", "staff", "session"] as const;
/** The one branch the drift PR comes from; every run force-pushes it. */
export const DRIFT_BRANCH = "conformance/drift";
const key = (r: ManifestRoute) => `${r.method} ${r.path}`;

export function diffManifests(before: Manifest, after: Manifest): ManifestDiff {
  const old = new Map(before.routes.map((r) => [key(r), r]));
  const now = new Map(after.routes.map((r) => [key(r), r]));
  return {
    added: after.routes.filter((r) => !old.has(key(r))),
    removed: before.routes.filter((r) => !now.has(key(r))),
    changed: after.routes.flatMap((r) => {
      const prev = old.get(key(r));
      return prev && JSON.stringify(prev) !== JSON.stringify(r) ? [{ before: prev, after: r }] : [];
    }),
  };
}

export function summariseSuite(report: VitestJsonReport | undefined): SuiteSummary {
  if (!report)
    return {
      ok: false,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      expectedFailures: 0,
      failures: [],
      crashed: true,
    };
  const tests = report.testResults.flatMap((file) => file.assertionResults);
  const expectedFailures = tests.filter((t) => t.status === "passed" && t.meta?.expectedFailure).length;
  const failures = tests.filter((t) => t.status === "failed").map((t) => t.fullName);
  return {
    ok: report.numFailedTests === 0 && report.numTotalTests > 0,
    total: report.numTotalTests,
    passed: report.numPassedTests - expectedFailures,
    failed: report.numFailedTests,
    skipped: report.numPendingTests + report.numTodoTests,
    expectedFailures,
    failures,
  };
}

/** A suite that was deliberately not run, e.g. because the client doesn't support the Ghost. */
export function suiteNotRun(reason: string): SuiteSummary {
  return { ...summariseSuite(undefined), crashed: undefined, notRun: reason };
}

/** Resources the client check called, from the client → manifest check's report. */
export function clientResources(report: VitestJsonReport | undefined): string[] {
  const tests = report?.testResults.flatMap((file) => file.assertionResults) ?? [];
  return [...new Set(tests.flatMap((t) => t.meta?.clientResource ?? []))].sort();
}

/** One error per suite that failed, crashed or didn't run; empty when the job should pass. */
export function verdictErrors(suites: Record<string, SuiteSummary>): string[] {
  return Object.entries(suites).flatMap(([name, result]) => {
    if (result.ok) return [];
    if (result.notRun) return [`The ${name} did not run: ${result.notRun}`];
    if (result.crashed) return [`The ${name} crashed before reporting; see its step's log.`];
    return [`The ${name} failed ${result.failed} of ${result.total} tests:\n${result.failures.join("\n")}`];
  });
}

export function renderPrTitle(
  plan: Pick<DriftPlan, "from" | "to">,
  suite: SuiteSummary,
  client: SuiteSummary,
  manifestFailed = false,
): string {
  const title = `chore(conformance): bump Ghost pin ${plan.from} → ${plan.to}`;
  if (manifestFailed) return `${title} (manifest generation failing)`;
  if (suite.notRun) return `${title} (not supported by the client yet)`;
  const failing = [...(suite.ok ? [] : ["live suite"]), ...(client.ok ? [] : ["client check"])];
  return failing.length ? `${title} (${failing.join(" and ")} failing)` : title;
}

export function renderPrBody(input: {
  plan: Pick<DriftPlan, "from" | "to">;
  releases: GhostRelease[];
  diff: ManifestDiff;
  suite: SuiteSummary;
  /** The Docker-free unit tests, incl. the client → manifest check, against the new manifest. */
  client: SuiteSummary;
  /** Client resources, so the reviewer knows which release notes matter. */
  resources: string[];
  /** Route coverage at the pin, then at the new Ghost (left out when its manifest failed). */
  coverage: Coverage[];
  /** Regenerating the manifest failed, so `diff` and the client check saw the old manifest. */
  manifestFailed?: boolean;
  runUrl?: string;
}): string {
  const { plan, releases, diff, suite, client, resources, coverage, manifestFailed, runUrl } = input;
  const run = runUrl ? ` ([run](${runUrl}))` : "";
  const covered = resources.length ? resources.map((r) => `\`${r}\``).join(", ") : "none found";
  return [
    ...(manifestFailed
      ? [
          `> ❌ **Manifest generation failed against Ghost ${plan.to}**${run}. Do not merge until it is fixed.`,
          "",
        ]
      : []),
    ...(suite.notRun
      ? [`> ❌ **${suite.notRun}** The live suite did not run. Do not merge.`, ""]
      : suite.ok
        ? []
        : [`> ❌ **The live suite fails against Ghost ${plan.to}.** Do not merge until it is green.`, ""]),
    ...(client.ok
      ? []
      : [
          `> ❌ **The client → manifest check fails against the new manifest.** Do not merge until it is green.`,
          "",
        ]),
    `Weekly drift check: bumps the pinned Ghost from \`${plan.from}\` → \`${plan.to}\` and regenerates \`manifest.json\`.`,
    "",
    ...HOW_IT_WORKS,
    "",
    "## Live suite",
    "",
    ...renderSuite("live suite", suite, run),
    "",
    "## Client → manifest check",
    "",
    ...renderSuite("client check", client, run),
    "",
    "## Manifest diff",
    "",
    ...(manifestFailed
      ? [`❌ The manifest was not regenerated; see the manifest step's log${run}.`]
      : renderDiff(diff)),
    "",
    "## Client coverage",
    "",
    renderCoverage(coverage),
    "## Ghost release notes",
    "",
    "The suite can't see changes to query options (includes, filters, order, formats) or to behaviour the",
    "client doesn't exercise. Read these notes for the resources the client covers:",
    "",
    `Client resources: ${covered}.`,
    "",
    ...(releases.length
      ? releases.map((r) => `- [${r.version}](${r.url})`)
      : [`- [All releases](https://github.com/TryGhost/Ghost/releases)`]),
    "",
  ].join("\n");
}

const HOW_IT_WORKS = [
  `There is one drift PR, from \`${DRIFT_BRANCH}\`. Every weekly run force-pushes it and rewrites this description, always from the default branch's pin to the newest Ghost. Merging it bumps the pin.`,
  "",
  "- If nothing is fixed, it stays open and accumulates the releases that come out meanwhile.",
  "- To bump the pin without fixing everything, mark what fails before merging: `test.fails` (or `EXPECTED_FAILURES` in the client check) and pending keys, each with a one-line reason.",
  "- The next run overwrites commits pushed here: merge soon after pushing, or fix on another branch.",
  "- A PR opened with the workflow's default `GITHUB_TOKEN` starts no other workflows: close and reopen it to run CI. A `CONFORMANCE_PR_TOKEN` secret (GitHub App or fine-grained token) avoids that.",
];

function renderSuite(name: string, suite: SuiteSummary, run: string): string[] {
  if (suite.notRun) return [`❌ Not run: ${suite.notRun}`];
  if (suite.crashed) return [`❌ The ${name} crashed before reporting any test${run}.`];
  const counts = [
    `${suite.passed} passed, ${suite.expectedFailures} expected failures, ${suite.failed} failed`,
    ...(suite.skipped ? [`, ${suite.skipped} skipped`] : []),
    ` of ${suite.total}`,
  ].join("");
  if (suite.ok) return [`✅ Passed: ${counts}${run}.`];
  return [
    `❌ Failed: ${counts}${run}.`,
    ...(suite.failures.length ? ["", "Failing tests:", "", ...suite.failures.map((f) => `- ${f}`)] : []),
  ];
}

function renderDiff(diff: ManifestDiff): string[] {
  const lines = [
    ...diff.added.map((r) => `+ ${key(r)}  ${describeRoute(r)}`),
    ...diff.removed.map((r) => `- ${key(r)}`),
    ...diff.changed.map(({ before, after }) => `~ ${key(after)}  ${describeChange(before, after)}`),
  ];
  if (!lines.length) return ["No route changes: same routes, labs flags and auth."];
  const counts = `${diff.added.length} added, ${diff.removed.length} removed, ${diff.changed.length} changed`;
  return [counts, "", "```diff", ...lines, "```"];
}

function describeRoute(r: ManifestRoute): string {
  const accepts = ACCESS.filter((a) => r[a]);
  return [`accepts: ${accepts.join(", ") || "none"}`, ...(r.labs ? [`labs: ${r.labs}`] : [])].join("; ");
}

function describeChange(before: ManifestRoute, after: ManifestRoute): string {
  const word = (v: boolean) => (v ? "accepted" : "refused");
  return [
    ...ACCESS.filter((a) => before[a] !== after[a]).map(
      (a) => `${a}: ${word(before[a])} → ${word(after[a])}`,
    ),
    ...(before.labs !== after.labs ? [`labs: ${before.labs ?? "none"} → ${after.labs ?? "none"}`] : []),
  ].join("; ");
}
