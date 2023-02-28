<!-- Warning about Beta status of the package -->
<!-- <p align="center">
  <img src="https://img.shields.io/badge/status-beta-orange.svg" alt="Status: Beta" />
</p> -->

<br/>
<p align="center">
  <a href="https://github.com/PhilDL/ts-ghost">
    <img src="https://user-images.githubusercontent.com/4941205/221607740-28ce02cb-da96-4e34-a40d-8163bb7c668f.png" alt="Logo" width="auto" height="80">
  </a>

  <h3 align="center"><code>@ts-ghost/content-api</code></h3>

  <p align="center">
    <code>@ts-ghost/content-api</code> is a strongly-typed TypeScript client to interract with the Ghost Content API.
    <br/>
    <br/>
  </p>
</p>

![License](https://img.shields.io/github/license/PhilDL/ts-ghost) <img src="https://img.shields.io/badge/status-beta-orange.svg" alt="Status: Beta" />

## About The Project

`@ts-ghost/content-api` provides a strongly-typed TypeScript client to interract with the Ghost Content API based on [Zod](https://github.com/colinhacks/zod) schemas passed through a QueryBuilder and then a Fetcher.

## Install

```shell
npx @ts-ghost/content-api
```

## Basic Usage

### API Instantiation

```typescript
let url = "https://demo.ghost.io";
let key = "22444f78447824223cefc48062"; // Content API KEY
const api = new TSGhostContentAPI(url, key, "v5.0");
```

The instantiation is validated through a Schema so the URL should be correct and the 
key should be in the right format corresponding to the Ghost Content API (26 Hex chars)

### Fetching from endpoints

```typescript
// Get all posts (actually limited to 15 by Ghost API)
const res = await api.posts().browse().fetch();
if (res.status === "success") {
  const posts = res.data; // Typed Array of Posts
  const meta = res.meta; // Typed Meta containing pagination elements
  for (const post of posts) {
    console.log(post.title);
  }
} else {
  console.error(res.errors);
}
```


## Roadmap

- Write more docs
- Better handling of weird Ghost "include" params in API call

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
