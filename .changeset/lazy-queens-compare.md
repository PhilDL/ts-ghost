---
"@ts-ghost/content-api": minor
"@ts-ghost/admin-api": minor
"@ts-ghost/core-api": minor
"@ts-ghost/ghost-blog-buster": minor
---

Admin API in GBB, upgrade to TypeScript 5.0, remove `as const` requirement

- eslint conf is now at the root level
- you can now use gbb export-admin members resource
- upgrade to TS 5.0
- Improved typing of query builder so using `as const` is not necessary anymore