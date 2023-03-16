# @ts-ghost/admin-api

## 0.1.0

### Minor Changes

- 4e95c66: ## New package `@ts-ghost/admin-api`

  First implementation of the Ghost Admin API. Currently only supports the following endpoint:

  - `members`
  - `posts`
  - `pages`
  - `site`

  ## Refactoring of the Fetchers and QueryBuilders

  - Zod upgrade
  - New `formats()`, `fields()` and `include()` methods on the Fetchers to have better output type safety. These new methods are intended to replace the `output` options args of the QueryBuilder later. They provide a better typing of the output transforming the schema like removing the `optionnal` effect of a field if it was included in the `include` option of the QueryBuilder.

### Patch Changes

- Updated dependencies [4e95c66]
  - @ts-ghost/core-api@0.2.0
