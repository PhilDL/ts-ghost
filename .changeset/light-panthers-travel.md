---
"@ts-ghost/content-api": minor
"@ts-ghost/admin-api": minor
"@ts-ghost/core-api": minor
"@ts-ghost/ghost-blog-buster": minor
---

### Minor changes:

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
