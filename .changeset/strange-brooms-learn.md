---
"@ts-ghost/content-api": minor
"@ts-ghost/admin-api": minor
"@ts-ghost/core-api": minor
"@ts-ghost/ghost-blog-buster": minor
---
## New package `@ts-ghost/admin-api`

First implementation of the Ghost Admin API. Currently only supports the following endpoint:
- `members`
- `posts`
- `pages`
- `site`

## Refactoring of the Fetchers and QueryBuilders

- Zod upgrade
- New `formats()`, `fields()` and `include()` methods on the Fetchers to have better output type safety. These new methods are intended to replace the `output` options args of the QueryBuilder later. They provide a better typing of the output transforming the schema like removing the `optionnal` effect of a field if it was included in the `include` option of the QueryBuilder.