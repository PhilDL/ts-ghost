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
  <p align="center">
    <a href="https://ts-ghost.dev/docs/content-api"> Documentation </a> – <a href="https://twitter.com/_philDL">Twitter</a>
  </p>
</div>

[![tests](https://github.com/PhilDL/ts-ghost/actions/workflows/deploy.yml/badge.svg)](https://github.com/PhilDL/ts-ghost/actions/workflows/deploy.yml) ![License](https://img.shields.io/github/license/PhilDL/ts-ghost) <img alt="GitHub package.json version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/v/PhilDL/ts-ghost?filename=packages%2Fts-ghost-content-api%2Fpackage.json">

# Introduction

`@ts-ghost/content-api` provides a strongly-typed TypeScript client to interract with the **Ghost Content API** based on [Zod](https://github.com/colinhacks/zod) schemas passed through an APIComposer that exposes different resources and their `read` or `browse` methods (dependening on the resource) with params and output type-safety.

All the available options from the Ghost Content API are available here, filtering, ordering, pagination, selecting fields, modifiying output, etc...

![content-api-typesafety](https://user-images.githubusercontent.com/4941205/227787797-daf0bc72-1bb7-4ccd-8c98-fe4c03b71dd3.gif)

## Requirements

This client is only compatible with Ghost versions 5.x for now.

- Ghost 5.^ (Any Ghost version after 5.0)

- Node.js 16+
  - We rely on global `fetch` being available, so you can bring your own
    polyfill and if you run Node 16, you'll need to run with the
    `--experimental-fetch` flag enabled.
- TypeScript 5+, the lib make usage of const in generics and other TS5+ features.
# Quickstart

These are the basic steps to follow to interact with the Ghost Content API in your TypeScript project.



### Get your Ghost API Key and Ghost version number

Connect to your ghost blog and create a new Integration to get your Content API Key.

![Create an Integration to get your Content API Key](https://github.com/PhilDL/ts-ghost/assets/4941205/0a35955e-1d42-40b3-a966-2cfc0345fa38)

_You will need the URL of your Ghost Blog and the Content API Key_

To know which Ghost Version you are using go in the Settings and click on top right button "About Ghost":

![Ghost Version](https://github.com/PhilDL/ts-ghost/assets/4941205/c46034a5-844e-4d8c-b525-a47e26d941c6)

Here the version is **"v5.47.0"**

### Installation

```bash title="Terminal"
pnpm add @ts-ghost/content-api
```

### (Optional) Create `.env` variable

```bash title=".env"
GHOST_URL="https://myblog.com"
GHOST_CONTENT_API_KEY="e9b414c5d95a5436a647ff04ab"
```

### Use in your TypeScript file

```ts title="ghost-queries.ts"
import { TSGhostContentAPI } from "@ts-ghost/content-api";

const api = new TSGhostContentAPI(
  process.env.GHOST_URL || "",
  process.env.GHOST_CONTENT_API_KEY || "",
  "v5.47.0"
);

export async function getBlogPosts() {
  const response = await api.posts
    .browse({
      limit: 10,
    })
    .fields({
      title: true,
      slug: true,
      id: true,
    })
    .fetch();
  if (!response.success) {
    throw new Error(response.errors.join(", "));
  }
  // Response data is typed correctly with only the requested fields
  // {
  //   title: string;
  //   slug: string;
  //   id: string;
  // }[]
  return response.data;
}
```


# Overview

Here you will have an overview of the philosophy of the library and a common workflow for your queries.

The `TSGhostContentAPI` object is your entry-point, it will contains all the available endpoints and need to be instantiated with your Ghost Blog API Credentials, the URL, and the Content API Key.

```ts
import { TSGhostContentAPI } from "@ts-ghost/content-api";

const api = new TSGhostContentAPI("https://demo.ghost.io", "22444f78447824223cefc48062", "v5.0");
```

From this `api` instance you will be able to call any resource available in the Ghost Content API and have the available methods exposed.

## Available resource

| Resource       | `.read()` | `.browse()` |
| -------------- | --------- | ----------- |
| `api.posts`    | ✅        | ✅          |
| `api.pages`    | ✅        | ✅          |
| `api.authors`  | ✅        | ✅          |
| `api.tiers`    | ✅        | ✅          |
| `api.tags`     | ✅        | ✅          |
| `api.settings` | \*        | \*          |

- settings resource only has a `fetch` function exposed, no query builder.

## Building Queries

Calling any resource like `authors`, `posts`, etc (except `settings` resource) will give a
new instance of APIComposer containing two exposed methods `read` and `browse` (if you are interested in a version that exposes `add`, `edit` and `delete` you will have to check the [@ts-ghost/admin-api](https://ts-ghost.dev/docs/admin-api/introduction)).

This instance is already built with the associated Schema for that resource so any operation
you will do from that point will be typed against the asociated schema. Since you are using TypeScript you will get a nice developer experience with autocompletion and squiggly lines if you try to use a field that doesn't exist on the resource.

`browse` and `read` methods accept an options object. These params mimic the way Ghost API Content is built but with the power of Zod and TypeScript they are type-safe here.

```ts
let query = api.posts.browse({
  limit: 5,
  order: "title DESC",
  //      ^? the text here will throw a TypeScript lint error if you use unknown field.
});
```

- `browse` will accept `page`, `limit`, `order`, `filter`. ([More details](/docs/content-api/browse))
- `read` parameters are `id` or `slug`. ([More details](/docs/content-api/browse))

## (Optional) Altering the output

After calling `read` or `browse` you get a Fetcher instance that you can use to optionnaly alter the output of the result.

For example if we want to fetch only the id, slug and title of our blog posts we could do:

```ts
let query = api.posts
  .browse({
    limit: 5,
    order: "title DESC",
  })
  .fields({
    id: true,
    slug: true,
    title: true,
  });
```

## Fetching the data

After building your query and _optionnaly using output formatting_, you can fetch it with the **async** `fetch` method. This method will return a `Promise` that will resolve to a result object that was parsed by the `Zod` Schema of the resource.

```ts
let query = await api.posts
  .browse({
    limit: 5,
    order: "title DESC",
  })
  .fields({
    id: true,
    slug: true,
    title: true,
  })
  .fetch();

// or without fields selection

let query2 = await api.posts
  .browse({
    limit: 5,
    order: "title DESC",
  })
  .fetch();
```

Alternatively, coming from a `browse` query you also have access to the `paginate` method, instead of `fetch`. This version will return a cursor and a `next` fetcher to directly have the next query with the same parameters but on page n + 1. See a complete example in the [Common Recipes](/docs/content-api/common-recipes) section.

The result is a **discriminated union** with the Boolean `success` as a discriminator, so a check on `success` will let you know if the query was successful or not. The shape of the "OK" path depends on the query you made and the output modifiers you used.

```ts
const result: {
    success: true;
    data: Post; // Shape depends on resource + browse | read + output modifiers
    // contains aditionnal metadata for browse queries
} | {
    success: false;
    errors: {
        message: string;
        type: string;
    }[];
}
```
# Browse

The `browse` method is used to get a list of items from a Ghost Content API resource, it is the equivalent of the `GET /posts` endpoint. You have access to different options to paginate, limit, filter and order your results.

## Options

These options are totally _optionals_ on the `browse` method but they let you filter and order your search.

This is an example containing all the available keys in the params object

```ts
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

### page `number`

Lets you query a specific page of results. The default value is `1` and pagination starts at `1`.

### limit `number`

Lets you limit the number of results per page. The default value is `15` and the maximum value is `15` (limitation of the Ghost API).

### filter `string`

Lets you filter the results with the [Ghost API `filter` syntax](https://ghost.org/docs/content-api/#filtering). But with the power of TypeScript, you will get **lint errors if you use unknown fields**.

For example if you use `filter: "name:bar+slug:-test"`, `name` IS NOT a field of the `Post` resource, you will get a lint error.

Example, getting all featured posts except one with specific slug:

```ts
const slugToExclude = "test";

let query = await api.posts
  .browse({
    filter: `featured:true+slug:-${slugToExclude}`,
  })
  .fetch();
```

Note that you also have access to

### order `string`

Lets you order the results by fields. Similar to the `filter` option, you will get **TypeScript lint errors if you use unknown fields**. The syntax is `field direction` where `direction` is `ASC` or `DESC`.

```ts
let query = await api.posts
  .browse({
    order: "title DESC",
  })
  .fetch();
```

Note that you can also use nested properties, for example if you want to fetch the first 3 `Tags` with the most posts:

```ts
api.tags
.browse({
  order: "count.posts DESC",
  filter: "visibility:public",
  limit: 3,
})
.include({ "count.posts": true })
.fetch(),
```

## Output modifiers

After calling `browse` you get a Fetcher instance that you can use to optionnaly alter the output of the result with methods like `include`, `fields` and `formats`. You can also use the `fetch` method to get the result.

There is a section [dedicated to output modifiers here](/docs/content-api/output-modifiers).

## Fetching the data

After using browse query, you will get a `BrowseFetcher` with 2 methods:

- `async fetch`
- `async paginate`

That result is a discriminated union with the Boolean `success` as a discriminator, so a check on `success` will let you know if the query was successful or not. Generally your workflow will look like that:

```ts
let result = await api.posts.browse().fetch();
if (result.success) {
  const posts = result.data;
  //     ^? type Post[]
} else {
  // errors array of objects
  console.log(result.errors.map((e) => e.message).join("\n"));
}
```

### Result type of `.fetch()`

The `data` property of the result will be an array of objects of the resource you queried. This output schema will be modified according to the output modifiers you used.

**Basic example for Posts** (without output modifiers you get the full Post object):

```ts
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

### Result type of `.paginate()`

Paginate is a method that will return a cursor and a `next` fetcher to directly have the next query with the same parameters but on page n + 1. See a complete example in the [Common Recipes](/docs/content-api/common-recipes) section.

```ts
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
# Read

The `read` method is used to one item from a Ghost Content API resource, it is the equivalent of the `GET /posts/slug/this-is-a-slug` endpoint. You have to give it an identity field to fetch the resource.

## Options

Options for the read method depends on the resource you are querying. Each resource have a specific identity field that you can use to fetch it. For example, the `Post` resource have `id` and `slug` as identity fields.

**Use TypeScript autocomplete to guide you through the available identity fields.**

```ts
let query = api.posts.read({
  id: "edHks74hdKqhs34izzahd45"
});

// or

let query = api.posts.read({
  slug: "typescript-is-awesome-in-2025"
});
```

### Not recommended:

You can submit **both** `id` and `slug`, but the fetcher will then chose the `id` in priority if present to make the final URL query to the Ghost API.

```ts
let query = api.posts.read({
  id: "edHks74hdKqhs34izzahd45", // id will take priority
  slug: "typescript-is-awesome-in-2025",
});
```

## Output modifiers

After calling `read` you get a Fetcher instance that you can use to optionnaly alter the output of the result with methods like `include`, `fields` and `formats`. You can also skip that and use the `fetch` method directly to get the result.

There is a section [dedicated to output modifiers here](/docs/content-api/output-modifiers).

## Fetching the data

After using browse query, you will get a `ReadFetcher` with an async `fetch` method.
That result is a discriminated union with the Boolean `success` as a discriminator, so a check on `success` will let you know if the query was successful or not. Generally your workflow will look like that:

```ts
let result = await api.posts.read({ slug: "this-is-a-slug" }).fetch();
if (result.success) {
  const posts = result.data;
  //     ^? type Post
} else {
  // errors array of objects
  console.log(result.errors.map((e) => e.message).join("\n"));
}
```

### Result type of `.fetch()`

The `data` property of the result will be an object corresponding to the resource you requested. This output schema will be modified according to the output modifiers you used.

**Basic example for Post** (without output modifiers you get the full Post object):

```ts
// example for the read query (the data is an object)
const result: {
    success: true;
    data: Post; // parsed by the Zod Schema and modified by the fields selected
} | {
    success: false;
    errors: {
        message: string;
        type: string;
    }[];
}
```
# Output modifiers

Output modifiers are available for the `read` and `browse` methods. They let you change the output of the result to have only your selected fields, include some additionnal data that the Ghost API doesn't give you by default or get the content in different formats.

The result type from the subsequent `fetch` will be modified to match your selection giving you full type-safety.

```ts /fields({ title: true })/
// Example with read...
let result = await api.posts.read({ slug: "slug"}).fields({ title: true }).fetch();

// ... and with browse
let result = await api.posts.browse({limit: 2}).fields({ title: true }).fetch();
```

## Select specific fields with `.fields()`

The `fields` method lets you change the output of the result to have only your selected fields, it works by giving an object with the field name and the value `true`. Under the hood it will use the `zod.pick` method to pick only the fields you want.

```ts
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

if (result.success) {
  const post = result.data;
  //     ^? type {"id": string; "slug":string; "title": string}
}
```

The **output schema** will be modified to only have the fields you selected and TypeScript will pick up on that to warn you if you access non-existing fields.

## Include relations with `.include()`

The `include` method lets you include some additionnal data that the Ghost API doesn't give you by default. The `include` params is specific to each resource and is defined in the "include" `Schema` of the resource. You will have to let TypeScript guide you to know what you can include.

```ts
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

## Output page/post content into different `.formats()`

The `formats` method lets you add alternative content formats on the output of `Post` or `Page` resource to get the content in `plaintext` or `html`. Available options are `plaintext | html | mobiledoc`.

```ts
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
# Fetching

Fetching happens at the end of your chaining of methods, the moment you call the async `fetch` method (or the async `paginate`).

Technically these are the only asynchronous methods and the only moment where the library will make a request to the Ghost API through the platform `fetch` function (in Node or in the browser).

## Reminder requirements

This library expect the global `fetch` function to be available. If you are using Node 16, you will need to run with the `--experimental-fetch` flag enabled.

## fetch options

Since we are using the standard `fetch` you have can pass options of type [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) notably to play with the `cache` behavior.

For example:

```ts
let query = await api.posts
  .browse({
    limit: 5,
    order: "title DESC",
  })
  .fetch({
    cache: "no-cache",
  });
```

### With NextJS

In a NextJS 13+ project, `fetch` is augmented and you can fully take advantage of that and you have access to the `next` option.

```ts
let query = await api.posts
  .browse({
    limit: 5,
    order: "title DESC",
  })
  .fetch({ next: { revalidate: 10 } }); // NextJS revalidate this data every 10 seconds at most
```
# Commons recipes

## Getting all the posts (including Authors) with pagination

Here we will use the `paginate` function of the fetcher to get the next page fetcher directly if it is defined.

```ts title
import { TSGhostContentAPI, type Post } from "@ts-ghost/content-api";

let url = "https://demo.ghost.io";
let key = "22444f78447824223cefc48062"; // Content API KEY
const api = new TSGhostContentAPI(url, key, "v5.0");

const posts: Post[] = [];
let cursor = await api.posts
  .browse()
  .include({ authors: true, tags: true })
  .paginate();
if (cursor.current.success) posts.push(...cursor.current.data);
while (cursor.next) {
  cursor = await cursor.next.paginate();
  if (cursor.current.success) posts.push(...cursor.current.data);
}
return posts;
```

## Fetching the Settings of your Ghost instance

Settings is a specific resource, you cannot build query against it like the other resources. You can only fetch the settings, so calling `api.settings` will directly give you a fetcher.

```ts
import { TSGhostContentAPI, type Post } from "@ts-ghost/content-api";

let url = "https://demo.ghost.io";
let key = "22444f78447824223cefc48062"; // Content API KEY
const api = new TSGhostContentAPI(url, key, "v5.0");

let result = await api.settings.fetch();
if (result.success) {
  const settings = result.data;
  //     ^? type Settings {title: string; description: string; ...
}
```
# Remix example

Here is an example using the `@ts-ghost/content-api` in a Remix loader:

<Steps>

### Installation

```bash title="Terminal"
pnpm add @ts-ghost/content-api
```

### Create `.env` variable

```bash title=".env"
GHOST_URL="https://myblog.com"
GHOST_CONTENT_API_KEY="e9b414c5d95a5436a647ff04ab"
```

### Use in your route loader

```tsx title="app/routes/_index.tsx"
import { json, type LoaderArgs, type V2_MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { TSGhostContentAPI } from "@ts-ghost/content-api";

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export async function loader({ request }: LoaderArgs) {
  const api = new TSGhostContentAPI(
    process.env.GHOST_URL || "",
    process.env.GHOST_CONTENT_API_KEY || "",
    "v5.0"
  );
  const [settings, posts] = await Promise.all([api.settings.fetch(), api.posts.browse().fetch()]);

  if (!settings.success) {
    throw new Error(settings.errors.join(", "));
  }
  if (!posts.success) {
    throw new Error(posts.errors.join(", "));
  }
  return json({ settings: settings.data, posts: posts.data });
}

export default function Index() {
  const { settings, posts } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>This is a list of posts for {settings.title}:</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link to={`/${post.slug}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

</Steps>
# NextJS

This is an example for NextJS 13 using the `@ts-ghost/content-api` with the app Router where we fetch the list of posts and the site settings to display them on the `/blog` of our site.

<Steps>

### Installation

```bash title="Terminal"
pnpm add @ts-ghost/content-api
```

### Create `.env` variable

```bash title=".env"
GHOST_URL="https://myblog.com"
GHOST_CONTENT_API_KEY="e9b414c5d95a5436a647ff04ab"
```

### Create a file in the app folder to instantiate the API

```ts title="app/blog/ghost.ts"
import { TSGhostContentAPI } from "@ts-ghost/content-api";

export const api = new TSGhostContentAPI(
  process.env.GHOST_URL || "",
  process.env.GHOST_CONTENT_API_KEY || "",
  "v5.0"
);
```

### Use the API in the app Router

```tsx title="app/blog/page.tsx"
import { api } from "./ghost";

async function getBlogPosts() {
  const response = await api.posts
    .browse()
    .fields({title: true, slug:true, id:true})
    .fetch();
  if(!response.success) {
    throw new Error(response.errors.join(", "));
  }
  return response.data;
}

async function getSiteSettings() {
  const response = await api.settings.fetch();
  if(!response.success) {
    throw new Error(response.errors.join(", "));
  }
  return response.data;
}

// async Server Component
export default async function HomePage() {
  const [posts, settings] = await Promise.all([
    getBlogPosts(),
    getSiteSettings()
  ])
  return <div>
    <h1>This is a list of posts for {settings.title}:</h1>
    <ul>
      {(posts).map(post => <li key={post.id}>{post.title} ({post.slug})</li>)}
    </ul>

  </div>;
}
```

</Steps>
# TypeScript recipes

Sometimes TypeScript will get in your way, especially with the string-based type-checking on browse parameters. In this section we will show you some tips and tricks to get around those problems, and present you some utilities.

## Unknown inputs and outputs

Let's imagine an example where you don't control what's gonna arrive in the `output.fields` for example.
You can avoid the type error by casting with `as`.

```ts
// `fieldsKeys` comes from outside
const outputFields = fieldsKeys.reduce((acc, k) => {
  acc[k as keyof Post] = true;
  return acc;
}, {} as { [k in keyof Post]?: true | undefined });
const result = await api.posts.browse().fields(outputFields).fetch();
```

But you will lose the type-safety of the output, in Type land, `Post` will contains **all** the fields, not only the ones you selected.
(In user land, the fields you selected are still gonna be parsed and the unknwown fields **are gonna be ignored**)

## Pre-declare the output and keep Type-Safety with `satisfies`

If you would like to pre-declare the output, you can like so:

```ts
const outputFields = {
  slug: true,
  title: true,
} satisfies { [k in keyof Post]?: true | undefined };

let test = api.posts.browse().fields(outputFields);
```

In that case you will **keep type-safety** and the output will be of type `Post` with only the fields you selected.

## Unknown order/filter string with `as` to force the type

If you don't build the `order` or `filter` string yourself, for example if that comes from a user input or `FormData`, then you TypeScript will shout at you because the inner-types will be converted to never as the content of the string cannot be templated.

To alleviate that problem you have access to a type helper generics `BrowseParams` that accepts a shape of params and the corresponding resource type. Allowing you to make your query, that will be runtime checked anyway.

```ts
import type { BrowseParams, Post } from "@ts-ghost/content-api";

const uncontrolledOrderInput = async (formData: FormData) => {
  const order = formData.get("order");
  const filter = formData.get("filter");
  const result = await api.posts
    .browse({ order, filter } as BrowseParams<{ order: string; filter: string }, Post>)
    .fetch();
};
```


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
