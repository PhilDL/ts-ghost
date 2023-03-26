---
"@ts-ghost/content-api": major
"@ts-ghost/admin-api": major
---

## Breaking Changes

`@ts-ghost/core-api` QueryBuilder and Fetcher were updated so this package also sees its API updated. Now the resource only have input params, output is handled on the fetcher via the `fields`, `formats` and `include` methods.

### Before 

Given this queries in the old API
```ts
const posts = await api.posts.browse({
  input: {
    limit: 5,
    order: "title DESC"
  },
  output: {
    include: {
      authors: true,
    },
  },
}).fetch();

const onePost = await api.posts.read({
  input: {
    slug: "test-post"
  },
  output: {
    fields: {
      slug: true,
      html: true,
    },
  },
}).fetch();
```

### After

Rewritten in the new API version:

```ts
const posts = await api.posts
  .browse({
    limit: 5,
    order: "title DESC"
  })
  .include({
    authors: true,
  })
  .fetch();

const onePost = await api.posts
  .read({
    slug: "test-post"
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