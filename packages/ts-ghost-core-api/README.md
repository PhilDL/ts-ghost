<br/>
<br/>

<div align="center">
  <a href="https://github.com/PhilDL/ts-ghost">
    <img src="https://user-images.githubusercontent.com/4941205/221607740-28ce02cb-da96-4e34-a40d-8163bb7c668f.png" alt="Logo" width="auto" height="80">
  </a>

  <h3 align="center"><code>@ts-ghost/core-api</code></h3>

  <p align="center">
    <code>@ts-ghost/core-api</code> is a building block used by the `@ts-ghost/content-api` it contains the Type-safe logic of Query Builder and Fetchers.
    <br/>
    <br/>
  </p>
</div>

[![tests](https://github.com/PhilDL/ts-ghost/actions/workflows/deploy.yml/badge.svg)](https://github.com/PhilDL/ts-ghost/actions/workflows/deploy.yml) ![License](https://img.shields.io/github/license/PhilDL/ts-ghost) <img alt="GitHub package.json version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/v/PhilDL/ts-ghost?filename=packages%2Fts-ghost-core-api%2Fpackage.json">

## About The Project

`@ts-ghost/core-api` contains the core building blocks for the `@ts-ghost/content-api` package. It contains the Type-safe logic of Query Builder and Fetchers. Unless you are building a new package for `@ts-ghost` you should not need to use this package directly.

## Install

```shell
pnpm i @ts-ghost/core-api
```

### Compatible Ghost versions.
This client is only compatible with Ghost versions 5.x for now.
- Ghost 5^


## QueryBuilder

A QueryBuilder is a class that helps you build a query based on a a combinations of ZodSchema. This QueryBuilder exposes 2 methods `read` to fetch a single record and `browse` to fetch multiple records. `read` and `browse` gives you back the appropriate `Fetcher` instance that will handle the actual request to the API with the correct parameters.

`QueryBuilder` will handle type-safety of the query parameters and will return the appropriate type based on the `ZodSchema` you pass to it. eg: if you pass the `fields` parameters that "select" fields you want to be present on the response instead of the whole object, then the output schema of the QueryBuilder will change. And then passed to the fetcher to validate data.

### Instantiation

```ts
import type { ContentAPICredentials } from "../schemas";
import { QueryBuilder } from "./query-builder";
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

// the "include" schema is used to validate the "include" parameters of the API call
// it is specific to the Ghost API resource targeted.
// The format is always { 'name_of_the_field': true }
const simplifiedIncludeSchema = z.object({
  count: z.literal(true).optional(),
});

const qb = new QueryBuilder(
  { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
  api
);
```
- `identitySchema` can be any `ZodType` and can also be an empty `z.object({})` if you don't need the `read` method.
- `include` is a `ZodObject` that will validate the `include` parameters of the API call. It is specific to the Ghost API resource targeted. The format is always `{ 'name_of_the_field': true }`


### Building Queries

After instantiation you can use the `QueryBuilder` to build your queries with 2 available methods. 
The `browse` and `read` methods accept a config object with 2 properties: `input` and an `output`. These params mimic the way Ghost API Content is built but with the power of Zod and TypeScript they are type-safe here.

```typescript
import { QueryBuilder, type ContentAPICredentials } from "@ts-ghost/core-api";
import { z } from "zod";
const api: ContentAPICredentials = { url: "https://ghost.org", key: "7d2d15d7338526d43c2fadc47c", version: "v5.0", resource: "posts",};

const simplifiedSchema = z.object({
  title: z.string(),
  slug: z.string(),
  count: z.number().optional(),
});
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
let query = qb.browse({
  limit: 5,
  order: "title DESC"
  //      ^? the text here will throw a TypeScript lint error if you use unknown field.
  //      In that case `title` is  correctly defined in the `simplifiedSchema
});
```

- browse parameters are `page`, `limit`, `order`, `filter`. And read parameters are `id` or `slug`.

## Method options

### `.browse` options

Input are totally optionals on the `browse` method but they let you filter and order your search.

This is an example containing all the available keys in the `input` object

```typescript
const qb = new QueryBuilder(
  { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
  api
);
let query = qb.browse({
  page: 1,
  limit: 5,
  filter: "title:typescript+slug:-test",
  order: "title DESC"
});
```
These browse params are then parsed through a `Zod` Schema that will validate all the fields.

- `page:number` The current page requested
- `limit:number` Between 0 and 15 (limitation of the Ghost API)
- `filter:string` Contains the filter with [Ghost API `filter` syntax](https://ghost.org/docs/content-api/#filtering).
- `order:string` Contains the name of the field and the order `ASC` or `DESC`.

For the `order` and `filter` if you use fields that are not present on the schema (for example `name` on a `Post`) then the QueryBuilder will throw an Error with message containing the unknown field.

### `.read` options
Read is meant to be used to fetch 1 object only by `id` or `slug`. 

```typescript
const qb = new QueryBuilder(
  { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
  api
);
let query = qb.read({
  id: "edHks74hdKqhs34izzahd45"
}); 

// or 

let query = qb.read({
  slug: "typescript-is-awesome-in-2025"
}); 
```

You can submit **both** `id` and `slug`, but the fetcher will then chose the `id` in priority if present to make the final URL query to the Ghost API.

## Fetchers 

If the parsing went okay, the `read` and `browse` methods from the `QueryBuilder` will return the associated `Fetcher`. 

- `BrowseFetcher` for the `browse` method
- `ReadFetcher` for the `read` method
- `BasicFetcher` is a special case when you don't need a QueryBuilder at all and want to fetch directly. 

Fetchers are instatiated automatically after using `read` or `browse` but these Fetchers can also be instantiated in isolation, in a similar way as the QueryBuilder with a `config` containing the same schemas. But also a set of params 
necessary to build the URL to the Ghost API.

```typescript
import { BrowseFetcher } from "@ts-ghost/core-api";
// Example of instantiating a Fetcher, even though you will probably not do it
const browseFetcher = new BrowseFetcher(
  {
    schema: simplifiedSchema,
    output: simplifiedSchema,
    include: simplifiedIncludeSchema,
  },
  {
    browseParams: {
      limit: 1,
    },
  },
  api
);
```
*The option `output` schema will be modified along the way after the params like `fields`, `formats`, `include` are added to the query. At instantiation it will most likely be the same as the original schema.*

These fetchers have a `fetch` method that will return a discriminated union of 2 types:


```typescript
const qb = new QueryBuilder(
  { schema: simplifiedSchema, output: simplifiedSchema, include: simplifiedIncludeSchema },
  api
);
const readFetcher = qb.read({ slug: "typescript-is-cool" });
let result = await readFetcher.fetch();
if (result.status === 'success') {
  const post = result.data;
  //     ^? type {"slug":string; "title": string}
} else {
  // errors array of objects
  console.log(result.errors.map(e => e.message).join('\n'))
}
```

### Read Fetcher 

After using `.read` query, you will get a `ReadFetcher` with an `async fetch` method giving you a discriminated union of 2 types:

```typescript
// example for the read query (the data is an object)
const result: {
    status: "success";
    data: z.infer<typeof simplifiedSchema>; // parsed by the Zod Schema and modified by the fields selected
} | {
    status: "error";
    errors: {
        message: string;
        type: string;
    }[];
}
```

### Browse Fetcher

After using `.read` query, you will get a `BrowseFetcher` with 2 methods:
- `async fetch`
- `async paginate`

#### Browse `.fetch()` 

That result is a discriminated union of 2 types:
```typescript
// example for the browse query (the data is an array of objects)
const result: {
    status: "success";
    data: z.infer<typeof simplifiedSchema>[];
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

#### Browse `.paginate()`
```typescript
const result: {
    status: "success";
    data: z.infer<typeof simplifiedSchema>[];
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
    next: BrowseFetcher | undefined; // the next page fetcher if it is defined
} | {
    status: "error";
    errors: {
        message: string;
        type: string;
    }[];
    next: undefined; // the next page fetcher is undefined here
}
```

Here you can use the `next` property to get the next page fetcher if it is defined.


## Modifiying Fetchers output by selecting fields, formats, include

Output can be modified on the `BrowseFetcher` and the `ReadFetcher` through available methods:
- `.fields`
- `.formats`
- `.include`

### `.fields()` 

The `fields` methods lets you change the output of the result to have only your selected fields, it works by giving the property key and the value `true` to the field you want to keep. Under the hood it will use the `zod.pick` method to pick only the fields you want.

```typescript
import { BrowseFetcher } from "@ts-ghost/core-api";
// Example of instantiating a Fetcher, even though you will probably not do it
const browseFetcher = new BrowseFetcher(
  {
    schema: simplifiedSchema,
    output: simplifiedSchema,
    include: simplifiedIncludeSchema,
  },
  {
    browseParams: {
      limit: 1,
    },
  },
  api
);
let result = await browseFetcher.fields({
  slug: true,
  title: true
  // ^? available fields come form the `simplifiedSchema` passed in the constructor
}).fetch();

if (result.status === 'success') {
  const post = result.data;
  //     ^? type {"slug":string; "title": string}
}
```
The **output schema** will be modified to only have the fields you selected and TypeScript will pick up on that to warn you if you access non-existing fields.

### `include`
The `include` method lets you include some additionnal data that the Ghost API doesn't give you by default. This `include` key is specific to each resource and is defined in the `Schema` of the resource. You will have to let TypeScript guide you to know what you can include.

```typescript
const bf = new BrowseFetcher(
  { schema: simplifiedSchema, output: simplifiedSchema, include: simplifiedIncludeSchema },
  {},
  api
);
let result = await bf.include({
  "count": true,
}).fetch();
```

The output type will be modified to make the fields you include **non-optionals**.

### `formats`
The `formats` method lets you include some additionnal formats that the Ghost API doesn't give you by default. This is used on the `Post` and `Page` resource to retrieve the content in plaintext, html, or mobiledoc format. The available keys are `html | mobiledoc | plaintext` and the value is a boolean to indicate if you want to include it or not.

```typescript
const bf = new BrowseFetcher(
  { schema: simplifiedSchema, output: simplifiedSchema, include: simplifiedIncludeSchema },
  {},
  api
);
let result = await bf.formats({
  "html": true,
  "plaintext": true,
}).fetch();
```
The output type will be modified to make the fields `html` and `plaintext` **non-optionals**.

### Chaining methods

You can chain the methods to select the fields, formats, and include you want.

```typescript
const bf = new BrowseFetcher(
  { schema: simplifiedSchema, output: simplifiedSchema, include: simplifiedIncludeSchema },
  {},
  api
);
let result = await bf.fields({
  slug: true,
  title: true,
  html: true,
  plaintext: true,
  count: true
}).formats({
  "html": true,
  "plaintext": true,
}).include({
  "count": true,
}).fetch();
```

## Roadmap

- Handling POST, PUT and DELETE requests.

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.
* If you have suggestions for adding or removing projects, feel free to [open an issue](https://github.com/PhilDL/ts-ghost/issues/new) to discuss it, or directly create a pull request after you edit the *README.md* file with necessary changes.
* Please make sure you check your spelling and grammar.
* Create individual PR for each suggestion.
* Please also read through the [Code Of Conduct](https://github.com/PhilDL/ts-ghost/blob/main/CODE_OF_CONDUCT.md) before posting your first idea as well.


## License

Distributed under the MIT License. See [LICENSE](https://github.com/PhilDL/ts-ghost/blob/main/LICENSE.md) for more information.

## Authors

* **[PhilDL](https://github.com/PhilDL)** - *Creator*

## Acknowledgements

* [Ghost](https://ghost.org/) is the best platform for blogging 💖 and have a good JS Client library that was a real inspiration.
* [Zod](https://github.com/colinhacks/zod) is a TypeScript-first library for data validation and schema building.
