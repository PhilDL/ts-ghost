---
"@ts-ghost/core-api": minor
---

## Browse params `order` and `filter` can now use keys from include schema

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