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

![License](https://img.shields.io/github/license/PhilDL/ts-ghost) <img src="https://img.shields.io/badge/status-beta-orange.svg" alt="Status: Beta" /> <img alt="GitHub package.json version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/v/PhilDL/ts-ghost?filename=packages%2Fts-ghost-content-api%2Fpackage.json">

## About The Project

`@ts-ghost/content-api` provides a strongly-typed TypeScript client to interract with the Ghost Content API based on [Zod](https://github.com/colinhacks/zod) schemas passed through a QueryBuilder and then a Fetcher.

## Install

```shell
pnpm i @ts-ghost/content-api
```

## Basic Usage

This is a quick example of how to use the library.

### Browse multiple posts 

```typescript
import { TSGhostContentAPI } from "@ts-ghost/content-api";
import type { Post } from "@ts-ghost/content-api";

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

const res = await api.posts.read({
  input: {
    slug: "welcome-to-ghost",
  }
}).fetch();
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

`browse` and `read` methods accept a config object with 2 properties: `input` and an `output`. These params mimic the way Ghost API Content is built but with the power of Zod and TypeScript they are type-safe here.

```typescript
let query = api.posts.browse({
  input: {
    limit: 5,
    order: "title DESC"
    //      ^? the text here will throw a TypeScript lint error if you use unknown field.
  },
  output: {
    include: {
      authors: true,
      tags: true,
    },
  },
});
```

- `input` will accept browse parameters like `page`, `limit`, `order`, `filter`. And read parameters are `id` or `slug`.
- `output` is the same for both methods and let you specify `fields` to output (to not have the full object) and some Schema specific `include`. For example getting the posts including their Authors.

*Ghost Content API doesn't work well when you mix `fields` and `include` output, so in most case you shouldn't*

## `input`

### `.browse` inputs

Input are totally optionals on the `browse` method but they let you filter and order your search.

This is an example containing all the available keys in the `input` object

```typescript
let query = api.posts.browse({
  input: {
    page: 1,
    limit: 5,
    filter: "name:bar+slug:-test",
    //      ^? the text here will throw a TypeScript lint error if you use unknown fields.
    order: "title DESC"
    //      ^? the text here will throw a TypeScript lint error if you use unknown fields.
  }
});
```
These browse params are then parsed through a `Zod` Schema that will validate all the fields.

#### (Deprecated) Type-hint with `as const`
~~You should use `as const` for your input if you are playing with `filter` and `order` so TypeScript can analyse the content of the string statically and TypeCheck it.~~
This is not needed anymore since TypeScript release 5.0 the generics use const inference.

- `page:number` The current page requested
- `limit:number` Between 0 and 15 (limitation of the Ghost API)
- `filter:string` Contains the filter with [Ghost API `filter` syntax](https://ghost.org/docs/content-api/#filtering).
- `order:string` Contains the name of the field and the order `ASC` or `DESC`.

For the `order` and `filter` if you use fields that are not present on the schema (for example `name` on a `Post`) then the QueryBuilder will throw an Error with message containing the unknown field.

### `.read` inputs
Read is meant to be used to fetch 1 object only by `id` or `slug`. 

```typescript
let query = api.posts.read({
  input: {
    id: "edHks74hdKqhs34izzahd45"
  }
}); 

// or 

let query = api.posts.read({
  input: {
    slug: "typescript-is-awesome-in-2025"
  }
}); 
```
You can submit **both** `id` and `slug`, but the fetcher will then chose the `id` in priority if present to make the final URL query to the Ghost API.

## `output`
Output is the same for both `browse` and `read` methods and gives you 2 keys to play with

### `fields` 
The `fields` key lets you change the output of the result to have only your selected fields, it works by giving the key and the value `true` to the field you want to keep. Under the hood it will use the `zod.pick` method to pick only the fields you want.

```typescript
let result = await api.posts.read({
  input: {
    slug: "typescript-is-cool"
  },
  output: {
    fields: {
      id: true,
      slug: true,
      title: true
    }
  }
}).fetch();

if (result.status === 'success') {
  const post = result.data;
  //     ^? type {"id": string; "slug":string; "title": string}
}
```
The **output schema** will be modified to only have the fields you selected and TypeScript will pick up on that to warn you if you access non-existing fields.

### `include`
The `include` key lets you include some additionnal data that the Ghost API doesn't give you by default. This `include` key is specific to each resource and is defined in the `Schema` of the resource. You will have to let TypeScript guide you to know what you can include.

```typescript
let result = await api.authors.read({
  input: {
    slug: "phildl"
  },
  output: {
    include: {
      "count.posts": true,
    },
  },
}).fetch();
```

Available keys by resource:
- Posts & Pages: `authors`, `tags`
- Authors: `count.posts`
- Tags: `count.posts`
- Tiers: `monthly_price`, `yearly_price`, `benefits`

## Fetching 
After building your query you can fetch it with the `fetch` method. This method will return a `Promise` that will resolve to a result object that was parsed by the `Zod` Schema of the resource. 

All the results are discriminated unions representing a successful query and an error query. To discriminate the results you can use the `status` key of the result object which is `success` or `error`.

```typescript
let result = await api.posts.read({input: {slug: "typescript-is-cool"}}).fetch();
if (result.status === 'success') {
  const post = result.data;
  //     ^? type {"id": string; "slug":string; "title": string}
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
    data: Post; // parsed by the Zod Schema and modified by the fields selected
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

#### Browse `.paginate()`
```typescript
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


## Commons recipes

### Getting all the posts (including Authors) with pagination

Here we will use the `paginate` function of the fetcher to get the next page fetcher directly if it is defined.

```typescript
import { TSGhostContentAPI, type Post } from "@ts-ghost/content-api";

let url = "https://demo.ghost.io";
let key = "22444f78447824223cefc48062"; // Content API KEY
const api = new TSGhostContentAPI(url, key, "v5.0");

const posts: Post[] = [];
let cursor = await api.posts
  .browse({
    output: {
      include: {
        authors: true,
        tags: true,
      },
    },
  })
  .paginate();
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
const result = await api.posts
  .browse({
    output: {
      fields: outputFields,
    },
  })
  .fetch();
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

let test = api.posts.browse({
  output: {
    fields: outputFields,
  },
});
```
In that case you will **keep type-safety** and the output will be of type `Post` with only the fields you selected.

#### Unknown order string with `as` to force the type

If you don't control the content of the `order` field in the `input`. 
You can force typeSafety with `as`.

```typescript
import type { BrowseParams } from "@ts-ghost/core-api";
import type { Post } from "@ts-ghost/content-api";

const order = "foobar DESC";
const input = { order } as BrowseParams<{ order: string }, Post>;
const result = await api.posts
  .browse({
    input: {
      order,
    },
  })
  .fetch();
```

## Roadmap

- [x] Write more docs
- [ ] Better handling of weird Ghost "include" params in API call

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
