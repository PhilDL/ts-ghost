---
"@ts-ghost/core-api": major
---
# New features

-   `APIComposition` object has been added to compose API methods.
-   This new class has the old methods `browse` and `read` but also mutation methods:
    -   `add`, `edit` and `delete`.
- New fetchers have been added:
    -   `MutationFetcher` used for `POST` and `PUT` verbs to Ghost API.
    -   `DeleteFetcher`, used for `DELETE` operations
-   `APIComposition` exposes a new method `access` that lets you limit the accessible methods from `read`, `browse`, `add`, `edit` and `delete`.

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

const res = await composer.browse({
  limit: 10,
  page: 2,
}).fetch();
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