---
"@ts-ghost/core-api": major
---

## Breaking changes 
- identity id | slug | email is now passed as config schema to the QueryBuilder
- `output` option was removed because it is no longer necessary at the QueryBuilder level (kept on Fetchers)

```ts
import { QueryBuilder, type ContentAPICredentials } from "@ts-ghost/core-api";
import { z } from "zod";

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
const identitySchema = z.union([
  z.object({ slug: z.string() }), 
  z.object({ id: z.string() })
])

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
import { QueryBuilder, adminMembersSchema } from "@ts-ghost/core-api";
import { z } from "zod";

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