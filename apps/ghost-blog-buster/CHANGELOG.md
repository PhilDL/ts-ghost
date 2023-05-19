# @ts-ghost/ghost-blog-buster

## 0.6.5

### Patch Changes

- 21520e8: Update documentation
- Updated dependencies [21520e8]
  - @ts-ghost/content-api@4.0.1
  - @ts-ghost/admin-api@3.0.2

## 0.6.4

### Patch Changes

- Updated dependencies [6276df3]
- Updated dependencies [6276df3]
  - @ts-ghost/content-api@4.0.0
  - @ts-ghost/admin-api@3.0.1

## 0.6.3

### Patch Changes

- [#69](https://github.com/PhilDL/ts-ghost/pull/69) [`59a8296`](https://github.com/PhilDL/ts-ghost/commit/59a8296a203b5862f757bf5fcdaaae04e21a2fe1) Thanks [@PhilDL](https://github.com/PhilDL)! - Update inner dependencies

- Updated dependencies [[`59a8296`](https://github.com/PhilDL/ts-ghost/commit/59a8296a203b5862f757bf5fcdaaae04e21a2fe1)]:
  - @ts-ghost/content-api@3.0.0
  - @ts-ghost/admin-api@3.0.0

## 0.6.2

### Patch Changes

- 0612b6c: Update posts/pages visibility property to accept "tiers" in its union of values.
- Updated dependencies [0612b6c]
  - @ts-ghost/content-api@2.2.1
  - @ts-ghost/admin-api@2.3.1

## 0.6.1

### Patch Changes

- a37a8ec: Possibility to add options to edit method for content and admin API Clients.
- Updated dependencies [a37a8ec]
  - @ts-ghost/content-api@2.2.0
  - @ts-ghost/admin-api@2.3.0

## 0.6.0

### Minor Changes

- 889c980: ### Minor changes:

  `admin-api` now expose a `settings` resource that returns the Blog settings array of key, value pairs.

  Example success return

  ```ts
  {
    success: true,
    data: [
      {
        key: 'title',
        value: 'My blog - TypeScript, Python & JavaScript Tutorials'
      },
      {
        key: 'description',
        value: 'TypeScript Developement Tutorials. Real-world examples and useful code snippets!'
      },
      {
        key: 'logo',
        value: 'https://myblog.com/content/images/2021/04/myblog.png'
      },
      { key: 'cover_image', value: null },
      // ...
  }
  ```

  ### Chores:

  Upgrade internal dependencies

### Patch Changes

- Updated dependencies [889c980]
  - @ts-ghost/content-api@2.1.0
  - @ts-ghost/admin-api@2.1.0

## 0.5.1

### Patch Changes

- b7d6fb5: Update to follow the breaking changes od @ts-ghost/admin-api and @ts-ghost/content-api
- Updated dependencies [b7d6fb5]
  - @ts-ghost/content-api@2.0.0
  - @ts-ghost/admin-api@2.0.0

## 0.5.0

### Minor Changes

- 82fb15f: ## All libraries
  Reflect internal changes to @ts-ghost/core-api in the way the API is composed. There is no impact for end users

  ## `@ts-ghost/admin-api`

  ### New feature

  - The `members` resource now have a `add` and `edit` method that allow them to be created and updated.

  ```ts
  const createNewMember = await api.members.add({ email: "abcdefgh@msn.com" }, { send_email: true });
  assert(createNewMember.success);
  const newMember = createNewMember.data;
  // id => 6438cc365a8fdb00013a8783
  const updateMember = await api.members.edit("6438cc365a8fdb00013a8783", {
    name: "FooBarBaz",
    note: "Hello from ts-ghost",
    labels: [{ name: "ts-ghost" }],
    geolocation: "Reunion",
    stripe_customer_id: "aiuhdiuahzdiuhaizudhaiuzdhiuazd",
  });
  if (updateMember.success) {
    const member = updateMember.data;
    console.log("labels", member.labels);
  }
  ```

### Patch Changes

- Updated dependencies [82fb15f]
  - @ts-ghost/content-api@1.1.0
  - @ts-ghost/admin-api@1.1.0

## 0.4.4

### Patch Changes

- 47484ce: Fix generated frontmatter was not correct

## 0.4.3

### Patch Changes

- 507b16a: ## Changes

  - Update the TS definition of `APIVersion` to accept only `v5.x` for now.
  - Updated the corresponding zod schema to have regex validation.
  - Updated documentation to give info about the supported versions

- Updated dependencies [507b16a]
  - @ts-ghost/admin-api@1.0.4
  - @ts-ghost/content-api@1.0.4

## 0.4.2

### Patch Changes

- 31ea021: upgrade dependencies
- Updated dependencies [31ea021]
  - @ts-ghost/content-api@1.0.3
  - @ts-ghost/admin-api@1.0.3

## 0.4.1

### Patch Changes

- 55acb51: Upgrade dependencies
- Updated dependencies [55acb51]
  - @ts-ghost/content-api@1.0.2
  - @ts-ghost/admin-api@1.0.2

## 0.4.0

### Minor Changes

- 99c9110: Migrate to the newer versions of content and admin API, no user-facing changes.

### Patch Changes

- Updated dependencies [99c9110]
  - @ts-ghost/content-api@1.0.0
  - @ts-ghost/admin-api@1.0.0

## 0.3.1

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

- Updated dependencies [079b7e4]
  - @ts-ghost/admin-api@0.2.2
  - @ts-ghost/content-api@0.3.1

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
