import type { ClientCall } from "../client-routes/route-check.ts";
import type { VitestJsonReport } from "../drift/pr-body.ts";
import type { Manifest, ManifestRoute } from "../manifest/manifest.ts";

export type Tally = { covered: number; total: number };
export type ResourceCoverage = { resource: string; integration: Tally; all: Tally };
/** How many of a Ghost's non-labs routes the client calls; `uncovered` lists the integration-token ones it doesn't. */
export type Coverage = {
  ghost: string;
  integration: Tally;
  all: Tally;
  resources: ResourceCoverage[];
  uncovered: ManifestRoute[];
};

type Call = Pick<ClientCall, "method" | "path">;

const erase = (path: string) => path.replace(/:[^/]+/g, ":");
const resourceOf = (route: ManifestRoute) => route.path.split("/")[1] ?? "";

function tally(routes: ManifestRoute[], isCovered: (r: ManifestRoute) => boolean): Tally {
  return { covered: routes.filter(isCovered).length, total: routes.length };
}

export function measureCoverage(manifest: Manifest, calls: Call[]): Coverage {
  const called = new Set(calls.map((c) => `${c.method} ${c.path}`));
  const isCovered = (r: ManifestRoute) => called.has(`${r.method} ${erase(r.path)}`);
  const routes = manifest.routes.filter((r) => !r.labs);
  const integration = routes.filter((r) => r.integration);
  const names = [...new Set(routes.map(resourceOf))].sort();
  return {
    ghost: manifest.ghost,
    integration: tally(integration, isCovered),
    all: tally(routes, isCovered),
    resources: names.map((resource) => {
      const own = routes.filter((r) => resourceOf(r) === resource);
      return {
        resource,
        integration: tally(
          own.filter((r) => r.integration),
          isCovered,
        ),
        all: tally(own, isCovered),
      };
    }),
    uncovered: integration.filter((r) => !isCovered(r)),
  };
}

/** The calls the client → manifest check recorded in its tests' meta. */
export function clientCalls(report: VitestJsonReport | undefined): Call[] {
  const tests = report?.testResults.flatMap((file) => file.assertionResults) ?? [];
  return tests.flatMap((t) => (t.meta?.clientCall ? [t.meta.clientCall] : []));
}

const fraction = (t: Tally) => (t.total ? `${t.covered} / ${t.total}` : "–");
const percent = (t: Tally) =>
  t.total ? `${fraction(t)} (${Math.round((100 * t.covered) / t.total)}%)` : "–";

/** Markdown: both numbers per Ghost (e.g. pin and newest), then resources and gaps of the last one. */
export function renderCoverage(coverages: Coverage[]): string {
  const last = coverages.at(-1);
  if (!last) throw new Error("renderCoverage needs at least one Ghost");
  const row = (cells: string[]) => `| ${cells.join(" | ")} |`;
  const head = coverages.length > 1 ? coverages.map((c) => `Ghost ${c.ghost}`) : ["Covered"];
  const versions = coverages.length > 1 ? "" : ` of Ghost ${last.ghost}`;
  return [
    `Admin API routes${versions} the client calls; labs-flagged routes are left out.`,
    "",
    row(["Routes", ...head]),
    row(["---", ...head.map(() => "---")]),
    row(["Integration-token routes", ...coverages.map((c) => percent(c.integration))]),
    row(["All routes", ...coverages.map((c) => percent(c.all))]),
    "",
    "<details><summary>By resource" + (coverages.length > 1 ? ` (Ghost ${last.ghost})` : "") + "</summary>",
    "",
    row(["Resource", "Integration-token routes", "All routes"]),
    row(["---", "---", "---"]),
    ...last.resources.map((r) => row([`\`${r.resource}\``, fraction(r.integration), fraction(r.all)])),
    "",
    "</details>",
    "",
    `<details><summary>Integration-token routes the client doesn't call (${last.uncovered.length})</summary>`,
    "",
    ...last.uncovered.map((r) => `- \`${r.method} ${r.path}\``),
    "",
    "</details>",
    "",
  ].join("\n");
}
