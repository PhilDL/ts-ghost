---
"@ts-ghost/core-api": major
"@ts-ghost/content-api": major
"@ts-ghost/admin-api": major
---

Migrate the published Ghost API libraries to Zod 4.

This is a breaking change for consumers that import or interact with the exported Zod schemas and types from these packages. Update consumer imports from `zod/v3` to `zod`.

The breaking cases are schema-level integrations, for example:

- importing exported schemas from these packages and composing, extending, refining, or parsing with Zod 3
- using `z.infer<typeof exportedSchema>` with a consumer-side Zod 3 import
- depending on declaration compatibility with Zod 3 types in downstream TypeScript code

`@ts-ghost/core-api` now uses Zod 4 across the schema, fetcher, and `APIComposer` layers, and also exports the debug option types used by the HTTP client and fetchers.

`@ts-ghost/content-api` and `@ts-ghost/admin-api` now build on the Zod 4 core package, so their exported schemas and types also reference Zod 4. Both API client constructors now accept optional debug options that are forwarded to the underlying HTTP client.

The runtime client API is not intended to change with this migration. The fetcher runtime contract for `fields`, `include`, and `formats` is preserved: unknown runtime keys are still ignored instead of throwing.
