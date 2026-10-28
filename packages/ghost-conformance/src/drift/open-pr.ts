/** Runs a command and resolves its stdout; rejects with an error carrying stderr. */
export type Run = (cmd: string, args: string[]) => Promise<string>;

export const MISSING_PR_PERMISSION =
  "GitHub refused to let this workflow open a pull request. A repository admin must enable " +
  'Settings → Actions → General → Workflow permissions → "Allow GitHub Actions to create and approve pull requests".';

/** Commits `files` to `branch`, force-pushes it, and opens (or updates) its PR; returns the PR URL. */
export async function openDriftPr(
  pr: { branch: string; base: string; title: string; bodyFile: string; files: string[] },
  run: Run,
): Promise<string> {
  await run("git", ["switch", "-C", pr.branch]);
  await run("git", ["add", ...pr.files]);
  await run("git", ["commit", "-m", pr.title]);
  await run("git", ["push", "--force", "origin", pr.branch]);

  const open = JSON.parse(
    await run("gh", [
      "pr",
      "list",
      "--head",
      pr.branch,
      "--base",
      pr.base,
      "--state",
      "open",
      "--json",
      "url",
    ]),
  ) as { url: string }[];
  const existing = open[0]?.url;
  try {
    if (existing) {
      await run("gh", ["pr", "edit", existing, "--title", pr.title, "--body-file", pr.bodyFile]);
      return existing;
    }
    const created = await run("gh", [
      ...["pr", "create", "--head", pr.branch, "--base", pr.base],
      ...["--title", pr.title, "--body-file", pr.bodyFile],
    ]);
    return created.trim();
  } catch (error) {
    if (String(error).includes("not permitted to create or approve pull requests"))
      throw new Error(MISSING_PR_PERMISSION, { cause: error });
    throw error;
  }
}
