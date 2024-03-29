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

### Requirements

This client is only compatible with Ghost versions 5.x for now.

- Ghost 5^

- Node.js 16+
  - We rely on global `fetch` being available, so you can bring your own
    polyfill and if you run Node 16, you'll need to run with the
    `--experimental-fetch` flag enabled.

## APIComposer

The APIComposer is a class that helps you build the target API avec the available methods for a resource based on a combinations of ZodSchema. This APIComposer exposes 5 methods:

- `read` to fetch a single record and
- `browse` to fetch multiple records.
- `add` to create a record.
- `edit` to update a record.
- `delete` to delete a record.

All these methods like `read` and `browse` gives you back the appropriate `Fetcher` instance that will handle the actual request to the API with the correct parameters.

`APIComposer` will handle type-safety of the query parameters and will return the appropriate fetcher and will pass along the correct output type based on the `ZodSchema` you instantiate it with. For the query methods like `browse` and `read`, this output schema will be modified if required when you select specific fields, includes etc.

### Instantiation

```ts
import { z } from "zod";
import { APIComposer, type ContentAPICredentials } from "@ts-ghost/core-api";

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

// the "identity" schema is used to validate the inputs of the `read`method of the APIComposer
const identitySchema = z.union([z.object({ slug: z.string() }), z.object({ id: z.string() })]);

// the "include" schema is used to validate the "include" parameters of the API call
// it is specific to the Ghost API resource targeted.
// The format is always { 'name_of_the_field': true }
const simplifiedIncludeSchema = z.object({
  count: z.literal(true).optional(),
});

const createSchema = z.object({
  foo: z.string(),
  bar: z.string().nullish(),
  baz: z.boolean().nullish(),
});

const composedAPI = new APIComposer(
  {
    schema: simplifiedSchema,
    identitySchema: identitySchema,
    include: simplifiedIncludeSchema,
    createSchema: createSchema,
    createOptionsSchema: z.object({
      option_1: z.boolean(),
    }),
  },
  api
);
```

- `identitySchema` can be any `ZodType` and can also be an empty `z.object({})` if you don't need the `read` method.
- `include` is a `ZodObject` that will validate the `include` parameters of the API call. It is specific to the Ghost API resource targeted. The format is always `{ 'name_of_the_field': true }`
- `createSchema` (Optional) is a Zod Schema that will validate the input of the `add` method of the APIComposer.
  - `add` will take exactly the schema to parse
- `createOptionsSchema` (Optional) is a Zod Schema that will validate options that are going to be passed as query parameters to the `POST` url.
- `updateSchema` (Optional) is a Zod Schema that will validate the input of the `edit` method of the APIComposer.
  - `edit` will fallback to a `ZodPartial` (all fields are optional) version of the `createSchema` if `updateSchema` is not provided.

### Building Queries

After instantiation you can use the `APIComposer` to build your queries with 2 available methods.
The `browse` and `read` methods accept a config object with 2 properties: `input` and an `output`. These params mimic the way Ghost API Content is built but with the power of Zod and TypeScript they are type-safe here.

