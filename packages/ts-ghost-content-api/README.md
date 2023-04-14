<br/>
<br/>

<div align="center">
  <a href="https://github.com/PhilDL/ts-ghost">
    <img src="https://user-images.githubusercontent.com/4941205/221607740-28ce02cb-da96-4e34-a40d-8163bb7c668f.png" alt="Logo" width="auto" height="80">
  </a>

  <h3 align="center"><code>@ts-ghost/content-api</code></h3>

  <p align="center">
    <code>@ts-ghost/content-api</code> is a strongly-typed TypeScript client to interract with the Ghost Content API.
    <br/>
    <br/>
  </p>
</div>

[![tests](https://github.com/PhilDL/ts-ghost/actions/workflows/deploy.yml/badge.svg)](https://github.com/PhilDL/ts-ghost/actions/workflows/deploy.yml) ![License](https://img.shields.io/github/license/PhilDL/ts-ghost) <img alt="GitHub package.json version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/v/PhilDL/ts-ghost?filename=packages%2Fts-ghost-content-api%2Fpackage.json">

## About The Project

`@ts-ghost/content-api` provides a strongly-typed TypeScript client to interract with the Ghost Content API based on [Zod](https://github.com/colinhacks/zod) schemas passed through a QueryBuilder and then a Fetcher.

![content-api-typesafety](https://user-images.githubusercontent.com/4941205/227787797-daf0bc72-1bb7-4ccd-8c98-fe4c03b71dd3.gif)

## Install

```shell
pnpm i @ts-ghost/content-api
```

## Basic Usage

This is a quick example of how to use the library.

### Compatible Ghost versions.

This client is only compatible with Ghost versions 5.x for now.

- Ghost 5^

### Browse multiple posts

```typescript
import { TSGhostContentAPI, type Post } from "@ts-ghost/content-api";

let url = "https://demo.ghost.io";
let key = "22444f78447824223cefc48062"; // Content API KEY should be in the right format corresponding to the Ghost Content API (26 Hex chars)
const api = new TSGhostContentAPI(url, key, "v5.0"); // The instantiation is validated through a zod Schema

// Browse posts
const res = await api.posts.browse().fetch();
if (res.status === "success") {
  const posts = res.data;
  const meta = res.meta;
  //     ^? GhostMeta Type containing pagination info
  for (const post of posts) {
    //        ^? type Post
    console.log(post.title);
  }
} else {
  console.error(res.errors);
}
```

### Read one Post by slug

```typescript
import { TSGhostContentAPI } from "@ts-ghost/content-api";

let url = "https://demo.ghost.io";
let key = "22444f78447824223cefc48062"; // Content API KEY
const api = new TSGhostContentAPI(url, key, "v5.0");

const res = await api.posts
  .read({
    slug: "welcome-to-ghost",
  })
  .fetch();
if (res.status === "success") {
  const post = res.data;
  //     ^? type Post
} else {
  console.error(res.errors);
}
```

## Building Queries

Calling any resource like `authors`, `posts`, etc (except `settings` resource) will give a
new instance of a QueryBuilder containing two methods `read` and `browse`.

This instance is already built with the associated Schema for that resource so any operation
you will do from that point will be typed against the asociated schema.

`browse` and `read` methods accept an options object. These params mimic the way Ghost API Content is built but with the power of Zod and TypeScript they are type-safe here.

```typescript
let query = api.posts.browse({
  limit: 5,
  order: "title DESC",
  //      ^? the text here will throw a TypeScript lint error if you use unknown field.
});
```

- `browse` will accept browse parameters like `page`, `limit`, `order`, `filter`.
- `read` parameters are `id` or `slug`.

## Options

### `.browse` options

Params are totally optionals on the `browse` method but they let you filter and order your search.

This is an example containing all the available keys in the params object

```typescript
let query = api.posts.browse({
  page: 1,
  limit: 5,
  filter: "name:bar+slug:-test",
  //      ^? the text here will throw a TypeScript lint error if you use unknown fields.
  order: "title DESC",
  //      ^? the text here will throw a TypeScript lint error if you use unknown fields.
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
let query = api.posts.read({
  id: "edHks74hdKqhs34izzahd45",
});

// or

let query = api.posts.read({
  slug: "typescript-is-awesome-in-2025",
});
```

You can submit **both** `id` and `slug`, but the fetcher will then chose the `id` in priority if present to make the final URL query to the Ghost API.

## Modifying the `output` after read or browse.

Both `browse` and `read` methods give you a Fetcher with methods that alter the output of the results. The output type will be modified to match the fields, inclusion or format you selected. These methods are **chainable**.

### `.fields()`

The `fields` method lets you change the output of the result to have only your selected fields, it works by giving an object with the field name and the value `true`. Under the hood it will use the `zod.pick` method to pick only the fields you want.

```typescript
let result = await api.posts
  .read({
    slug: "typescript-is-cool",
  })
  .fields({
    id: true,
    slug: true,
    title: true,
  })
  .fetch();

if (result.status === "success") {
  const post = result.data;
  //     ^? type {"id": string; "slug":string; "title": string}
}
```

The **output schema** will be modified to only have the fields you selected and TypeScript will pick up on that to warn you if you access non-existing fields.

### `.include()`

The `include` method lets you include some additionnal data that the Ghost API doesn't give you by default. The `include` params is specific to each resource and is defined in the "include" `Schema` of the resource. You will have to let TypeScript guide you to know what you can include.

```typescript
let result = await api.authors
  .read({
    slug: "phildl",
  })
  .include({ "count.posts": true })
  .fetch();
```

Available include keys by resource:

- Posts & Pages: `authors`, `tags`
- Authors: `count.posts`
- Tags: `count.posts`
- Tiers: `monthly_price`, `yearly_price`, `benefits`

The output type will be modified to make the fields you include **non-optionals**.

### `.formats()`

The `formats` method lets you add alternative content formats on the output of `Post` or `Page` resource to get the content in `plaintext` or `html`. Available options are `plaintext | html | mobiledoc`.

```typescript
let result = await api.posts
  .read({
    slug: "this-is-a-post-slug",
  })
  .formats({
    plaintext: true,
    html: true,
  })
  .fetch();
```

The output type will be modified to make the formatted fields you include **non-optionals**.

## Fetching

After building your query and using output formatting, you can fetch it with the `fetch` method. This method will return a `Promise` that will resolve to a result object that was parsed by the `Zod` Schema of the resource.

All the results are discriminated unions representing a successful query and an error query. To discriminate the results you can use the `status` key of the result object which is `success` or `error`.

```typescript
let result = await api.posts.read({ slug: "typescript-is-cool" }).fetch();
if (result.status === "success") {
  const post = result.data;
  //     ^? type {"id": string; "slug":string; "title": string}
} else {
  // errors array of objects
  console.log(result.errors.map((e) => e.message).join("\n"));
}
```

### Read Fetcher

After using `.read` query, you will get a `ReadFetcher` with an `async fetch` method giving you a discriminated union of 2 types:

```typescript
// example for the read query (the data is an object)
const result:
  | {
      status: "success";
      data: Post; // parsed by the Zod Schema and modified by the fields selected
    }
  | {
      status: "error";
      errors: {
        message: string;
        type: string;
      }[];
    };
```

### Browse Fetcher

After using `.read` query, you will get a `BrowseFetcher` with 2 methods:

- `async fetch`
- `async paginate`

#### Browse `.fetch()`

That result is a discriminated union of 2 types:

```typescript
// example for the browse query (the data is an array of objects)
const result:
  | {
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
    }
  | {
      status: "error";
      errors: {
        message: string;
        type: string;
      }[];
    };
```

#### Browse `.paginate()`

```typescript
const result:
  | {
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
      next: BrowseFetcher | undefined; // the next page fetcher if it is defined
    }
  | {
      status: "error";
      errors: {
        message: string;
        type: string;
      }[];
      next: undefined; // the next page fetcher is undefined here
    };
```

Here you can use the `next` property to get the next page fetcher if it is defined.

## Commons recipes

### Getting all the posts (including Authors) with pagination

Here we will use the `paginate` function of the fetcher to get the next page fetcher directly if it is defined.

```typescript
import { TSGhostContentAPI, type Post } from "@ts-ghost/content-api";

let url = "https://demo.ghost.io";
let key = "22444f78447824223cefc48062"; // Content API KEY
const api = new TSGhostContentAPI(url, key, "v5.0");

const posts: Post[] = [];
let cursor = await api.posts.browse().include({ authors: true, tags: true }).paginate();
if (cursor.current.status === "success") posts.push(...cursor.current.data);
while (cursor.next) {
  cursor = await cursor.next.paginate();
  if (cursor.current.status === "success") posts.push(...cursor.current.data);
}
return posts;
```

### Fetching the Settings of your Ghost instance

Settings is a specific resource, you cannot build query against it like the other resources. You can only fetch the settings, so calling `api.settings` will directly give you a fetcher.

```typescript
import { TSGhostContentAPI, type Post } from "@ts-ghost/content-api";

let url = "https://demo.ghost.io";
let key = "22444f78447824223cefc48062"; // Content API KEY
const api = new TSGhostContentAPI(url, key, "v5.0");

let result = await api.settings.fetch();
if (result.status === "success") {
  const settings = result.data;
  //     ^? type Settings {title: string; description: string; ...
}
```

### Unknown inputs and outputs

Let's imagine an example where you don't control what's gonna arrive in the `output.fields` for example.
You can avoid the type error by casting with `as`.

```typescript
// `fieldsKeys` comes from outside
const outputFields = fieldsKeys.reduce((acc, k) => {
  acc[k as keyof Post] = true;
  return acc;
}, {} as { [k in keyof Post]?: true | undefined });
const result = await api.posts.browse().fields(outputFields).fetch();
```

But you will lose the type-safety of the output, in Type land, `Post` will contains **all** the fields, not only the ones you selected.
(In user land, the fields you selected are still gonna be parsed and the unknwown fields **are gonna be ignored**)

#### Pre-declare the output and keep Type-Safety with `satisfies`

If you would like to pre-declare the output, you can like so:

```typescript
const outputFields = {
  slug: true,
  title: true,
} satisfies { [k in keyof Post]?: true | undefined };

let test = api.posts.browse().fields(outputFields);
```

In that case you will **keep type-safety** and the output will be of type `Post` with only the fields you selected.

#### Unknown order string with `as` to force the type

If you don't control the content of the `order` field in the `input`.
You can force typeSafety with `as`.

```typescript
import type { Post } from "@ts-ghost/content-api";
import type { BrowseParams } from "@ts-ghost/core-api";

const order = "foobar DESC";
const input = { order } as BrowseParams<{ order: string }, Post>;
const result = await api.posts
  .browse({
    order,
  })
  .fetch();
```

### `fetch` options

You can pass an optional `options` object to the `fetch` and `paginate` method. The `options` object is the standard `RequestInit` object from the `fetch` API.

```typescript
let result = await api.posts.read({ slug: "typescript-is-cool" }).fetch({ cache: "no-store" });
```

_This may be useful if you use NextJS augmented `fetch`!_

## Roadmap

- [ ] Write more tests

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
