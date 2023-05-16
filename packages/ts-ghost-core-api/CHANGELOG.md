# @ts-ghost/core-api

## 5.0.0

### Major Changes

- [#69](https://github.com/PhilDL/ts-ghost/pull/69) [`59a8296`](https://github.com/PhilDL/ts-ghost/commit/59a8296a203b5862f757bf5fcdaaae04e21a2fe1) Thanks [@PhilDL](https://github.com/PhilDL)! - # Breaking changes: bring your own fetch

  With the goal of being fully NextJS compatible (and other frameworks that already polyfill fetch and sometimes augment it), we decided to remove the `cross-fetch` dependency from the packages.

  It is now the consummer duty to bring their own implementation of fetch.

  Requirements have been updated:

  - Node.js 16+
    - We rely on global `fetch` being available, so you can bring your own
      polyfill and if you run Node 16, you'll need to run with the
      `--experimental-fetch` flag enabled.

## 4.2.1

### Patch Changes

- 0612b6c: Update posts/pages visibility property to accept "tiers" in its union of values.

## 4.2.0

### Minor Changes

- a37a8ec: Possibility to add options to edit method for content and admin API Clients.

## 4.1.0

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

## 4.0.0

### Major Changes

- b7d6fb5: ## Breaking changes

  - We modified the discriminator of all endpoints **result** discriminated union.
    Instead of being on the key `status` with values of `"success"` or `"error"`, it is now on the key `success` with values of `true` or `false`.

  ### Before:

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

  ### After

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

## 3.0.0

### Major Changes

- 82fb15f: # New features

  - `APIComposition` object has been added to compose API methods.
  - This new class has the old methods `browse` and `read` but also mutation methods:
    - `add`, `edit` and `delete`.
  - New fetchers have been added:
    - `MutationFetcher` used for `POST` and `PUT` verbs to Ghost API.
    - `DeleteFetcher`, used for `DELETE` operations
  - `APIComposition` exposes a new method `access` that lets you limit the accessible methods from `read`, `browse`, `add`, `edit` and `delete`.

  ```ts
  import { APIComposer, type ContentAPICredentials } from "@ts-ghost/core-api";

  const api: ContentAPICredentials = {
    url: "https://ghost.org",
    key: "1234",
    version: "v5.0",
    resource: "posts",
    endpoint: "content",
  };

  const simplifiedSchema = z.object({
    id: z.string(),
    foo: z.string(),
    bar: z.string(),
    baz: z.boolean().optional(),
    count: z.number().optional(),
  });

  const simplifiedIncludeSchema = z.object({
    count: z.literal(true).optional(),
    "count.posts": z.literal(true).optional(),
  });

  const identitySchema = z.union([
    z.object({ id: z.string() }),
    z.object({ slug: z.string() }),
    z.object({ email: z.string() }),
  ]);

  const createSchema = z.object({
    foo: z.string(),
    bar: z.string().nullish(),
    baz: z.boolean().nullish(),
  });

  const composer = new APIComposer(
    {
      schema: simplifiedSchema,
      identitySchema: identitySchema,
      include: simplifiedIncludeSchema,
      // optional
      createSchema,
      // optional
      createOptionsSchema: z.object({
        option_1: z.boolean(),
      }),
    },
    api
  );

  const res = await composer
    .browse({
      limit: 10,
      page: 2,
    })
    .fetch();
  ```

  You can also limit the accessible methods from `read`, `browse`, `add`, `edit` and `delete`:

  ```ts
  const composer = new APIComposer(
    {
      schema: simplifiedSchema,
      identitySchema: identitySchema,
      include: simplifiedIncludeSchema,
      // optional
      createSchema,
      // optional
      createOptionsSchema: z.object({
        option_1: z.boolean(),
      }),
    },
    api
  );

  const composedAPI = composer.access(["read", "browse]);

  composedAPI.browse({ limit: 10, page: 2 }).fetch();
  composedAPI.read({ id: "1234" }).fetch();

  // TS error and Runtime error `add` doesn't exist
  composedAPI.add({ foo: "bar" }).fetch();
  ```

  # Breaking changes

  `QueryBuilder` has been removed in favor of a global `APIComposition` object. This object is used to compose API methods and is available in the `API` class.

  You can simply update your code by replacing `QueryBuilder` with `APIComposition`:

  ## Before

  ```ts
  return new QueryBuilder(
    {
      schema: adminPostsSchema,
      identitySchema: slugOrIdSchema,
      include: postsIncludeSchema,
    },
    api
  );
  ```

  ## After

  You can switch in place `QueryBuilder` for `APIComposer`, and limit `access` to `read` and `browse`:

  ```ts
  import { APIComposer } from "@ts-ghost/core-api";
  // ...
  return new APIComposer(
    {
      schema: adminPostsSchema,
      identitySchema: slugOrIdSchema,
      include: postsIncludeSchema,
    },
    api
  ).access(["read", "browse"]);
  ```

## 2.0.1

### Patch Changes

- d78279e: Allow options to be passed to fetch

## 2.0.0

### Major Changes

- 6a55476: ## Breaking changes

  - identity id | slug | email is now passed as config schema to the QueryBuilder
  - `output` option was removed because it is no longer necessary at the QueryBuilder level (kept on Fetchers)

  ```ts
  import { z } from "zod";
  import { QueryBuilder, type ContentAPICredentials } from "@ts-ghost/core-api";

  const api: ContentAPICredentials = {
    url: "https://ghost.org",
    key: "7d2d15d7338526d43c2fadc47c",
    version: "v5.0",
    resource: "posts",
  };

  const simplifiedSchema = z.object({
    title: z.string(),
    slug: z.string(),
    count: z.number().optional(),
  });

  // the "identity" schema is used to validate the inputs of the `read`method of the QueryBuilder
  const identitySchema = z.union([z.object({ slug: z.string() }), z.object({ id: z.string() })]);

  const simplifiedIncludeSchema = z.object({
    count: z.literal(true).optional(),
  });

  const qb = new QueryBuilder(
    { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
    api
  );
  ```

  ## Refactoring

  - It is now easier to extends `QueryBuilder` and `Fetcher` classes as `any` is passed as generics defaults.

  Example:

  ```ts
  import { z } from "zod";
  import { adminMembersSchema, QueryBuilder } from "@ts-ghost/core-api";

  const membersIncludeSchema = z.object({});
  const queryIdentitySchema = z.object({
    id: z.string(),
  });
  export class MemberQueryBuilder<
    Shape extends typeof adminMembersSchema.shape,
    Identity extends typeof queryIdentitySchema,
    IncludeShape extends typeof membersIncludeSchema.shape
  > extends QueryBuilder<Shape, Identity, IncludeShape> {
    // ...
  }
  ```

  ## Add tests

  - added more tests for better coverage

### Patch Changes

- 6a55476: ## Upgraded dependencies and add more tests

  - Reflect changes made to `ts-ghost/core-api`
  - Added more tests

## 1.1.6

### Patch Changes

- 507b16a: ## Changes

  - Update the TS definition of `APIVersion` to accept only `v5.x` for now.
  - Updated the corresponding zod schema to have regex validation.
  - Updated documentation to give info about the supported versions

## 1.1.5

### Patch Changes

- ad2f099: fix identity field with email on readFetcher

## 1.1.4

### Patch Changes

- 31ea021: upgrade dependencies

## 1.1.3

### Patch Changes

- ec888e3: fix identity field "email"

## 1.1.2

### Patch Changes

- 3e0dd53: switch to jose instead of jsonwebtoken

## 1.1.1

### Patch Changes

- 55acb51: Upgrade dependencies

## 1.1.0

### Minor Changes

- b3db55b: ## Browse params `order` and `filter` can now use keys from include schema

  It is now possible to use keys from the include schema in the `order` and `filter` params of the browse endpoint.

  ```ts
  await api.tags.browse({
    order: "count.post DESC",
  });
  ```

  ## Improved accuracy of Post schema

  - `published_at` is now nullable instead of nullish
  - `excerpt` is now nullable instead of nullish

  ## Utility types

  Add utility types to get the Output Data part of a schema.

  ### Extract Data Output `InferResponseDataShape`

  If you need to extract the `data` key of a successful Response (`status` is `success`), you can use `InferResponseDataShape`.

  ```ts
  const res = await api.posts
    .read({
      slug: "my-blog-post",
    })
    .fields({ slug: true, html: true, tags: true })
    .include({ tags: true })
    .fetch();

  type SimplifiedBlogPost = InferResponseDataShape<typeof res>;
  ```

  ### Predict Fetcher Output `InferFetcherDataShape`

  Given a fetcher, it will predict the data shape type, before calling `fetch()` or `paginate()`

  ```ts
  const exampleQuery = api.users.read({ id: "1" }).fields({ id: true, name: true, email: true });
  export type ExampleQueryOutput = InferFetcherDataShape<typeof exampleQuery>;
  ```

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