```ts
import { z } from "zod";
import { APIComposer, type ContentAPICredentials } from "@ts-ghost/core-api";

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
const identitySchema = z.union([z.object({ slug: z.string() }), z.object({ id: z.string() })]);
const simplifiedIncludeSchema = z.object({
  count: z.literal(true).optional(),
});

const composedAPI = new APIComposer(
  { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
  api
);
let query = composedAPI.browse({
  limit: 5,
  order: "title DESC",
  //      ^? the text here will throw a TypeScript lint error if you use unknown field.
  //      In that case `title` is  correctly defined in the `simplifiedSchema
});
```

- browse parameters are `page`, `limit`, `order`, `filter`. And read parameters are `id` or `slug`.

#### Method options

#### `.browse` options

Input are totally optionals on the `browse` method but they let you filter and order your search.

This is an example containing all the available keys in the `input` object

```ts
const composedAPI = new APIComposer(
  { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
  api
);
let query = composedAPI.browse({
  page: 1,
  limit: 5,
  filter: "title:typescript+slug:-test",
  order: "title DESC",
});
```

These browse params are then parsed through a `Zod` Schema that will validate all the fields.

- `page:number` The current page requested
- `limit:number` Between 0 and 15 (limitation of the Ghost API)
- `filter:string` Contains the filter with [Ghost API `filter` syntax](https://ghost.org/docs/content-api/#filtering).
- `order:string` Contains the name of the field and the order `ASC` or `DESC`.

For the `order` and `filter` if you use fields that are not present on the schema (for example `name` on a `Post`) then the APIComposer will throw an Error with message containing the unknown field.

#### `.read` options

Read is meant to be used to fetch 1 object only by `id` or `slug`.

```ts
const composedAPI = new APIComposer(
  { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
  api
);
let query = composedAPI.read({
  id: "edHks74hdKqhs34izzahd45"
});

// or

let query = composedAPI.read({
  slug: "typescript-is-awesome-in-2025"
});
```

You can submit **both** `id` and `slug`, but the fetcher will then chose the `id` in priority if present to make the final URL query to the Ghost API.

## Query Fetchers

If the parsing went okay, the `read` and `browse` methods from the `APIComposer` will return the associated `Fetcher`.

- `BrowseFetcher` for the `browse` method
- `ReadFetcher` for the `read` method
- `BasicFetcher` is a special case when you don't need a APIComposer at all and want to fetch directly.

Fetchers are instatiated automatically after using `read` or `browse` but these Fetchers can also be instantiated in isolation, in a similar way as the APIComposer with a `config` containing the same schemas. But also a set of params
necessary to build the URL to the Ghost API.

```ts
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

_The option `output` schema will be modified along the way after the params like `fields`, `formats`, `include` are added to the query. At instantiation it will most likely be the same as the original schema._

These fetchers have a `fetch` method that will return a discriminated union of 2 types:

```ts
const composedAPI = new APIComposer(
  { schema: simplifiedSchema, output: simplifiedSchema, include: simplifiedIncludeSchema },
  api
);
const readFetcher = composedAPI.read({ slug: "typescript-is-cool" });
let result = await readFetcher.fetch();
if (result.success) {
  const post = result.data;
  //     ^? type {"slug":string; "title": string}
} else {
  // errors array of objects
  console.log(result.errors.map((e) => e.message).join("\n"));
}
```

### Read Fetcher

After using `.read` query, you will get a `ReadFetcher` with an `async fetch` method giving you a discriminated union of 2 types:

```ts
// example for the read query (the data is an object)
const result: {
    status: true;
    data: z.infer<typeof simplifiedSchema>; // parsed by the Zod Schema and modified by the fields selected
} | {
    status: false;
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

```ts
// example for the browse query (the data is an array of objects)
const result: {
    success: true;
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
    success: false;
    errors: {
        message: string;
        type: string;
    }[];
}
```

#### Browse `.paginate()`

```ts
const result: {
    success: true;
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
    success: false;
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

```ts
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
let result = await browseFetcher
  .fields({
    slug: true,
    title: true,
    // ^? available fields come form the `simplifiedSchema` passed in the constructor
  })
  .fetch();

if (result.success) {
  const post = result.data;
  //     ^? type {"slug":string; "title": string}
}
```

The **output schema** will be modified to only have the fields you selected and TypeScript will pick up on that to warn you if you access non-existing fields.

### `include`

The `include` method lets you include some additionnal data that the Ghost API doesn't give you by default. This `include` key is specific to each resource and is defined in the `Schema` of the resource. You will have to let TypeScript guide you to know what you can include.

```ts
const bf = new BrowseFetcher(
  { schema: simplifiedSchema, output: simplifiedSchema, include: simplifiedIncludeSchema },
  {},
  api
);
let result = await bf
  .include({
    count: true,
  })
  .fetch();
```

The output type will be modified to make the fields you include **non-optionals**.

### `formats`

The `formats` method lets you include some additionnal formats that the Ghost API doesn't give you by default. This is used on the `Post` and `Page` resource to retrieve the content in plaintext, html, or mobiledoc format. The available keys are `html | mobiledoc | plaintext` and the value is a boolean to indicate if you want to include it or not.

```ts
const bf = new BrowseFetcher(
  { schema: simplifiedSchema, output: simplifiedSchema, include: simplifiedIncludeSchema },
  {},
  api
);
let result = await bf
  .formats({
    html: true,
    plaintext: true,
  })
  .fetch();
```

The output type will be modified to make the fields `html` and `plaintext` **non-optionals**.

### Chaining methods

You can chain the methods to select the fields, formats, and include you want.

```ts
const bf = new BrowseFetcher(
  { schema: simplifiedSchema, output: simplifiedSchema, include: simplifiedIncludeSchema },
  {},
  api
);
let result = await bf
  .fields({
    slug: true,
    title: true,
    html: true,
    plaintext: true,
    count: true,
  })
  .formats({
    html: true,
    plaintext: true,
  })
  .include({
    count: true,
  })
  .fetch();
```

### `fetch` options

You can pass an optional `options` object to the `fetch` and `paginate` method. The `options` object is the standard `RequestInit` object from the `fetch` API.

```ts
let result = await api.posts.read({ slug: "typescript-is-cool" }).fetch({ cache: "no-store" });
```

_This may be useful if you use NextJS augmented `fetch`!_

## Mutations

These mutations are async methods, they will return a `Promise` that will resolve to the parsed result.

#### Create record

```ts
const composedAPI = new APIComposer(
  {
    schema: simplifiedSchema,
    identitySchema: identitySchema,
    include: simplifiedIncludeSchema,
    createSchema: createSchema,
    createOptionsSchema: z.object({
      option_1: z.boolean(),
    }),
  },
  api
);
let newPost = await composedAPI.add(
  {
    title: "My new post",
  },
  {
    option_1: true,
  }
);
```

- The first argument is the `input` object that will be parsed and typed with the `createSchema` schema.
- The second argument is the `options` object that will be parsed and typed with the `createOptionsSchema` schema.

The result will be parsed and typed with the `output` schema and represent the newly created record.

```ts
// return from the `add` method
const result: {
    success: true;
    data: z.infer<typeof simplifiedSchema>; // parsed by the Zod Schema given in the config
} | {
    success: false;
    errors: {
        message: string;
        type: string;
    }[];
}
```

#### Edit record

Edit requires the `id` of the record to edit.

```ts
let newPost = await composedAPI.edit("edHks74hdKqhs34izzahd45", {
  title: "My new post",
});
```

The result will be parsed and typed with the `output` schema and represent the updated record.

- The first argument is the `id` of the record to edit.
- The second argument is the `input` object that will be parsed and typed with the `createSchema` schema wrapped with Partial. So all fields are optional.

```ts
// return from the `edit` method
const result: {
    success: true;
    data: z.infer<typeof simplifiedSchema>; // parsed by the Zod Schema given in the config
} | {
    success: false;
    errors: {
        message: string;
        type: string;
    }[];
}
```

#### Delete record

Delete requires the `id` of the record to delete.

```ts
let newPost = await composedAPI.edit("edHks74hdKqhs34izzahd45", {
  title: "My new post",
});
```

- The first argument is the `id` of the record to delete.

The response will not contain any data since Ghost API just return a 204 empty response. You will have to check the discriminator `success` to know if the deletion was successful or not.

```ts
// return from the `delete` method
const result: {
    success: true;
} | {
    success: false;
    errors: {
        message: string;
        type: string;
    }[];
}
```

## Roadmap

- [x] Handling POST, PUT and DELETE requests.
- [x] Writing examples documentation for mutations.

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

- If you have suggestions for adding or removing projects, feel free to [open an issue](https://github.com/PhilDL/ts-ghost/issues/new) to discuss it, or directly create a pull request after you edit the _README.md_ file with necessary changes.
- Please make sure you check your spelling and grammar.
- Create individual PR for each suggestion.
- Please also read through the [Code Of Conduct](https://github.com/PhilDL/ts-ghost/blob/main/CODE_OF_CONDUCT.md) before posting your first idea as well.

## License

Distributed under the MIT License. See [LICENSE](https://github.com/PhilDL/ts-ghost/blob/main/LICENSE.md) for more information.

## Authors

- **[PhilDL](https://github.com/PhilDL)** - _Creator_

## Acknowledgements

- [Ghost](https://ghost.org/) is the best platform for blogging 💖 and have a good JS Client library that was a real inspiration.
- [Zod](https://github.com/colinhacks/zod) is a TypeScript-first library for data validation and schema building.
