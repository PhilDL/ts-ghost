# @ts-ghost/ghost-conformance

Private package that checks `@ts-ghost/admin-api` against a real Ghost. It runs the public client against the official Ghost Docker image (with MySQL 8) at a pinned version, and it keeps a manifest of every Admin API route. Nothing here is published, and the client packages don't import from it.

The pinned Ghost version is in [`ghost-version`](./ghost-version). The compose setup, the client version, the manifest and the drift job all read it from there.

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

The live suite and the manifest need a running Docker with `docker compose`. Each run starts its own compose project (Ghost plus MySQL on tmpfs) on a free local port and removes it afterwards, so runs never share state and leave nothing behind.

The live suite's global setup:

1. runs Ghost's first-run setup to create the Owner, signs in, creates an integration and fetches the Owner's staff token, all through Ghost's public API;
2. applies a small SQL seed for data the API can't create (sent and failed emails, email recipients and suppressions, Stripe customers and subscriptions);
3. turns commenting on for the whole run.

Every other record is seeded by the tests through the client itself. The suite follows three rules:

- every response is checked for keys the client's schema doesn't declare, at any depth, and fails with their paths;
- every add and edit is read back and compared with what was sent;
- every nullable field is seeded both null and set.

CI runs the live suite on every PR to `main` ([`.github/workflows/conformance.yml`](../../.github/workflows/conformance.yml)).

## Drift PRs

[`.github/workflows/conformance-drift.yml`](../../.github/workflows/conformance-drift.yml) runs every Monday and can be started by hand with a Ghost version. When a newer Ghost image exists, it:

1. bumps `ghost-version` and regenerates the manifest,
2. runs the client → manifest check and the live suite against the new Ghost,
3. opens (or updates) a PR from `conformance/ghost-<version>` with the manifest diff, the test results and links to the Ghost release notes since the old pin,
4. fails the job if either suite failed, so a breaking release doesn't show up as a green PR.

The release notes matter because the suite can't see everything, such as new query options.

The workflow needs **Settings → Actions → General → Workflow permissions → "Allow GitHub Actions to create and approve pull requests"**. Without it, the job fails with a message pointing to that setting. The steps live in [`src/drift/cli.ts`](./src/drift/cli.ts) and can be run locally with `pnpm drift <step>`.

## Expected failures

Every place where the client and Ghost currently disagree is an expected failure with a one-line reason above it. The suite stays green, and the markers show what is still broken:

- **`test.fails`**: the test is expected to fail. When the client is fixed, it passes, so Vitest fails it until the marker is removed. Each one has a single cause.
- **`// @ts-expect-error <reason>`**: the test calls the client in a way its types don't allow yet (a missing input key, include or method). Once the type allows it, the typecheck fails until the comment is removed.
- **Pending keys** ([`src/live/pending-keys.ts`](./src/live/pending-keys.ts)): unknown keys Ghost sends that are waiting for a schema fix. Each group belongs to a resource's "carries no key the client's schema lacks" `test.fails`. Remove the keys when that test turns green.
- **`IGNORED`** (top of each live test file): keys the client deliberately doesn't model. These are permanent, unlike pending keys.
- **`EXPECTED_FAILURES`** in [`client-manifest.test.ts`](./src/client-routes/client-manifest.test.ts): client calls to routes the manifest doesn't have.

The Vitest reporter counts expected failures separately (`N expected fail`), and the drift PR body does too.
