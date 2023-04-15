<br/>
<br/>

<div align="center">
  <a href="https://github.com/PhilDL/ts-ghost">
    <img src="https://user-images.githubusercontent.com/4941205/221596772-398ca6b9-45c4-40e2-9cfc-d85b2da04cc7.png" alt="Logo" width="auto" height="90">
  </a>

  <h3 align="center">Ghost Blog Buster</h3>

  <p align="center">
    Convert your Ghost Blog posts to Markdown with an elegant CLI. Convert all or selected blog Posts or Pages and aother functionnalities!
    <br/>
    <br/>
    <a href="https://github.com/PhilDL/ts-ghost/issues">Report Bug</a>
    .
    <a href="https://github.com/PhilDL/ts-ghost/issues">Request Feature</a>
  </p>
</div>

![License](https://img.shields.io/github/license/PhilDL/ts-ghost) <img alt="GitHub package.json version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/v/PhilDL/ts-ghost?filename=apps%2Fghost-blog-buster%2Fpackage.json">

![Screen Shot](https://user-images.githubusercontent.com/4941205/221599018-60f66258-9cfa-459a-928d-907c2df01f0e.gif)

## About The Project

Ghost Blog Buster is an interactive CLI allowing you to interact with your Ghost Blog directly via the Ghost Content API. From the cli you will be able to:

- 🌪️ Choose between **Content API** or **Admin API** (for members or blog post content behind subscribption)
- 📚 Export specific or all blog **Posts** in **Markdown** format to the folder of your choice.
- ⚙️ Display or export to JSON your **Tags**, **Tiers**, **Authors**, **Members** (Admin API only)
- 📶 Connect / Disconnect from the Blog

## Compatible Ghost versions.

This tool was developped and tested mostly for Ghost versions 5.x.

- Ghost 5^

## Built With

- [TypeScript](https://github.com/microsoft/TypeScript)
- [Clack](https://github.com/natemoo-re/clack) to build beautiful prompts.
- [@ts-ghost/content-api](https://www.npmjs.com/package/@ts-ghost/content-api) for TypeSafe 🦾 interaction with the Ghost Content API.

## Basic usage

Use directly with `npx`

```sh
npx @ts-ghost/ghost-blog-buster
```

Or install globally

```sh
npm install -g @ts-ghost/ghost-blog-buster
```

Then, in a new SHELL session, launch with

```
ghost-blog-buster
```

## Advanced usage

If you want to bypass the interactive prompts, you can use the CLI with pipeable commands.

### Export content with `export <resource>`

For example if we already configured the URL and the Content API key, we can export all the posts to the `./posts` folder with the following command:

```sh
ghost-blog-buster export posts --output ./posts
```

#### Options available

- `--host` or `-h`: The URL of the blog (if not provided, it will check your config file that is filled by the interactive prompt)
- `--key` or `-k`: The Content API key (if not provided, it will check your config file that is filled by the interactive prompt)
- `--output` or `-o`: The destination folder. If no output is provided, content will go to stdout.

Full example:

```sh
ghost-blog-buster export posts --host https://astro-starter.digitalpress.blog --key e9b414c5d95a5436a647ff04ab --output ./posts
```

Available export

### Display help

```sh
ghost-blog-buster --help
```

### Export content from Admin API with `export-admin <resource>`

This export use the Admin API and require you to provide the Admin API key. An Admin API key is different from the Content API key. You can either use a Staff access token, visible at the bottom of a Ghost User profile or you can find it in your Ghost Admin panel, in the Integrations section.

This is useful if your Blog Posts contain a free preview, paid content and you want to export everything.

```sh
ghost-blog-buster export-admin posts --output ./posts
```

#### Options available

- `--host` or `-h`: The URL of the blog (if not provided, it will check your config file that is filled by the interactive prompt)
- `--key` or `-k`: The Content API key (if not provided, it will check your config file that is filled by the interactive prompt)
- `--output` or `-o`: The destination folder. If no output is provided, content will go to stdout.

Full example:

```sh
ghost-blog-buster export-admin posts --host https://astro-starter.digitalpress.blog --key 1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8 --output ./posts
```

Available `export-admin <resource>` resources:

- `posts`
- `pages`
- `members`

### Example piping commands

You can use `>` to pipe the content into a file or something else.

```sh
ghost-blog-buster export authors --host https://astro-starter.digitalpress.blog --key e9b414c5d95a5436a647ff04ab > authors.json
```

## Roadmap

- [ ] Interact with more content
- [ ] Customize the frontmatter output
- [x] Usage without interactive prompts, pipeable cmds

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

- [Ghost](https://ghost.org/) is the best platform for blogging 💖.
- [Clack](https://github.com/natemoo-re/clack) to build beautiful prompts.
