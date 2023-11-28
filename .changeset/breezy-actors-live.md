---
"@ts-ghost/core-api": minor
---

### Add updateOptionsSchema to the APIComposer

Resource can now declare an updateOptionsSchema to indicates that some query params are available only when doing update operations.

For example, in the Admin API:

```ts
return new APIComposer(
    "posts",
    {
    schema: adminPostsSchema,
    identitySchema: slugOrIdSchema,
    include: postsIncludeSchema,
    createSchema: adminPostsCreateSchema,
    updateSchema: adminPostsUpdateSchema,
    updateOptionsSchema: z.object({
        newsletter: z.string().optional(),
        email_segment: z.string().optional(),
        force_rerender: z.boolean().optional(),
        save_revision: z.boolean().optional(),
        convert_to_lexical: z.boolean().optional(),
        source: z.literal("html").optional(),
    }),
    createOptionsSchema: z.object({
        source: z.literal("html").optional(),
    }),
    },
    this.httpClient,
).access(["browse", "read", "add", "edit", "delete"]);
```
