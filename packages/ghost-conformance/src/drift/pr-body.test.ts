import { describe, expect, test } from "vitest";

import type { Manifest, ManifestRoute } from "../manifest/manifest.ts";
import { measureCoverage } from "../route-coverage/coverage.ts";
import {
  clientResources,
  diffManifests,
  renderPrBody,
  renderPrTitle,
  suiteNotRun,
  summariseSuite,
  verdictErrors,
} from "./pr-body.ts";

const route = (method: string, path: string, over: Partial<ManifestRoute> = {}): ManifestRoute => ({
  method,
  path,
  labs: null,
  public: false,
  integration: true,
  staff: true,
  session: true,
  ...over,
});

const before: Manifest = {
  ghost: "6.72.0",
  routes: [route("GET", "/posts/"), route("PUT", "/settings/"), route("GET", "/old/")],
};
const after: Manifest = {
  ghost: "6.73.0",
  routes: [
    route("GET", "/posts/"),
    route("PUT", "/settings/", { integration: false }),
    route("POST", "/new/", { labs: "newFlag" }),
  ],
};

/** Shape of Vitest's JSON reporter output, trimmed to what the summary reads. */
type Result = {
  fullName: string;
  status: string;
  meta?: { expectedFailure?: boolean; clientResource?: string };
};
const report = (results: Result[]) => ({
  numTotalTests: results.length,
  numPassedTests: results.filter((r) => r.status === "passed").length,
  numFailedTests: results.filter((r) => r.status === "failed").length,
  numPendingTests: results.filter((r) => r.status === "skipped" || r.status === "pending").length,
  numTodoTests: 0,
  testResults: [{ name: "/x/posts.live.test.ts", assertionResults: results }],
});

const releases = [
  { version: "6.72.1", url: "https://github.com/TryGhost/Ghost/releases/tag/v6.72.1" },
  { version: "6.73.0", url: "https://github.com/TryGhost/Ghost/releases/tag/v6.73.0" },
];

describe("diffManifests", () => {
  test("lists routes Ghost added, removed and re-permissioned, keyed by method and path", () => {
    expect(diffManifests(before, after)).toEqual({
      added: [route("POST", "/new/", { labs: "newFlag" })],
      removed: [route("GET", "/old/")],
      changed: [
        { before: route("PUT", "/settings/"), after: route("PUT", "/settings/", { integration: false }) },
      ],
    });
  });

  test("is empty for identical manifests of different versions", () => {
    expect(diffManifests(before, { ...before, ghost: "6.73.0" })).toEqual({
      added: [],
      removed: [],
      changed: [],
    });
  });
});

describe("summariseSuite", () => {
  test("counts outcomes and names the failing tests", () => {
    const suite = summariseSuite(
      report([
        { fullName: "posts > reads back", status: "passed" },
        { fullName: "posts > edits persist", status: "failed" },
        { fullName: "posts > later", status: "skipped" },
      ]),
    );
    expect(suite).toEqual({
      ok: false,
      total: 3,
      passed: 1,
      failed: 1,
      skipped: 1,
      expectedFailures: 0,
      failures: ["posts > edits persist"],
    });
  });

  test("counts test.fails tests that failed as expected apart from the passed ones", () => {
    const suite = summariseSuite(
      report([
        { fullName: "posts > reads back", status: "passed" },
        { fullName: "posts > pending route", status: "passed", meta: { expectedFailure: true } },
      ]),
    );
    expect(suite).toMatchObject({ ok: true, total: 2, passed: 1, expectedFailures: 1, failed: 0 });
  });

  test("a missing report means the suite never ran its tests, which is a failure", () => {
    expect(summariseSuite(undefined)).toMatchObject({ ok: false, total: 0, crashed: true });
  });

  test("a run with zero tests is not a pass", () => {
    expect(summariseSuite(report([]))).toMatchObject({ ok: false, total: 0 });
  });
});

