---
"@ts-ghost/core-api": major
---

## Breaking Changes

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
    order: "title DESC"
  },
  output: {
    include: {
      count: true,
    },
  },
});

let readQuery = qb.read({
  input: {
    slug: "test-post"
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
let browseQuery = qb.browse({
  limit: 5,
  order: "title DESC"
}).include({count: true});

let readQuery = qb.read({
  slug: "test-post",
}).fields({
  slug: true,
  count: true,
});
```

## Other changes

- Updated documentation
- Code cleanup