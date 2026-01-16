---
"@ts-ghost/core-api": minor
"@ts-ghost/content-api": minor
"@ts-ghost/admin-api": minor
---

### New Feature: HTTP Status Codes in Error Responses

Error responses now include the HTTP status code, enabling smarter error handling and retry logic.

```typescript
const result = await api.posts.read({ slug: "this-slug-does-not-exist" }).fetch();
if (!result.success) {
  console.log(result.status); // 404
  console.log(result.errors); // [{ type: "NotFoundError", message: "..." }]
}
```

#### Gotchas

- Read with non-existent `id` returns 422 status code
- Read with non-existent `slug` returns 404 status code

This is a backwards-compatible change. Existing code continues to work without modification.
