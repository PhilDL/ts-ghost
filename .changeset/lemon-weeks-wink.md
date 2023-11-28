---
"@ts-ghost/admin-api": major
---

Posts/Pages upgrade: Lexical format as default, handling options (newsletter, source:html, etc) for create/edit mutations.

### `lexical` format availability on posts/pages

- `lexical` format is now available when using the transform `formats` method

```ts
const result = await api.posts
  .browse({
    limit: 1,
  })
  .formats({ html: true, plaintext: true })
  .fetch();
```

- `lexical` is now the default key returned on posts/page in `admin-api` instead of `html` to take into consideration recent Ghost API changes. To explicitely request `html` you have to specify it in the `formats` object parameter.

### Posts/Page Admin API Edit/Create with `source` option

Using the new `updateOptionSchema` from the core API, the Posts and Pages resource now have optional parameters. Begining with `source`.

**Ghost API now expects `lexical` formatted content by default** so you have to specify `{ source: "html" }` now to keep being able to send html via the API.

```ts
const postAdd = await api.posts.add(
  {
    title: title,
    html: "<p>Hello from ts-ghost</p>",
    tags: [{ name: "ts-ghost" }],
    tiers: [{ name: "ts-ghost" }],
    custom_excerpt: "This is custom excerpt from ts-ghost",
    meta_title: "Meta Title from ts-ghost",
    meta_description: "Description from ts-ghost",
    featured: true,
    og_title: "OG Title from ts-ghost",
    og_description: "OG Description from ts-ghost",
    twitter_title: "Twitter Title from ts-ghost",
    twitter_description: "Twitter Description from ts-ghost",
    visibility: "public",
  },
  { source: "html" },
);
```

### Posts/Page Admin API Editoptions

Missing options were added to Post and Page **edit**

```ts
api.posts.edit(
  newPost.id,
  {
    status: "published",
    updated_at: new Date(newPost.updated_at || ""),
  },
  { newsletter: "weekly-newsletter" },
);
```

Other options are available to reflect Ghost api changes:

```ts
newsletter: z.string().optional(),
email_segment: z.string().optional(),
force_rerender: z.boolean().optional(),
save_revision: z.boolean().optional(),
convert_to_lexical: z.boolean().optional(),
source: z.literal("html").optional(),
```
