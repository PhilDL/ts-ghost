---
"@ts-ghost/content-api": major
"@ts-ghost/admin-api": major
---

## Breaking changes

### `@ts-ghost/content-api` and `@ts-ghost/admin-api`

- There was an underlying change in the `@ts-ghost/core-api` modifying the discriminator of all endpoints **result**.
  Instead of being on the key `status` with values of `"success"` or `"error"`, it is now on the key `success` with values of `true` or `false`.

#### Before:

```typescript
// example for the browse query (the data is an array of objects)
const result: {
    status: "success";
    data: Post[];
    meta: {
        pagination: {
            pages: number;
            limit: number;
            page: number;
            total: number;
            prev: number | null;
            next: number | null;
        };
    };
} | {
    status: "error";
    errors: {
        message: string;
        type: string;
    }[];
}
```

#### After

```typescript
// example for the browse query (the data is an array of objects)
const result: {
    success: true;
    data: Post[];
    meta: {
        pagination: {
            pages: number;
            limit: number;
            page: number;
            total: number;
            prev: number | null;
            next: number | null;
        };
    };
} | {
    success: false;
    errors: {
        message: string;
        type: string;
    }[];
}
```

It is now easier to check if the result is a success or an error:

```typescript
if (result.success) {
  // do something with result.data
} else {
  // do something with result.errors
}
```

## New features

### `@ts-ghost/admin-api` New endpoints actions available:

- [x] `members` now have`delete` method. Even if not defined in the Ghost documentation it is indeed avaiable
- [x] `posts` now have `add`, `edit`, and `delete` methods.
- [x] `pages` now have `add`, `edit`, and `delete` methods.
- [x] `tiers` have schema defined but no mutation method exposed as they don't work on Ghost API
- [x] `newsletter` now have `add`, and `edit` methods. The deletion is done via setting `{status: "archived"}` through `edit`, it is a soft delete.
- [x] `tags` now have `add`, `edit`, and `delete` methods.
- [x] `offers`now have `add`, and `edit` methods. The deletion is done via setting `{status: "archived"}` through `edit`, it is a soft delete.
- [x] new resource: `webhooks` with `add`, `edit` and `delete` methods.