describe("renderPrTitle", () => {
  test("names both versions and flags a failing suite", () => {
    const passing = summariseSuite(report([{ fullName: "a", status: "passed" }]));
    const failing = summariseSuite(report([{ fullName: "a", status: "failed" }]));
    expect(renderPrTitle({ from: "6.72.0", to: "6.73.0" }, passing, passing)).toBe(
      "chore(conformance): bump Ghost pin 6.72.0 → 6.73.0",
    );
    expect(renderPrTitle({ from: "6.72.0", to: "6.73.0" }, failing, passing)).toBe(
      "chore(conformance): bump Ghost pin 6.72.0 → 6.73.0 (live suite failing)",
    );
  });

  test("says when the client doesn't support the new Ghost", () => {
    const passing = summariseSuite(report([{ fullName: "a", status: "passed" }]));
    expect(renderPrTitle({ from: "6.72.0", to: "7.0.0" }, suiteNotRun("no"), passing)).toBe(
      "chore(conformance): bump Ghost pin 6.72.0 → 7.0.0 (not supported by the client yet)",
    );
  });

  test("flags a failed manifest generation", () => {
    const passing = summariseSuite(report([{ fullName: "a", status: "passed" }]));
    expect(renderPrTitle({ from: "6.72.0", to: "6.73.0" }, passing, passing, true)).toBe(
      "chore(conformance): bump Ghost pin 6.72.0 → 6.73.0 (manifest generation failing)",
    );
  });

  test("flags a failing client → manifest check", () => {
    const passing = summariseSuite(report([{ fullName: "a", status: "passed" }]));
    const failing = summariseSuite(report([{ fullName: "a", status: "failed" }]));
    expect(renderPrTitle({ from: "6.72.0", to: "6.73.0" }, passing, failing)).toBe(
      "chore(conformance): bump Ghost pin 6.72.0 → 6.73.0 (client check failing)",
    );
  });
});

