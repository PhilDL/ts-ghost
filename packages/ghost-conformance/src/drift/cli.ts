import { execFile, spawn } from "node:child_process";
import { appendFile, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { GHOST_VERSION_FILE, ghostVersion, unsupportedGhost } from "../ghost/pin.ts";
import { MANIFEST_FILE, parseManifest } from "../manifest/manifest.ts";
import { openDriftPr } from "./open-pr.ts";
import { planDrift, resolveNewestGhost, type GhostRelease } from "./plan.ts";
import {
  clientResources,
  diffManifests,
  renderPrBody,
  renderPrTitle,
  suiteNotRun,
  summariseSuite,
  verdictErrors,
  type VitestJsonReport,
} from "./pr-body.ts";

/**
 * Steps of the weekly drift job, run in order by .github/workflows/conformance-drift.yml:
 * plan → (pnpm manifest) → client → suite → body → open-pr → verdict. State passes between steps in DRIFT_STATE.
 */
const PACKAGE_DIR = fileURLToPath(new URL("../..", import.meta.url));
const STATE = resolve(process.env.DRIFT_STATE ?? join(PACKAGE_DIR, ".drift"));
const file = (name: string) => join(STATE, name);
type SavedPlan = { bump: boolean; from: string; to: string; releases: GhostRelease[] };

const steps: Record<string, () => Promise<number>> = {
  /** Resolves the newest Ghost; on a bump, rewrites the pin and keeps the old manifest for the diff. */
  async plan() {
    await mkdir(STATE, { recursive: true });
    const pin = ghostVersion();
    const newest = await resolveNewestGhost({
      pin,
      target: process.env.GHOST_TARGET || undefined,
      githubToken: process.env.GITHUB_TOKEN || undefined,
    });
    const plan = planDrift(pin, newest.version);
    await writeFile(file("plan.json"), JSON.stringify({ ...plan, releases: newest.releases }, null, 2));
    await output({ bump: String(plan.bump), from: plan.from, to: plan.to });
    if (!plan.bump) {
      console.log(`Newest Ghost ${plan.to} is not ahead of the pin ${pin}; nothing to do.`);
      return 0;
    }
    await copyFile(MANIFEST_FILE, file("manifest.before.json"));
    await writeFile(GHOST_VERSION_FILE, `${plan.to}\n`);
    console.log(`Pin bumped ${plan.from} → ${plan.to}; releases since the pin: ${newest.releases.length}`);
    return 0;
  },

  /** Runs the live suite against the (bumped) pin, keeping Vitest's JSON report; exits with its code. */
  async suite() {
    const unsupported = unsupportedGhost(ghostVersion());
    if (!unsupported) return vitest("suite.json", ["-c", "./vitest.config.live.ts"]);
    console.error(`::error::${unsupported} Not running the live suite.`);
    return 1;
  },

  /** Runs the Docker-free unit tests, incl. the client → manifest check, against the new manifest. */
  client: () => vitest("client.json", ["--typecheck"]),

  /** Renders the PR title and body; also shows the body as the run's job summary. */
  async body() {
    const plan = JSON.parse(await readFile(file("plan.json"), "utf8")) as SavedPlan;
    const before = parseManifest(await readFile(file("manifest.before.json"), "utf8"));
    const after = parseManifest(await readFile(MANIFEST_FILE, "utf8"));
    const suite = await liveSuite(plan);
    const clientReport = await readReport("client.json");
    const client = summariseSuite(clientReport);
    const { GITHUB_SERVER_URL: server, GITHUB_REPOSITORY: repo, GITHUB_RUN_ID: runId } = process.env;
    const runUrl = server && repo && runId ? `${server}/${repo}/actions/runs/${runId}` : undefined;
    const body = renderPrBody({
      plan,
      releases: plan.releases,
      diff: diffManifests(before, after),
      suite,
      client,
      resources: clientResources(clientReport),
      runUrl,
    });
    await writeFile(file("pr-title.txt"), renderPrTitle(plan, suite, client));
    await writeFile(file("pr-body.md"), body);
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, body);
    console.log(`Wrote ${file("pr-body.md")}`);
    return 0;
  },

  /** Commits the pin and manifest to a drift branch and opens or updates its PR. */
  async "open-pr"() {
    const plan = JSON.parse(await readFile(file("plan.json"), "utf8")) as SavedPlan;
    const run = promisify(execFile);
    const url = await openDriftPr(
      {
        branch: `conformance/ghost-${plan.to}`,
        base: process.env.DRIFT_BASE || "main",
        title: (await readFile(file("pr-title.txt"), "utf8")).trim(),
        bodyFile: file("pr-body.md"),
        files: [GHOST_VERSION_FILE, MANIFEST_FILE],
      },
      async (cmd, args) => (await run(cmd, args, { cwd: PACKAGE_DIR })).stdout,
    );
    console.log(`Drift PR: ${url}`);
    return 0;
  },

  /** Fails the job when the live suite or client check failed or never reported, after the PR shows it. */
  async verdict() {
    const plan = JSON.parse(await readFile(file("plan.json"), "utf8")) as SavedPlan;
    const errors = verdictErrors({
      "live suite": await liveSuite(plan),
      "client check": summariseSuite(await readReport("client.json")),
    });
    for (const error of errors) console.error(`::error::${error}`);
    return errors.length ? 1 : 0;
  },
};

/** The live suite's result, or why it didn't run against `plan.to`. */
async function liveSuite(plan: SavedPlan) {
  const unsupported = unsupportedGhost(plan.to);
  return unsupported ? suiteNotRun(unsupported) : summariseSuite(await readReport("suite.json"));
}

/** Runs Vitest in the package with `args`, keeping its JSON report as `report`; resolves to its exit code. */
async function vitest(report: string, args: string[]): Promise<number> {
  await rm(file(report), { force: true });
  return new Promise((done) => {
    const child = spawn(
      "pnpm",
      [
        ...["exec", "vitest", "run", ...args],
        ...["--reporter=default", "--reporter=json", `--outputFile.json=${file(report)}`],
      ],
      { cwd: PACKAGE_DIR, stdio: "inherit" },
    );
    child.on("close", (code) => done(code ?? 1));
  });
}

async function readReport(name: string): Promise<VitestJsonReport | undefined> {
  const text = await readFile(file(name), "utf8").catch(() => undefined);
  return text ? (JSON.parse(text) as VitestJsonReport) : undefined;
}

/** Appends step outputs for the workflow; a no-op outside GitHub Actions. */
async function output(values: Record<string, string>) {
  if (!process.env.GITHUB_OUTPUT) return;
  const lines = Object.entries(values).map(([k, v]) => `${k}=${v}\n`);
  await appendFile(process.env.GITHUB_OUTPUT, lines.join(""));
}

const name = process.argv[2] ?? "";
const step = steps[name];
if (!step) {
  console.error(`Usage: drift <${Object.keys(steps).join("|")}>`);
  process.exitCode = 2;
} else {
  step().then(
    (code) => (process.exitCode = code),
    (error: unknown) => {
      console.error(error instanceof Error ? `::error::${error.message}` : error);
      process.exitCode = 1;
    },
  );
}
