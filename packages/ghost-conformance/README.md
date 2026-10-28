# @ts-ghost/ghost-conformance

Private package that checks `@ts-ghost/admin-api` against a real Ghost. It runs the public client against the official Ghost Docker image (with MySQL 8) at a pinned version, and it keeps a manifest of every Admin API route. Nothing here is published, and the client packages don't import from it.

The pinned Ghost version is in [`ghost-version`](./ghost-version). The compose setup, the manifest, the drift job and the client version all read it from there. The client version is the `v<major>.<minor>` string the live suite passes to `TSGhostAdminAPI` (`clientVersion()` in [`src/ghost/pin.ts`](./src/ghost/pin.ts)), e.g. `v6.72` for Ghost 6.72.0; the client only supports Ghost 6 so far.

## The manifest

[`manifest.json`](./manifest.json) lists every Admin API route of the pinned Ghost, one line per route:

```
{"method":"PUT","path":"/settings/","labs":null,"public":false,"integration":false,"staff":true,"session":true}
```

- `labs` is the labs flag that gates the route, or `null`.
- `public`, `integration`, `staff` and `session` say whether Ghost accepts the request with no credential, an integration Admin API key, the Owner's staff token or a session cookie.

`pnpm manifest` generates it on a fresh, throwaway Ghost. Ghost publishes no OpenAPI spec, so the route list is read from Ghost's router inside the container ([`src/manifest/ghost-router.ts`](./src/manifest/ghost-router.ts) is the only code that touches Ghost internals). Auth is probed over HTTP: each route is called once per credential with ids that don't exist and no body, and 401 or 403 counts as refused. The output is sorted, so a diff between two Ghost versions shows routes that were added, removed or re-permissioned. The manifest is the only generated file; responses and request bodies are not recorded.

The **client → manifest check** ([`src/client-routes/`](./src/client-routes/)) runs with the unit tests and needs no Docker. It calls every public client method against a fetch stub that records method and path, then asserts that each route exists in the manifest and accepts an integration key.

## Running it

```sh
pnpm --filter @ts-ghost/ghost-conformance test       # unit tests + client → manifest check (no Docker)
pnpm --filter @ts-ghost/ghost-conformance test:live  # live suite (Docker)
pnpm --filter @ts-ghost/ghost-conformance manifest   # regenerate manifest.json (Docker)
```

The `manifest` and `drift` scripts run TypeScript directly with Node's type stripping, so they need Node ≥ 22.18. The live suite and the manifest need a running Docker with `docker compose`. Each run starts its own compose project (Ghost plus MySQL on tmpfs) on a free local port and removes it afterwards, so runs never share state and leave nothing behind.

The live suite's global setup:

1. runs Ghost's first-run setup to create the Owner, signs in, creates an integration and fetches the Owner's staff token, all through Ghost's public API;
2. applies a small SQL seed for data the API can't create (sent and failed emails, email recipients and suppressions, Stripe customers and subscriptions).

Every other record is seeded by the tests through the client itself. The suite follows three rules:

- every response is checked for keys the client's schema doesn't declare, at any depth, and fails with their paths;
- every add and edit is read back and compared with what was sent;
- every nullable field is seeded both null and set.

CI runs the live suite on every PR to `main` ([`.github/workflows/conformance.yml`](../../.github/workflows/conformance.yml)) and adds the client's route coverage to the job summary.

## Route coverage

`pnpm coverage <report.json>` reads the client → manifest check's Vitest JSON report and counts the manifest routes the client calls, with labs-flagged routes left out. It gives two numbers: routes that accept an integration token (what the client can use today) and all routes, whatever their auth. It also tables each resource (the route's first path segment) and lists the integration-token routes the client doesn't call. The drift PR shows the same report for the pin and the new Ghost side by side.

## Drift PR

[`.github/workflows/conformance-drift.yml`](../../.github/workflows/conformance-drift.yml) runs every Monday and can be started by hand with a Ghost version, from the default branch only. There is one drift PR, from the branch `conformance/drift`. When a newer Ghost image exists, the workflow:

1. bumps `ghost-version` and regenerates the manifest,
2. runs the client → manifest check and the live suite against the new Ghost,
3. force-pushes `conformance/drift` and rewrites the PR's title and description: always from the default branch's pin to the newest Ghost, with the manifest diff, the test results, the route coverage at both versions, and links to the release notes of every version in between,
4. fails the run if the manifest, the client check or the live suite failed, so a breaking release doesn't show up as green.

Merging the PR bumps the pin. If nobody fixes it, it stays open and the next runs add the newer releases to it. To bump the pin without fixing everything, mark what fails (`test.fails`, `EXPECTED_FAILURES`, pending keys, each with a reason) on the drift branch and merge; the next run overwrites commits pushed there, so merge soon after. When the pin already is the newest Ghost, the run closes an open drift PR.

The release notes matter because the suite can't see everything, such as new query options. If the new Ghost has a major the client doesn't support yet, the live suite doesn't run, and the PR and the job say so.

The workflow has two jobs. `drift` runs the dependencies and a fresh Ghost with a read-only token and hands its results to `pr` as an artifact; `pr` runs only `src/drift/cli.ts` with plain Node and is the only job that can push and edit PRs. The steps can be run locally with `pnpm drift <step>`.

Setup:

- **Settings → Actions → General → Workflow permissions → "Allow GitHub Actions to create and approve pull requests"**. Without it, the `pr` job fails with a message pointing to that setting.
- PRs opened with the workflow's `GITHUB_TOKEN` start no other workflows, so the drift PR shows no Tests or Conformance checks until someone closes and reopens it. An optional `CONFORMANCE_PR_TOKEN` secret (a GitHub App installation token or a fine-grained token with contents and pull-requests write on this repository) is used instead when set, and CI then runs on its own.

## Expected failures

Every place where the client and Ghost currently disagree is an expected failure with a one-line reason above it. The suite stays green, and the markers show what is still broken:

- **`test.fails`**: the test is expected to fail. When the client is fixed, it passes, so Vitest fails it until the marker is removed. Each one has a single cause.
- **`// @ts-expect-error <reason>`**: the test calls the client in a way its types don't allow yet (a missing input key, include or method). Once the type allows it, the typecheck fails until the comment is removed.
- **Pending keys** ([`src/live/pending-keys.ts`](./src/live/pending-keys.ts)): unknown keys Ghost sends that are waiting for a schema fix. Each group belongs to a resource's "carries no key the client's schema lacks" `test.fails`. Remove the keys when that test turns green.
- **Ignored keys**: keys the client deliberately doesn't model. Pass them to the file's `liveResponses({ ignore: [...] })` (and to any direct `unknownKeys` call), e.g. `ignore: ["posts[].frontmatter"]`. These are permanent, unlike pending keys; no file needs any yet.
- **`EXPECTED_FAILURES`** in [`client-manifest.test.ts`](./src/client-routes/client-manifest.test.ts): client calls to routes the manifest doesn't have.

The Vitest reporter counts expected failures separately (`N expected fail`), and the drift PR body does too.
