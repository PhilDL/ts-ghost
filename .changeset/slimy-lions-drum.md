---
"@ts-ghost/admin-api": minor
"@ts-ghost/content-api": minor
"@ts-ghost/core-api": minor
---

## Global

- Upgrade Zod version and fix types, no breaking changes were introduced.

## `@ts-ghost/content-api`

Change type of `url` on `Author` for the content API to align with the `post.authors` and `page.authors` type.
An author can have an undefined or null `url` if the author is not set as visible.

- New type is now `string | undefined | null` instead of `string`.
- Updated the `Author` type in the `content-api` package to reflect this change.
