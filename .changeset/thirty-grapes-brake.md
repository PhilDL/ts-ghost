---
"@ts-ghost/content-api": patch
"@ts-ghost/admin-api": patch
"@ts-ghost/core-api": patch
"@ts-ghost/ghost-blog-buster": patch
---

## All:

- upgrade jose lib

## @ts-ghost/admin-api:

- fix `members` admin-api schema. The `newsletter` array returns a less complete than before data type. It is now reflected in our schema.
