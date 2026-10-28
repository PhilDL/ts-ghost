import { describe, expect, test } from "vitest";

import { closeDriftPr, openDriftPr, type Run } from "./open-pr.ts";

/** Records git/gh invocations; `answers` maps a command prefix to its stdout or a thrown stderr. */
function stubRun(answers: Record<string, string | Error> = {}) {
  const calls: string[] = [];
  const run: Run = async (cmd, args) => {
    const line = [cmd, ...args].join(" ");
    calls.push(line);
    const hit = Object.entries(answers).find(([prefix]) => line.startsWith(prefix))?.[1];
    if (hit instanceof Error) throw hit;
    return hit ?? "";
  };
  return { run, calls };
}

const pr = {
  branch: "conformance/drift",
  base: "main",
  title: "chore(conformance): bump Ghost pin 6.72.0 → 6.73.0",
  bodyFile: "/state/pr-body.md",
  files: ["packages/ghost-conformance/ghost-version", "packages/ghost-conformance/manifest.json"],
};

describe("openDriftPr", () => {
  test("commits the pin and manifest to the drift branch and opens a PR when none is open", async () => {
    const { run, calls } = stubRun({
      "gh pr list": "[]",
      "gh pr create": "https://github.com/o/r/pull/7\n",
    });
    await expect(openDriftPr(pr, run)).resolves.toBe("https://github.com/o/r/pull/7");
    expect(calls).toEqual([
      "git switch -C conformance/drift",
      "git add packages/ghost-conformance/ghost-version packages/ghost-conformance/manifest.json",
      `git commit -m ${pr.title}`,
      "git push --force origin conformance/drift",
      "gh pr list --head conformance/drift --base main --state open --json url",
      `gh pr create --head conformance/drift --base main --title ${pr.title} --body-file /state/pr-body.md`,
    ]);
  });

  test("updates the open PR of an earlier run instead of opening a second one", async () => {
    const { run, calls } = stubRun({ "gh pr list": '[{"url":"https://github.com/o/r/pull/5"}]' });
    await expect(openDriftPr(pr, run)).resolves.toBe("https://github.com/o/r/pull/5");
    expect(calls.at(-1)).toBe(
      `gh pr edit https://github.com/o/r/pull/5 --title ${pr.title} --body-file /state/pr-body.md`,
    );
  });

  test("names the repository setting when GitHub refuses to let Actions create the PR", async () => {
    const refusal = new Error(
      "pull request create failed: GraphQL: GitHub Actions is not permitted to create or approve pull requests (createPullRequest)",
    );
    const { run } = stubRun({ "gh pr list": "[]", "gh pr create": refusal });
    await expect(openDriftPr(pr, run)).rejects.toThrow(
      /Settings → Actions → General → .*Allow GitHub Actions to create and approve pull requests/,
    );
  });

  test("passes any other gh failure through unchanged", async () => {
    const { run } = stubRun({ "gh pr list": "[]", "gh pr create": new Error("network down") });
    await expect(openDriftPr(pr, run)).rejects.toThrow("network down");
  });
});

describe("closeDriftPr", () => {
  const close = { branch: "conformance/drift", base: "main", comment: "The pin is already 6.73.0." };

  test("closes the open drift PR with a comment and deletes its branch", async () => {
    const { run, calls } = stubRun({ "gh pr list": '[{"url":"https://github.com/o/r/pull/5"}]' });
    await expect(closeDriftPr(close, run)).resolves.toBe("https://github.com/o/r/pull/5");
    expect(calls.at(-1)).toBe(
      "gh pr close https://github.com/o/r/pull/5 --comment The pin is already 6.73.0. --delete-branch",
    );
  });

  test("does nothing when no drift PR is open", async () => {
    const { run, calls } = stubRun({ "gh pr list": "[]" });
    await expect(closeDriftPr(close, run)).resolves.toBeUndefined();
    expect(calls).toEqual(["gh pr list --head conformance/drift --base main --state open --json url"]);
  });
});
