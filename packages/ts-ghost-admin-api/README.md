<br/>
<br/>

<div align="center">
  <a href="https://github.com/PhilDL/ts-ghost">
    <img src="https://user-images.githubusercontent.com/4941205/221607740-28ce02cb-da96-4e34-a40d-8163bb7c668f.png" alt="Logo" width="auto" height="80">
  </a>

  <h3 align="center"><code>@ts-ghost/admin-api</code></h3>

  <p align="center">
    <code>@ts-ghost/admin-api</code> is a strongly-typed TypeScript client to interract with the Ghost Admin API.
    <br/>
    <br/>
  </p>
  <p align="center">
    <a href="https://ts-ghost.dev/docs/admin-api"> Documentation </a> – <a href="https://twitter.com/_philDL">Twitter</a>
  </p>
</div>

[![tests](https://github.com/PhilDL/ts-ghost/actions/workflows/deploy.yml/badge.svg)](https://github.com/PhilDL/ts-ghost/actions/workflows/deploy.yml) ![License](https://img.shields.io/github/license/PhilDL/ts-ghost) <img alt="GitHub package.json version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/v/PhilDL/ts-ghost?filename=packages%2Fts-ghost-admin-api%2Fpackage.json">

# Introduction

`@ts-ghost/admin-api` provides a strongly-typed TypeScript client to interract with the Ghost Admin API based on [Zod](https://github.com/colinhacks/zod) schemas passed through all operations on composed API endpoints, `read`, `browse`, `add`, `edit` and `delete`.

This client gives you Type-Safety in the **inputs and outputs** of your Ghost API calls, usable in the browser (not recommended since you will probably expose your Admin API Key) or in Node.js.

It is made to interract with the Ghost Admin API with authentication by key. File uploads are not supported yet.

![admin-api-typesafety](https://user-images.githubusercontent.com/4941205/227786623-facb8e6c-dbe4-45ff-9b6e-721a05cedaba.gif)

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



### Get your Ghost Admin API Key and Ghost version number

Admin API keys can be obtained by creating a new Custom Integration under the Integrations screen in Ghost Admin. Keys for individual users can be found on their respective settings page.

My advice would be to connect to your Ghost Admin panel and go to `https://{your-ghost-blog-domain}/ghost/#/settings/integrations` and create a new integration, choose an appropriate Name and Descriptions.

![ts-ghost-api-key](https://user-images.githubusercontent.com/4941205/232329788-28e062b9-ecae-4adb-b340-c00d97aab78f.png)

For all operations You will need:

- the `Admin API Key`
- and the `API URL` to instantiate the client.

If you plan on creating `webhooks` you will also need to provide the `integration_id`, this is the auto-generated ID of the integration you just created.
To visualize that id, on your integration page, look at the url:

- `https://{your-ghost-blog-domain}/ghost/#/settings/integrations/63887c187f2cf32001fec9a8`

The last part `63887c187f2cf32001fec9a8` is the `integration_id`.

To know which Ghost Version you are using go in the Settings and click on top right button "About Ghost":

![Ghost Version](https://github.com/PhilDL/ts-ghost/assets/4941205/c46034a5-844e-4d8c-b525-a47e26d941c6)

Here the version is **"v5.47.0"**

### Installation

```bash title="Terminal"
pnpm add @ts-ghost/admin-api
```

### (Optional) Create `.env` variable

```bash title=".env"
GHOST_URL="https://myblog.com"
GHOST_ADMIN_API_KEY="1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8"
```

### Use in your TypeScript file

```ts title="ghost-queries.ts"
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(
  process.env.GHOST_URL || "",
  process.env.GHOST_ADMIN_API_KEY || "",
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
      html: true,
      plaintext: true,
    })
    .formats({
      html: true,
      plaintext: true,
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
  //   html: string;
  //   plaintext: string;
  // }[]
  return response.data;
}
```


# Overview

Here you will have an overview of the philosophy of the library and a common workflow for your queries.

The `TSGhostAdminAPI` object is your entry-point, it will contains all the available endpoints and need to be instantiated with your Ghost Blog API Credentials, the URL, and the Admin API Key.

```ts
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(
  "https://demo.ghost.io",
  "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
  "v5.0"
);
```

From this `api` instance you will be able to call any resource available in the Ghost Admin API and have the available methods exposed.

## Available resource

| Resource            | `.read()` | `.browse()` | `.add()` | `.edit()` | `.delete()` |
| ------------------- | --------- | ----------- | -------- | --------- | ----------- |
| `api.posts`         | ✅        | ✅          | ✅       | ✅        | ✅          |
| `api.pages`         | ✅        | ✅          | ✅       | ✅        | ✅          |
| `api.members`       | ✅        | ✅          | ✅       | ✅        | ✅          |
| `api.tiers`         | ✅        | ✅          | -        | -         | -           |
| `api.newsletters`   | ✅        | ✅          | ✅       | ✅        | 🗄️\*        |
| `api.offers`        | ✅        | ✅          | ✅       | ✅        | 🗄️\*        |
| `api.tags`          | ✅        | ✅          | ✅       | ✅        | ✅          |
| `api.users`         | ✅        | ✅          | -        | -         | -           |
| `api.webhooks`      | -         | -           | ✅       | ✅        | ✅          |
| `api.site` \*\*     | -         | -           | -        | -         | -           |
| `api.settings` \*\* | -         | -           | -        | -         | -           |

- 🗄️\* _You have access to a "soft" delete via the `status` field with values `"active" | "archived"`._
- \*\* `site` and `settings` resources only have a `fetch` function exposed, no query builder.

Calling any resource like `members` or `posts` will give your a new instance of APIComposer containing a mix of exposed methods between `read`, `browse` for data fetching and `add`, `edit` and `delete` for mutation.

In this Admin API the schemas returned are different from the [@ts-ghost/content-api](https://ts-ghost.dev/docs/content-api) and have usually more data. For example the `Post` resource can give you access to the paid `tiers` required to have access to the content.

## Building Queries (Read / Browse)

The resource instance is already built with the associated Schema for that resource so any operation
you will do from that point will be typed against the asociated schema. Since you are using TypeScript you will get a nice developer experience with autocompletion and squiggly lines if you try to use a field that doesn't exist on the resource.

`browse` and `read` methods accept an options object. These params mimic the way Ghost API Admin is built but with the power of Zod and TypeScript they are type-safe here.

```ts
let query = api.members.browse({
  limit: 5,
  order: "name ASC",
  //      ^? the text here will throw a TypeScript lint error if you use unknown field.
});
```

- `browse` will accept `page`, `limit`, `order`, `filter`. ([More details](/docs/admin-api/browse))
- `read` parameters are `id` or `slug`. ([More details](/docs/admin-api/browse))

## (Optional) Altering the output

After calling `read` or `browse` you get a Fetcher instance that you can use to optionnaly alter the output of the result.

For example if we want to fetch only the id, name and email of your members we could do:

```ts
let query = api.members
  .browse({
    limit: 5,
    order: "email ASC",
  })
  .fields({
    id: true,
    email: true,
    name: true,
  });
```

## Fetching the data

After building your query and _optionnaly using output formatting_, you can fetch it with the **async** `fetch` method. This method will return a `Promise` that will resolve to a result object that was parsed by the `Zod` Schema of the resource.

```ts
let query = await api.members
  .browse({
    limit: 5,
    order: "email ASC",
  })
  .fields({
    id: true,
    email: true,
    name: true,
  })
  .fetch();

// or without fields selection

let query2 = await api.members
  .browse({
    limit: 5,
    order: "email ASC",
  })
  .fetch();
```

Alternatively, coming from a `browse` query you also have access to the `paginate` method, instead of `fetch`. This version will return a cursor and a `next` fetcher to directly have the next query with the same parameters but on page n + 1. See a complete example in the [Common Recipes](/docs/admin-api/common-recipes) section.

The result is a **discriminated union** with the Boolean `success` as a discriminator, so a check on `success` will let you know if the query was successful or not. The shape of the "OK" path depends on the query you made and the output modifiers you used.

```ts
const result: {
    success: true;
    data: Member; // Shape depends on resource + browse | read + output modifiers
    // contains aditionnal metadata for browse queries
} | {
    success: false;
    errors: {
        message: string;
        type: string;
    }[];
}
```

## Mutations (Add / Edit / Delete)

The `add`, `edit` and `delete` methods are available on the resources that support it. (For example on `user` you don't have access to any mutation methods).
You will get auto-completion from each resource if the different methods are available or not.

**These methods are all asynchronous** (no need to call a fetch method to execute them) and will return a result object with the same shape as query methods (except for delete).

Examples:

```ts
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

let url = "https://demo.ghost.io";
let key = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
const api = new TSGhostAdminAPI(url, key, "v5.0");

// Input data are fully typed and then parsed through the appropriate Zod Schema
const adding = await api.posts.add({
  title: title,
  html: "<p>Hello from ts-ghost</p>",
  tags: [{ name: "ts-ghost" }],
  tiers: [{ name: "ts-ghost" }],
  custom_excerpt: "This is custom excerpt from ts-ghost",
  meta_title: "Meta Title from ts-ghost",
  meta_description: "Description from ts-ghost",
  featured: true,
  og_title: "OG Title from ts-ghost",
  og_description: "OG Description from ts-ghost",
  twitter_title: "Twitter Title from ts-ghost",
  twitter_description: "Twitter Description from ts-ghost",
  visibility: "public",
  slug: "foobarbaz",
});

if (!adding.success) {
  console.error(adding.errors);
  throw new Error("Failed to create post");
}

const newPost = adding.data;
//     ^? type Post

// Update
const postEdit = await api.posts.edit(newPost.id, {
  custom_excerpt: "Modified excerpt from ghost",
  // This is required by Ghost to send the updated_at field with the updated_at
  // of the post you want to edit.
  updated_at: new Date(newPost.updated_at || ""),
});

if (!postEdit.success) {
  console.error(postEdit.errors);
  throw new Error("Failed to edit post");
}

const editedPost = postEdit.data;
//     ^? type Post

// Delete
const postDelete = await api.posts.delete(editedPost.id);
if (!postDelete.success) {
  console.error(postDelete.errors);
  throw new Error("Failed to delete post");
}
```
# Browse

The `browse` method is used to get a list of items from a Ghost Admin API resource, it is the equivalent of the `GET /members` endpoint. You have access to different options to paginate, limit, filter and order your results.

## Options

These options are totally _optionals_ on the `browse` method but they let you filter and order your search.

This is an example containing all the available keys in the params object

```ts
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(
  "https://demo.ghost.io",
  "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
  "v5.0"
);

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

Lets you filter the results with the [Ghost API `filter` syntax](https://ghost.org/docs/admin-api/#filtering). But with the power of TypeScript, you will get **lint errors if you use unknown fields**.

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

There is a section [dedicated to output modifiers here](/docs/admin-api/output-modifiers).

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

Paginate is a method that will return a cursor and a `next` fetcher to directly have the next query with the same parameters but on page n + 1. See a complete example in the [Common Recipes](/docs/admin-api/common-recipes) section.

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

The `read` method is used to one item from a Ghost Admin API resource, it is the equivalent of the `GET /posts/slug/this-is-a-slug` endpoint. You have to give it an identity field to fetch the resource.

## Options

Options for the read method depends on the resource you are querying. Each resource have a specific identity field that you can use to fetch it.

For example, the `Post` resource will have `id` and `slug` as identity fields but the `Member` resource will only have `id`. On the other hand the `User` resource will have `id`, and `email` as identity fields.

**Use TypeScript autocomplete to guide you through the available identity fields.**

```ts
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(
  "https://demo.ghost.io",
  "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
  "v5.0"
);

let query = api.users.read({
  email: "philippe@ts-ghost.com"
});

// or

let query = api.users.read({
  id: "edHks74hdKqhs34izzahd45"
});
```

### Not recommended:

You can submit **both** `id` and `email`, but the fetcher will then chose the `id` in priority if present to make the final URL query to the Ghost API.

```ts
let query = api.users.read({
  id: "edHks74hdKqhs34izzahd45", // id will take priority
  email: "philippe@ts-ghost.com",
});
```

The order of preference is `id` > `slug` > `email`.

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

In the Admin API, the `formats` method lets you add alternative content formats on the output of `Post` or `Page` resource to get the content in `plaintext` or `html`. Available options are `plaintext | html | mobiledoc`.

<Callout type="info">
  In the Admin API the `html` is not the default format given back when calling `read` or `browse` on the
  `Post` or `Page` resource. You have to use the `formats` method to get it.
</Callout>

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

## Combining output modifiers

You can combine output modifiers to get the result you want. For example if you want to get the `html` and `plaintext` content of a `Post`:

```ts
let result = await api.posts
  .read({
    slug: "this-is-a-post-slug",
  })
  .fields({
    title: true,
    slug: true,
    plaintext: true,
    html: true,
  })
  .formats({
    plaintext: true,
    html: true,
  })
  .fetch();
```

<Callout type="warning">
  The order of calling is important!

- `fields` will modify the output schema to only have the fields you selected.
- `formats` will make required the fields you selected (from the already filtered fields!).

So, if you call `formats({"html": true})` but you didn't include it in the `fields({...})` before, TypeScript will yell at you.

</Callout>
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
# Add

Add lets you create a new record of a given resource. The `add` method is available on the resources that support it. (For example on the `users` resource don't have access to any mutation methods).

The `add` method is asynchronous and accept a data object and an optional `option` object. The shapes given to the data and the option are fully typed so you will benefit from auto-completion and missing required fields. The `option` is also typesafe and will be available on some resources (most resource don't have options).

You will benefit also from **run-time validation**, the data you input will be parsed before being send through the network.

## Simple example without options

Here we create a Post with the minimum required fields: `title`:

```ts
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(
  "https://demo.ghost.io",
  "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
  "v5.0"
);

const postAdd = await api.posts.add({
  title: title,
});
```

## Create a member (with options)

The `members` resource accept an option to send an email or not to the member:

```ts
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(
  "https://demo.ghost.io",
  "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
  "v5.0"
);

const memberAdd = await api.members.add(
  { name: "Philippe", email: "philippe@ts-ghost.com" },
  { send_email: false }
);
```

## Result

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
# Edit

Edit lets you edit an existing record of a given resource by inputing the resource `id` and the new data. The `edit` method is available on the resources that support it. (For example on the `users` resource don't have access to any mutation methods).

The `edit` method is asynchronous and accept the `id`, the data object and an optional `option` object. The shapes given to the data and the option are fully typed so you will benefit from auto-completion and missing required fields. The `option` is also typesafe and will be available on some resources (most resource don't have options).

You will benefit also from **run-time validation**, the data you input will be parsed before being send through the network.

## Example editing members

Here we want to edit a Member to attach a `stripe_customer_id` to it and we will give the option to not send an email to the member because we want to handle that ourself.

```ts
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(
  "https://demo.ghost.io",
  "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
  "v5.0"
);

const membersEdit = await api.members.edit(
  "edHks74hdKqhs34izzahd45",
  { stripe_customer_id: "cus_123456789" },
  { send_email: false }
);
```

## Result

The result will be parsed and typed with the `output` schema and represent the newly created record.

```ts
// return from the `edit` method
const result: {
    success: true;
    data: Member;
} | {
    success: false;
    errors: {
        message: string;
        type: string;
    }[];
}
```
# Delete

Delete is an async function that requires the `id` of the record to delete. _Some resources don't support deletion, but instead give you accessed to a soft delete through the `status` field in the `edit` method._

The only argument is the `id` of the record to delete, in this example we delete a member.

```ts
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(
  "https://demo.ghost.io",
  "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
  "v5.0"
);
const result = await api.members.delete("edHks74hdKqhs34izzahd45");

if (!result.success) {
  console.error(result.errors);
  throw new Error("Failed to delete Member");
}
```

## Result

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
# Members & Subscriptions recipes

The advantage of using the admin API is that you can create, edit and delete members. This is not possible with the content API.

## Handling new members and add their stripe susbscription

Using the admin API you can create a new member with minimal information name and email

```ts title
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(env.GHOST_URL, env.GHOST_ADMIN_API_KEY, "v5.0");

const membersAdd = await api.members.add(
  { name: "Philippe", email: "philippe@ts-ghost.com" },
  { send_email: false }
);
```

Then later update that member to add a stripe customer id

```ts
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(env.GHOST_URL, env.GHOST_ADMIN_API_KEY, "v5.0");

const membersEdit = await api.members.edit(
  "edHks74hdKqhs34izzahd45",
  { stripe_customer_id: "cus_123456789" },
  { send_email: false }
);
```

## Get all Paid tiers that are active

You can get all the Tiers you created from your Ghost Blog and filter them by active and paid tiers.

```ts title
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(env.GHOST_URL, env.GHOST_ADMIN_API_KEY, "v5.0");
const tiers = await api.tiers
  .browse({
    filter: "active:true+type:paid",
  })
  .include({ benefits: true, monthly_price: true, yearly_price: true })
  .fetch();

if (!tiers.success) {
  throw new Error(tiers.errors.join(", "));
}
console.log(tiers);
```

## Get Members active subscriptions

This is a quick example to get the subscriptions of a member and filter them by active status.

```ts title
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

export const getMemberActiveSubscriptions = async (memberId: string) => {
  const api = new TSGhostAdminAPI(env.GHOST_URL, env.GHOST_ADMIN_API_KEY, "v5.0");
  const subscriptions = await api.members.read({ id: memberId }).fields({ subscriptions: true }).fetch();
  if (!subscriptions.success) {
    throw new Error(subscriptions.errors.join(", "));
  }
  return subscriptions.data.subscriptions.filter((sub) => sub.status === "active");
};
```
# How to avoid post / page "UPDATE_COLLISION" Error

When updating `posts` or `page` with the Admin API, Ghost expects you to send the `updated_at` field with the **current updated_at value** of that Post or Page.

<Callout type="warning">
  This is only the case for Post and Page, and is a limitation from the Ghost API unfortunately.
</Callout>

If you don't send this field, you will get an `UPDATE_COLLISION` error. Here is an example workflow where we fetch the Post first and then update it:

```ts title
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const api = new TSGhostAdminAPI(env.GHOST_URL, env.GHOST_ADMIN_API_KEY, "v5.0");

const result = await api.posts
  .read({
    slug: "coming-soon",
  })
  .fetch();

if (!result.success) {
  throw new Error(result.errors.join(", "));
}
const post = result.data;

const postEditResult = await api.posts.edit(post.id, {
  custom_excerpt: "Modified excerpt from ghost",
  updated_at: new Date(post.updated_at || ""),
});
```
# Commons recipes

Here is a growing collections of things you can achieve with the `@ts-ghost/admin-api`.

## Getting all the posts (including Authors) with pagination

Here we will use the `paginate` function of the fetcher to get the next page fetcher directly if it is defined.

```ts title
import { TSGhostAdminAPI, type Post } from "@ts-ghost/admin-api";

let url = "https://demo.ghost.io";
let key = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8"; // Admin API KEY
const api = new TSGhostAdminAPI(url, key, "v5.0");

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

Settings is a specific resource, you cannot build query against it like the other resources. You can only fetch the settings, so calling `api.settings` will directly give you a fetcher. It will return an array of Key/Value. The keys are the settings names and the values are the settings values.

<Callout type="info">
  This `settings` resource is different from the [@ts-ghost/content-api](/docs/content-api/common-recipes)
  `settings` resource. The Admin API `settings` gives more info but just in key/value form.
</Callout>

```ts
import { TSGhostAdminAPI, type Post } from "@ts-ghost/admin-api";

let url = "https://demo.ghost.io";
let key = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8"; // Admin API KEY
const api = new TSGhostAdminAPI(url, key, "v5.0");

let result = await api.settings.fetch();
if (result.success) {
  const settings = result.data;
  //     ^? type Settings {title: string; description: string; ...
}
```
# Remix example

Here is an example using the `@ts-ghost/admin-api` in a Remix loader:

<Steps>

### Installation

```bash title="Terminal"
pnpm add @ts-ghost/admin-api
```

### Create `.env` variable

```bash title=".env"
GHOST_URL="https://myblog.com"
GHOST_ADMIN_API_KEY="1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8"
```

### Use in your route loader

```tsx title="app/routes/_index.tsx"
import { json, type LoaderArgs, type V2_MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export async function loader({ request }: LoaderArgs) {
  const api = new TSGhostAdminAPI(
    process.env.GHOST_URL || "",
    process.env.GHOST_ADMIN_API_KEY || "",
    "v5.0"
  );
  const [site, posts] = await Promise.all([api.site.fetch(), api.posts.browse().fetch()]);

  if (!site.success) {
    throw new Error(site.errors.join(", "));
  }
  if (!posts.success) {
    throw new Error(posts.errors.join(", "));
  }
  return json({ site: site.data, posts: posts.data });
}

export default function Index() {
  const { site, posts } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>This is a list of posts for {site.title}:</h1>
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

This is an example for NextJS 13 using the `@ts-ghost/admin-api` with the app Router where we fetch the list of posts and the site settings to display them on the `/blog` of our site.

<Steps>

### Installation

```bash title="Terminal"
pnpm add @ts-ghost/admin-api
```

### Create `.env` variable

```bash title=".env"
GHOST_URL="https://myblog.com"
GHOST_ADMIN_API_KEY="1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8"
```

### Create a file in the app folder to instantiate the API

```ts title="app/blog/ghost.ts"
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

export const api = new TSGhostAdminAPI(
  process.env.GHOST_URL || "",
  process.env.GHOST_ADMIN_API_KEY || "",
  "v5.0"
);
```

### Use the API in the app Router

```tsx title="app/blog/page.tsx"
import { api } from "./ghost";

async function getBlogPosts() {
  const response = await api.posts.browse().fields({ title: true, slug: true, id: true }).fetch();
  if (!response.success) {
    throw new Error(response.errors.join(", "));
  }
  return response.data;
}

async function getSiteSettings() {
  const response = await api.site.fetch();
  if (!response.success) {
    throw new Error(response.errors.join(", "));
  }
  return response.data;
}

// async Server Component
export default async function HomePage() {
  const [posts, site] = await Promise.all([getBlogPosts(), getSiteSettings()]);
  return (
    <div>
      <h1>This is a list of posts for {site.title}:</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            {post.title} ({post.slug})
          </li>
        ))}
      </ul>
    </div>
  );
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
import type { BrowseParams, Post } from "@ts-ghost/admin-api";

const uncontrolledOrderInput = async (formData: FormData) => {
  const order = formData.get("order");
  const filter = formData.get("filter");
  const result = await api.posts
    .browse({ order, filter } as BrowseParams<{ order: string; filter: string }, Post>)
    .fetch();
};
```


## Roadmap

- [x] Handle POST, PUT, DELETE requests
- [ ] Handle Image, Media, Files and Theme uploads

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
