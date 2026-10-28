import { describe, expect, test } from "vitest";

import type { Manifest, ManifestRoute } from "../manifest/manifest.ts";
import { clientCalls, measureCoverage, renderCoverage } from "./coverage.ts";

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

const manifest: Manifest = {
  ghost: "6.72.0",
  routes: [
    route("GET", "/posts/"),
    route("GET", "/posts/:id/"),
    route("DELETE", "/posts/:id/"),
    route("PUT", "/settings/", { integration: false }),
    route("GET", "/settings/", { integration: false }),
    route("GET", "/members/:id/signin_urls/", { integration: false }),
    route("POST", "/apps/installations/", { labs: "apps" }),
  ],
};

const calls = [
  { method: "GET", path: "/posts/" },
  { method: "GET", path: "/posts/:/" },
  { method: "PUT", path: "/settings/" },
  { method: "GET", path: "/posts/" },
  { method: "POST", path: "/apps/installations/" },
  { method: "GET", path: "/nowhere/" },
];

describe("measureCoverage", () => {
  test("counts the non-labs routes the client calls, for integration-token routes and for all routes", () => {
    const coverage = measureCoverage(manifest, calls);
    expect(coverage.ghost).toBe("6.72.0");
    expect(coverage.integration).toEqual({ covered: 2, total: 3 });
    expect(coverage.all).toEqual({ covered: 3, total: 6 });
  });

  test("tallies each resource by the route's first path segment, sorted", () => {
    expect(measureCoverage(manifest, calls).resources).toEqual([
      { resource: "members", integration: { covered: 0, total: 0 }, all: { covered: 0, total: 1 } },
      { resource: "posts", integration: { covered: 2, total: 3 }, all: { covered: 2, total: 3 } },
      { resource: "settings", integration: { covered: 0, total: 0 }, all: { covered: 1, total: 2 } },
    ]);
  });

  test("lists the integration-token routes the client doesn't call", () => {
    expect(measureCoverage(manifest, calls).uncovered).toEqual([route("DELETE", "/posts/:id/")]);
  });
});

describe("clientCalls", () => {
  test("reads the method and path each client check test recorded", () => {
    const report = {
      numTotalTests: 2,
      numPassedTests: 2,
      numFailedTests: 0,
      numPendingTests: 0,
      numTodoTests: 0,
      testResults: [
        {
          assertionResults: [
            { fullName: "posts.browse", status: "passed", meta: { clientCall: calls[0] } },
            { fullName: "other", status: "passed" },
          ],
        },
      ],
    };
    expect(clientCalls(report)).toEqual([{ method: "GET", path: "/posts/" }]);
  });

  test("is empty without a report", () => {
    expect(clientCalls(undefined)).toEqual([]);
  });
});

describe("renderCoverage", () => {
  const pin = measureCoverage(manifest, calls);
  const newest = measureCoverage(
    { ghost: "6.73.0", routes: [...manifest.routes, route("GET", "/tags/")] },
    calls,
  );

  test("gives both numbers with percentages for one Ghost", () => {
    const text = renderCoverage([pin]);
    expect(text).toMatch(/\| Integration-token routes \| 2 \/ 3 \(67%\) \|/);
    expect(text).toMatch(/\| All routes \| 3 \/ 6 \(50%\) \|/);
    expect(text).toContain("labs");
  });

  test("puts the pin and the newest Ghost side by side", () => {
    const text = renderCoverage([pin, newest]);
    expect(text).toMatch(/\| Routes \| Ghost 6\.72\.0 \| Ghost 6\.73\.0 \|/);
    expect(text).toMatch(/\| Integration-token routes \| 2 \/ 3 \(67%\) \| 2 \/ 4 \(50%\) \|/);
  });

  test("tables each resource and lists the uncovered integration-token routes of the last Ghost", () => {
    const text = renderCoverage([pin, newest]);
    expect(text).toMatch(/\| `posts` \| 2 \/ 3 \| 2 \/ 3 \|/);
    expect(text).toMatch(/\| `tags` \| 0 \/ 1 \| 0 \/ 1 \|/);
    expect(text).toContain("- `DELETE /posts/:id/`");
    expect(text).toContain("- `GET /tags/`");
  });

  test("renders a resource without routes as a dash, not 0%", () => {
    expect(renderCoverage([pin])).toMatch(/\| `settings` \| – \| 1 \/ 2 \|/);
  });
});
