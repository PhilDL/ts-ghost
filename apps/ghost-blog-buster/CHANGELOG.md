# @ts-ghost/ghost-blog-buster

## 0.3.0

### Minor Changes

- 5b2326f: Admin API in GBB, upgrade to TypeScript 5.0, remove `as const` requirement

  - eslint conf is now at the root level
  - you can now use gbb export-admin members resource
  - upgrade to TS 5.0
  - Improved typing of query builder so using `as const` is not necessary anymore

### Patch Changes

- Updated dependencies [5b2326f]
  - @ts-ghost/content-api@0.3.0
  - @ts-ghost/admin-api@0.2.0

## 0.2.0

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
  - @ts-ghost/content-api@0.2.0

## 0.1.0

### Minor Changes

- e1970a1: First public beta version of the packages

### Patch Changes

- Updated dependencies [e1970a1]
  - @ts-ghost/content-api@0.1.0

## 0.0.6

### Patch Changes

- bbb5706: Feature/improve usability and documentation
- Updated dependencies [bbb5706]
  - @ts-ghost/content-api@0.0.7

## 0.0.5

### Patch Changes

- 86e5730: update READMEs and packages descriptions.
- Updated dependencies [86e5730]
  - @ts-ghost/content-api@0.0.6

## 0.0.4

### Patch Changes

- e03e0e5: fix dependencies...
- Updated dependencies [e03e0e5]
  - @ts-ghost/content-api@0.0.5

## 0.0.3

### Patch Changes

- 4bef6ca: Update readme and licenses
- Updated dependencies [4bef6ca]
  - @ts-ghost/content-api@0.0.3

## 0.0.2

### Patch Changes

- 33bb3ec: Add README and fix lib

### Patch Changes

- 571815c: Fix the cli to work correctly
- 1cb1b2b: First release
- Updated dependencies [1cb1b2b]
  - @ts-ghost/content-api@0.0.2
