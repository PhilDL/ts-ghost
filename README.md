<br/>
<br/>

<div align="center">
  <a href="https://github.com/PhilDL/ts-ghost">
    <img src="https://user-images.githubusercontent.com/4941205/221607740-28ce02cb-da96-4e34-a40d-8163bb7c668f.png" alt="Logo" width="auto" height="80">
  </a>

  <h3 align="center"><code>ts-ghost</code></h3>

  <p align="center">
    <code>@ts-ghost</code> is a collection of tools written in TypeScript to interract with a Ghost Blog. Strongly 🦾 typed Content-Api, Cli tools, and more coming!
    <br/>
    <br/>
  </p>
</div>

![License](https://img.shields.io/github/license/PhilDL/ts-ghost) <img src="https://img.shields.io/badge/status-beta-orange.svg" alt="Status: Beta" />

## About The Project

[Ghost](https://ghost.org/) is an amazing open source blogging platform. Beautiful CMS and good API but there is lack of strongly types TypeScript libraries to interact with its API. This is where the `ts-ghost` suite comes in.

Here you will find links to the different packages of the `ts-ghost` suite.

## [💻 Ghost blog Buster](https://github.com/PhilDL/ts-ghost/tree/main/apps/ghost-blog-buster)

An elegant cli 🤖 to interact with your Ghost Blog directly via the Ghost Content API or Admin API and export posts in Markdown format. From the cli you will be able to:

```shell
npx @ts-ghost/ghost-blog-buster
```

or 

```shell
npm install -g @ts-ghost/ghost-blog-buster
```

- 🌪️ Choose between **Content API** or **Admin API** (for members or blog post content behind subscribption)
- 📚 Export specific or all blog **Posts** in **Markdown** format to the folder of your choice. 
- ⚙️ Display or export to JSON your **Tags**, **Tiers**, **Authors**, **Members** (Admin API only)
- 📶 Connect / Disconnect from the Blog
- [See project](https://github.com/PhilDL/ts-ghost/tree/main/apps/ghost-blog-buster)


## [📦 TS Ghost Content API](https://github.com/PhilDL/ts-ghost/tree/main/packages/ts-ghost-content-api)

A strongly 🦾 typed TypeScript library to interact with the Ghost Content API:

```shell
npm install @ts-ghost/content-api
```

- Browse and Read your blog **Posts**, **Pages**, **Tags**, **Tiers**, **Authors** and **Settings**
- Type-safe Inputs/Outputs.
- Models schema and run-type safety with [Zod](https://github.com/colinhacks/zod).
- [See project](https://github.com/PhilDL/ts-ghost/tree/main/packages/ts-ghost-content-api)


## [📦 TS Ghost Admin API](https://github.com/PhilDL/ts-ghost/tree/main/packages/ts-ghost-admin-api)

A strongly 🦾 typed TypeScript library to interact with the Ghost Admin API:

```shell
npm install @ts-ghost/admin-api
```

- Browse and Read your blog **Posts**, **Pages**, and **Members** (More coming soon)
- Type-safe Inputs/Outputs.
- Models schema and run-type safety with [Zod](https://github.com/colinhacks/zod).
- [See project](https://github.com/PhilDL/ts-ghost/tree/main/packages/ts-ghost-admin-api)


## [📦 TS Ghost Core API](https://github.com/PhilDL/ts-ghost/tree/main/packages/ts-ghost-core-api)

The base building block containing QueryBuilders and Fetchers (Browse / Read) accepting Zod Schemas.

```shell
npm install @ts-ghost/core-api
```

- Input type-safety of the Ghost API params
- Modify Type Output based on Input params
- [See project](https://github.com/PhilDL/ts-ghost/tree/main/packages/ts-ghost-core-api)


## Roadmap

- Ghost Admin API integration
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
* [Clack](https://github.com/natemoo-re/clack) to build beautiful prompts.
