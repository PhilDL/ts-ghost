# @ts-ghost/core-api

## 1.0.1

### Patch Changes

- c6f50c3: update README and metadatas

## 1.0.0

### Major Changes

- 99c9110: ## Breaking Changes

  QueryBuilder API now only have input params, output is handled on the fetcher via the `fields`, `formats` and `include` methods.

  ### Before

  Given this queries in the old API

  ```ts
  const qb = new QueryBuilder(
    { schema: simplifiedSchema, output: simplifiedSchema, include: simplifiedIncludeSchema },
    api
  );
  let query = qb.browse({
    input: {
      limit: 5,
      order: "title DESC",
    },
    output: {
      include: {
        count: true,
      },
    },
  });

  let readQuery = qb.read({
    input: {
      slug: "test-post",
    },
    output: {
      fields: {
        slug: true,
        count: true,
      },
    },
  });
  ```

  ### After

  Rewritten in the new API version:

  ```ts
  const qb = new QueryBuilder(
    { schema: simplifiedSchema, output: simplifiedSchema, include: simplifiedIncludeSchema },
    api
  );
  let browseQuery = qb
    .browse({
      limit: 5,
      order: "title DESC",
    })
    .include({ count: true });

  let readQuery = qb
    .read({
      slug: "test-post",
    })
    .fields({
      slug: true,
      count: true,
    });
  ```

  ## Other changes

  - Updated documentation
  - Code cleanup

## 0.3.2

### Patch Changes

- 079b7e4: ## Improved admin-api
  Add missing resources:

  - tags
  - offers
  - users
  - newsletters

  ## Improved typing and usage of the new fetchers methods.

  Fetcher methods .fields(), .formats() and .include() got some upgrade to have better type-safety for unknown fields and runtime stripping of unknown keys.

  ## Upgrade dependencies

  Upgrade most of the devDependencies with TypeScript 5.0 compatible versions (lint, prettier, etc)

## 0.3.1

### Patch Changes

- f5a95a2: add admin-tiers API

## 0.3.0

### Minor Changes

- 5b2326f: Admin API in GBB, upgrade to TypeScript 5.0, remove `as const` requirement

  - eslint conf is now at the root level
  - you can now use gbb export-admin members resource
  - upgrade to TS 5.0
  - Improved typing of query builder so using `as const` is not necessary anymore

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

## 0.1.0

### Minor Changes

- e1970a1: First public beta version of the packages

## 0.0.7

### Patch Changes

- bbb5706: Feature/improve usability and documentation

## 0.0.6

### Patch Changes

- 86e5730: update READMEs and packages descriptions.

## 0.0.5

### Patch Changes

- e03e0e5: fix dependencies...

## 0.0.4

### Patch Changes

- 011dd4e: changing the way deps are declared and testing CI

## 0.0.3

### Patch Changes

- 4bef6ca: Update readme and licenses

## 0.0.2

### Patch Changes

- 1cb1b2b: First release
