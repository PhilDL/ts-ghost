<!-- Warning about Beta status of the package -->
<!-- <p align="center">
  <img src="https://img.shields.io/badge/status-beta-orange.svg" alt="Status: Beta" />
</p> -->

<br/>
<p align="center">
  <a href="https://github.com/PhilDL/ts-ghost">
    <img src="https://user-images.githubusercontent.com/4941205/221596772-398ca6b9-45c4-40e2-9cfc-d85b2da04cc7.png" alt="Logo" width="140" height="90">
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
</p>

![License](https://img.shields.io/github/license/PhilDL/ts-ghost) 

![Screen Shot](https://user-images.githubusercontent.com/4941205/221599018-60f66258-9cfa-459a-928d-907c2df01f0e.gif)

## About The Project

Ghost Blog Buster is an interactive CLI allowing you to interact with your Ghost Blog directly via the Ghost Content API. From the cli you will be able to:

- 📚 Export specific or all blog **Posts** in **Markdown** format to the folder of your choice. 
- ⚙️ Display or export to JSON your **Tags**, **Tiers** and **Authors**
- 📶 Connect / Disconnect from the Blog

## Built With

- [TypeScript](https://github.com/microsoft/TypeScript)
- [Clack](https://github.com/natemoo-re/clack) to build beautiful prompts.
- [@ts-ghost/content-api](https://github.com/PhilDL/ts-ghost/packages/content-api) for TypeSafe 🦾 interaction with the Ghost Content API.

### Installation

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

## Roadmap

- Interact with more content
- Customize the frontmatter output
- Usage without interactive prompts, pipeable cmds

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.
* If you have suggestions for adding or removing projects, feel free to [open an issue](https://github.com/PhilDL/ts-ghost/issues/new) to discuss it, or directly create a pull request after you edit the *README.md* file with necessary changes.
* Please make sure you check your spelling and grammar.
* Create individual PR for each suggestion.
* Please also read through the [Code Of Conduct](https://github.com/PhilDL/ts-ghost/blob/main/CODE_OF_CONDUCT.md) before posting your first idea as well.


## License

Distributed under the MIT License. See [LICENSE](https://github.com/PhilDL/ts-ghost/blob/main/LICENSE.md) for more information.

## Authors

* **Philippe L'ATTENTION** - *Loves coding* - [Philippe L'ATTENTION](https://github.com/PhilDL) - *Creator*

## Acknowledgements

* [https://ghost.org/](Ghost) is the best platform for blogging 💖.
* [Clack](https://github.com/natemoo-re/clack) to build beautiful prompts.