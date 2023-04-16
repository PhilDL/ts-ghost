---
"@ts-ghost/core-api": major
---

## Breaking changes

- We modified the discriminator of all endpoints **result** discriminated union.
  Instead of being on the key `status` with values of `"success"` or `"error"`, it is now on the key `success` with values of `true` or `false`.

### Before:

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

### After

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
