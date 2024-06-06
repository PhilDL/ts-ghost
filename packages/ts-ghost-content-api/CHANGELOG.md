# @ts-ghost/content-api

## 4.1.0

### Minor Changes

- 0586744: ## Global

  - Upgrade Zod version and fix types, no breaking changes were introduced.

  ## `@ts-ghost/content-api`

  Change type of `url` on `Author` for the content API to align with the `post.authors` and `page.authors` type.
  An author can have an undefined or null `url` if the author is not set as visible.

  - New type is now `string | undefined | null` instead of `string`.
  - Updated the `Author` type in the `content-api` package to reflect this change.

### Patch Changes

- Updated dependencies [0586744]
  - @ts-ghost/core-api@6.1.0

## 4.0.12

### Patch Changes

- Updated dependencies [5544e8a]
- Updated dependencies [5544e8a]
  - @ts-ghost/core-api@6.0.0

## 4.0.11

### Patch Changes

- 53d86aa: Upgrade jose dep and admin-api minor fix for post email publishing
- Updated dependencies [53d86aa]
  - @ts-ghost/core-api@5.1.2

## 4.0.10

### Patch Changes

- 2d03006: ## All:

  - upgrade jose lib

  ## @ts-ghost/admin-api:

  - fix `members` admin-api schema. The `newsletter` array returns a less complete than before data type. It is now reflected in our schema.

- Updated dependencies [2d03006]
  - @ts-ghost/core-api@5.0.11

## 4.0.9

### Patch Changes

- 9e087f7: minor upgrade zod and jose dependencies
- Updated dependencies [9e087f7]
  - @ts-ghost/core-api@5.0.10

## 4.0.8

### Patch Changes

- 94693fe: Fix Post/Page catch html and excerpt null to empty string

## 4.0.7

### Patch Changes

- b496092: Upgrade deps zod
  Upgrade deps clack
- Updated dependencies [b496092]
  - @ts-ghost/core-api@5.0.8

## 4.0.6

### Patch Changes

- 4b27b40: This is a minor release that fixes URL construction of the inner HTTPClient allowing URL with subpath thanks to @CruelMoney PR #119
- Updated dependencies [4b27b40]
  - @ts-ghost/core-api@5.0.7

## 4.0.5

### Patch Changes

- de9d78a: fix filter typings and add tests
- Updated dependencies [de9d78a]
  - @ts-ghost/core-api@5.0.6

## 4.0.4

### Patch Changes

- 18a9866: fix minor problem with filter in browse Typings
- Updated dependencies [18a9866]
  - @ts-ghost/core-api@5.0.5

## 4.0.3

### Patch Changes

- 79b4bf7: Add possibility to browse with limit "all"
- Updated dependencies [79b4bf7]
  - @ts-ghost/core-api@5.0.4

## 4.0.2

### Patch Changes

- a8c0222: Dev dependencies
- Updated dependencies [a8c0222]
  - @ts-ghost/core-api@5.0.3

## 4.0.1

### Patch Changes

- 21520e8: Update documentation
- Updated dependencies [21520e8]
  - @ts-ghost/core-api@5.0.2

## 4.0.0

### Major Changes

- 6276df3: Refactoring fetch for NextJS Compatiblity

  ## Breaking Changes

  Pretty much all API changed to be fetch agnostic. Since cross-fetch was removed, ts-ghost now assumes you bring your own fetch. Using the API with NextJS we noticed that the admin queries were not cached effectively, because the signature of the cache chnged due to the computed JWT token put in the Auth Header.

  Fetching is now encapsulated in a `HTTPClient` class that is created from the consumers (content-api, admin-api) one time. And a mechanism is in place to autoregenerate the token if it is expired (on the same object instance).

  This allows the users of the content and admin api clients to implement patterns where they instantiate one time the client and then will benefit from the cache as long as the token is valid.

  The signature of the APIComposer, all the Fetchers changed accordingly to accept the HTTPClient as a parameter. The logic of creating a correct URL is now encapsulated in the HTTPClient instead of the fetchers. Fetchers are responsible to create the correct body and query parameters and then delegates to the HTTPClient.

### Patch Changes

- Updated dependencies [6276df3]
  - @ts-ghost/core-api@5.0.1

## 3.0.0

### Major Changes

- [#69](https://github.com/PhilDL/ts-ghost/pull/69) [`59a8296`](https://github.com/PhilDL/ts-ghost/commit/59a8296a203b5862f757bf5fcdaaae04e21a2fe1) Thanks [@PhilDL](https://github.com/PhilDL)! - # Breaking changes: bring your own fetch

  With the goal of being fully NextJS compatible (and other frameworks that already polyfill fetch and sometimes augment it), we decided to remove the `cross-fetch` dependency from the packages.

  It is now the consummer duty to bring their own implementation of fetch.

  Requirements have been updated:

  - Node.js 16+
    - We rely on global `fetch` being available, so you can bring your own
      polyfill and if you run Node 16, you'll need to run with the
      `--experimental-fetch` flag enabled.

### Patch Changes

- Updated dependencies [[`59a8296`](https://github.com/PhilDL/ts-ghost/commit/59a8296a203b5862f757bf5fcdaaae04e21a2fe1)]:
  - @ts-ghost/core-api@5.0.0

## 2.2.1

### Patch Changes

- 0612b6c: Update posts/pages visibility property to accept "tiers" in its union of values.
- Updated dependencies [0612b6c]
  - @ts-ghost/core-api@4.2.1

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

  ```ts
  // example for the browse query (the data is an array of objects)
  const result:
    | {
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
      }
    | {
        status: "error";
        errors: {
          message: string;
          type: string;
        }[];
      };
  ```

  #### After

  ```ts
  // example for the browse query (the data is an array of objects)
  const result:
    | {
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
      }
    | {
        success: false;
        errors: {
          message: string;
          type: string;
        }[];
      };
  ```

  It is now easier to check if the result is a success or an error:

  ```ts
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
  const createNewMember = await api.members.add(
    { email: "abcdefgh@msn.com" },
    { send_email: true },
  );
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
