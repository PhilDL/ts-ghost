---
"@ts-ghost/admin-api": minor
---

## Changes `admin-api`

The "include" schema of the `posts` and `pages` have been updated to allow including `tiers` to the response.

```ts
const res = await api.posts
  .read({ slug: "create-field-widget-in-owl-odoo-16" })
  .include({ tags: true, authors: true, tiers: true })
  //                                     ^ Include tiers
  .formats({ html: true })
  .fetch();
```
