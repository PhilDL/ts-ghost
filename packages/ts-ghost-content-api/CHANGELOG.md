# @ts-ghost/content-api

## 2.2.0

### Minor Changes

- a37a8ec: Possibility to add options to edit method for content and admin API Clients.

### Patch Changes

- Updated dependencies [a37a8ec]
  - @ts-ghost/core-api@4.2.0

## 2.1.0

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
  - @ts-ghost/core-api@4.1.0

## 2.0.0

### Major Changes

- b7d6fb5: ## Breaking changes

  ### `@ts-ghost/content-api` and `@ts-ghost/admin-api`

  - There was an underlying change in the `@ts-ghost/core-api` modifying the discriminator of all endpoints **result**.
    Instead of being on the key `status` with values of `"success"` or `"error"`, it is now on the key `success` with values of `true` or `false`.

  #### Before:

  ```typescript
  // example for the browse query (the data is an array of objects)
  const result: {
      status: "success";
      data: Post[];
      meta: {
          pagination: {
              pages: number;
              limit: number;
              page: number;
              total: number;
              prev: number | null;
              next: number | null;
          };
      };
  } | {
      status: "error";
      errors: {
          message: string;
          type: string;
      }[];
  }
  ```

  #### After

  ```typescript
  // example for the browse query (the data is an array of objects)
  const result: {
      success: true;
      data: Post[];
      meta: {
          pagination: {
              pages: number;
              limit: number;
              page: number;
              total: number;
              prev: number | null;
              next: number | null;
          };
      };
  } | {
      success: false;
      errors: {
          message: string;
          type: string;
      }[];
  }
  ```

  It is now easier to check if the result is a success or an error:

  ```typescript
  if (result.success) {
    // do something with result.data
  } else {
    // do something with result.errors
  }
  ```

  ## New features

  ### `@ts-ghost/admin-api` New endpoints actions available:

  - [x] `members` now have`delete` method. Even if not defined in the Ghost documentation it is indeed avaiable
  - [x] `posts` now have `add`, `edit`, and `delete` methods.
  - [x] `pages` now have `add`, `edit`, and `delete` methods.
  - [x] `tiers` have schema defined but no mutation method exposed as they don't work on Ghost API
  - [x] `newsletter` now have `add`, and `edit` methods. The deletion is done via setting `{status: "archived"}` through `edit`, it is a soft delete.
  - [x] `tags` now have `add`, `edit`, and `delete` methods.
  - [x] `offers`now have `add`, and `edit` methods. The deletion is done via setting `{status: "archived"}` through `edit`, it is a soft delete.
  - [x] new resource: `webhooks` with `add`, `edit` and `delete` methods.

### Patch Changes

- Updated dependencies [b7d6fb5]
  - @ts-ghost/core-api@4.0.0

## 1.1.0

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
  - @ts-ghost/core-api@3.0.0

## 1.0.6

### Patch Changes

- d78279e: Allow options to be passed to fetch
- Updated dependencies [d78279e]
  - @ts-ghost/core-api@2.0.1

## 1.0.5

### Patch Changes

- Updated dependencies [6a55476]
- Updated dependencies [6a55476]
  - @ts-ghost/core-api@2.0.0

## 1.0.4

### Patch Changes

- 507b16a: ## Changes

  - Update the TS definition of `APIVersion` to accept only `v5.x` for now.
  - Updated the corresponding zod schema to have regex validation.
  - Updated documentation to give info about the supported versions

- Updated dependencies [507b16a]
  - @ts-ghost/core-api@1.1.6

## 1.0.3

### Patch Changes

- 31ea021: upgrade dependencies
- Updated dependencies [31ea021]
  - @ts-ghost/core-api@1.1.4

## 1.0.2

### Patch Changes

- 55acb51: Upgrade dependencies
- Updated dependencies [55acb51]
  - @ts-ghost/core-api@1.1.1

## 1.0.1

### Patch Changes

- c6f50c3: update README and metadatas
- Updated dependencies [c6f50c3]
  - @ts-ghost/core-api@1.0.1

## 1.0.0

### Major Changes

- 99c9110: ## Breaking Changes

  `@ts-ghost/core-api` QueryBuilder and Fetcher were updated so this package also sees its API updated. Now the resource only have input params, output is handled on the fetcher via the `fields`, `formats` and `include` methods.

  ### Before

  Given this queries in the old API

  ```ts
  const posts = await api.posts
    .browse({
      input: {
        limit: 5,
        order: "title DESC",
      },
      output: {
        include: {
          authors: true,
        },
      },
    })
    .fetch();

  const onePost = await api.posts
    .read({
      input: {
        slug: "test-post",
      },
      output: {
        fields: {
          slug: true,
          html: true,
        },
      },
    })
    .fetch();
  ```

  ### After

  Rewritten in the new API version:

  ```ts
  const posts = await api.posts
    .browse({
      limit: 5,
      order: "title DESC",
    })
    .include({
      authors: true,
    })
    .fetch();

  const onePost = await api.posts
    .read({
      slug: "test-post",
    })
    .fields({
      slug: true,
      html: true,
    })
    .fetch();
  ```

  ## Other changes

  - Updated documentation
  - Code cleanup

### Patch Changes

- Updated dependencies [99c9110]
  - @ts-ghost/core-api@1.0.0

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
  - @ts-ghost/core-api@0.3.2

## 0.3.0

### Minor Changes

- 5b2326f: Admin API in GBB, upgrade to TypeScript 5.0, remove `as const` requirement

  - eslint conf is now at the root level
  - you can now use gbb export-admin members resource
  - upgrade to TS 5.0
  - Improved typing of query builder so using `as const` is not necessary anymore

### Patch Changes

- Updated dependencies [5b2326f]
  - @ts-ghost/core-api@0.3.0

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
  - @ts-ghost/core-api@0.2.0

## 0.1.0

### Minor Changes

- e1970a1: First public beta version of the packages

### Patch Changes

- Updated dependencies [e1970a1]
  - @ts-ghost/core-api@0.1.0

## 0.0.7

### Patch Changes

- bbb5706: Feature/improve usability and documentation
- Updated dependencies [bbb5706]
  - @ts-ghost/core-api@0.0.7

## 0.0.6

### Patch Changes

- 86e5730: update READMEs and packages descriptions.
- Updated dependencies [86e5730]
  - @ts-ghost/core-api@0.0.6

## 0.0.5

### Patch Changes

- e03e0e5: fix dependencies...
- Updated dependencies [e03e0e5]
  - @ts-ghost/core-api@0.0.5

## 0.0.4

### Patch Changes

- 011dd4e: changing the way deps are declared and testing CI
- Updated dependencies [011dd4e]
  - @ts-ghost/core-api@0.0.4

## 0.0.3

### Patch Changes

- 4bef6ca: Update readme and licenses
- Updated dependencies [4bef6ca]
  - @ts-ghost/core-api@0.0.3

## 0.0.2

### Patch Changes

- 1cb1b2b: First release
- Updated dependencies [1cb1b2b]
  - @ts-ghost/core-api@0.0.2