describe("renderPrBody", () => {
  const passing = summariseSuite(report([{ fullName: "posts > reads back", status: "passed" }]));
  const failing = summariseSuite(
    report([
      { fullName: "posts > reads back", status: "passed" },
      { fullName: "posts > edits persist", status: "failed" },
    ]),
  );
  const calls = [{ method: "GET", path: "/posts/" }];
  const coverage = [measureCoverage(before, calls), measureCoverage(after, calls)];
  const body = (
    suite = passing,
    diff = diffManifests(before, after),
    client = passing,
    manifestFailed = false,
  ) =>
    renderPrBody({
      plan: { from: "6.72.0", to: "6.73.0" },
      releases,
      diff,
      suite,
      client,
      resources: ["posts", "tags"],
      coverage,
      manifestFailed,
      runUrl: "https://github.com/owner/repo/actions/runs/1",
    });

  test("states the pin bump", () => {
    expect(body()).toContain("`6.72.0` → `6.73.0`");
  });

  test("shows each manifest change on its own line, with the auth columns that changed", () => {
    const text = body();
    expect(text).toMatch(/\+ POST \/new\/ .*labs: newFlag/);
    expect(text).toMatch(/- GET \/old\//);
    expect(text).toMatch(/~ PUT \/settings\/ .*integration: accepted → refused/);
  });

  test("says so when the manifest is unchanged", () => {
    expect(body(passing, { added: [], removed: [], changed: [] })).toContain("No route changes");
  });

  test("links every release note between the versions and says what to read them for", () => {
    const text = body();
    expect(text).toContain("[6.72.1](https://github.com/TryGhost/Ghost/releases/tag/v6.72.1)");
    expect(text).toContain("[6.73.0](https://github.com/TryGhost/Ghost/releases/tag/v6.73.0)");
    expect(text).toMatch(/query options/);
  });

  test("names the client's resources next to the release notes", () => {
    expect(body()).toMatch(/## Ghost release notes[\s\S]*Client resources: `posts`, `tags`\./);
  });

  test("puts an unsupported Ghost up front and says the live suite didn't run", () => {
    const text = body(suiteNotRun("Ghost 7 isn't supported by the client yet."));
    expect(text.split("\n")[0]).toContain("Ghost 7 isn't supported by the client yet.");
    expect(text).toMatch(/## Live suite\n\n❌ Not run: Ghost 7 isn't supported/);
  });

  test("reports a passing suite with its counts and the run link", () => {
    const text = body();
    expect(text).toMatch(/✅.*1 passed, 0 expected failures, 0 failed/);
    expect(text).toContain("https://github.com/owner/repo/actions/runs/1");
  });

  test("reports passed, expected failures and failed tests separately", () => {
    const suite = summariseSuite(
      report([
        { fullName: "a", status: "passed" },
        { fullName: "b", status: "passed", meta: { expectedFailure: true } },
        { fullName: "c", status: "passed", meta: { expectedFailure: true } },
        { fullName: "d", status: "failed" },
      ]),
    );
    expect(body(suite)).toContain("1 passed, 2 expected failures, 1 failed");
  });

  test("puts a failing suite up front and names the failing tests", () => {
    const text = body(failing);
    expect(text.split("\n")[0]).toMatch(/live suite fails/i);
    expect(text).toContain("- posts > edits persist");
  });

  test("reports the client → manifest check against the new manifest", () => {
    expect(body()).toMatch(/## Client → manifest check\n\n✅.*1 passed/);
  });

  test("puts a failing client check up front and names its failing tests", () => {
    const client = summariseSuite(report([{ fullName: "posts.browse: GET /posts/", status: "failed" }]));
    const text = body(passing, diffManifests(before, after), client);
    expect(text.split("\n")[0]).toMatch(/client → manifest check fails/i);
    expect(text).toContain("- posts.browse: GET /posts/");
  });

  test("puts a failed manifest generation up front instead of showing a diff", () => {
    const text = body(passing, { added: [], removed: [], changed: [] }, passing, true);
    expect(text.split("\n")[0]).toMatch(/manifest generation failed against Ghost 6\.73\.0/i);
    expect(text).toMatch(/## Manifest diff\n\n❌ .*not regenerated/);
    expect(text).not.toContain("No route changes");
  });

  test("shows the client's route coverage at the pin and at the newest Ghost", () => {
    expect(body()).toMatch(
      /## Client coverage[\s\S]*\| Routes \| Ghost 6\.72\.0 \| Ghost 6\.73\.0 \|[\s\S]*Integration-token routes \| 1 \/ 3 \(33%\) \| 1 \/ 1 \(100%\)/,
    );
  });

  test("explains the rolling PR: merging bumps the pin, an unfixed one accumulates releases", () => {
    const text = body();
    expect(text).toContain("`conformance/drift`");
    expect(text).toMatch(/Merging .*bumps the pin/);
    expect(text).toMatch(/stays open/);
    expect(text).toMatch(/`test\.fails`.*pending keys/);
  });

  test("says other workflows don't run on it and how to start them", () => {
    expect(body()).toMatch(/close and reopen/i);
    expect(body()).toContain("CONFORMANCE_PR_TOKEN");
  });

  test("a crashed suite is reported as failing, not as zero failures", () => {
    expect(body(summariseSuite(undefined)).split("\n")[0]).toMatch(/live suite fails/i);
  });
});

describe("clientResources", () => {
  test("lists each resource the client check called once, sorted", () => {
    const meta = (clientResource: string) => ({ clientResource });
    const client = report([
      { fullName: "tags.browse", status: "passed", meta: meta("tags") },
      { fullName: "posts.add", status: "passed", meta: meta("posts") },
      { fullName: "posts.browse", status: "failed", meta: meta("posts") },
    ]);
    expect(clientResources(client)).toEqual(["posts", "tags"]);
  });

  test("is empty without a report", () => {
    expect(clientResources(undefined)).toEqual([]);
  });
});

describe("verdictErrors", () => {
  const passing = summariseSuite(report([{ fullName: "a", status: "passed" }]));

  test("passes when every suite passed", () => {
    expect(verdictErrors({ "live suite": passing, "client check": passing })).toEqual([]);
  });

  test("names failing tests, crashes and suites that didn't run", () => {
    const failing = summariseSuite(report([{ fullName: "posts > edits", status: "failed" }]));
    const errors = verdictErrors({
      "live suite": suiteNotRun("Ghost 7 isn't supported by the client yet."),
      "client check": failing,
      other: summariseSuite(undefined),
    });
    expect(errors).toEqual([
      "The live suite did not run: Ghost 7 isn't supported by the client yet.",
      "The client check failed 1 of 1 tests:\nposts > edits",
      "The other crashed before reporting; see its step's log.",
    ]);
  });
});
