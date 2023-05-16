---
"@ts-ghost/content-api": major
"@ts-ghost/admin-api": major
"@ts-ghost/core-api": major
---

# Breaking changes: bring your own fetch

With the goal of being fully NextJS compatible (and other frameworks that already polyfill fetch and sometimes augment it), we decided to remove the `cross-fetch` dependency from the packages.

It is now the consummer duty to bring their own implementation of fetch.

Requirements have been updated:

- Node.js 16+
  - We rely on global `fetch` being available, so you can bring your own
    polyfill and if you run Node 16, you'll need to run with the
    `--experimental-fetch` flag enabled.
