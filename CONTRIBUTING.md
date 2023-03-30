# Contributing

Thank you for thinking about contributing! `ts-ghost` is a small project that wants to grow and improve. We are always looking for new contributors to help us make it better. This document will help you get started.
## Development workflow

We use [pnpm](https://pnpm.io) as our package manager, so make sure to [install](https://pnpm.io/installation) it first.

```bash
git clone git@github.com:PhilDL/ts-ghost.git
cd ts-ghost
pnpm i
pnpm build
```

### Commands

This is a monorepo powered by turborepo, so you can run commands in the root directory and it will run the command in all packages.

```bash
# From the project root directory
pnpm build
```

This will build all the packages.

### Testing

During your developement you may want to keep the tests running in watch mode.

```bash
# From the project root directory
pnpm test:watch
# If you want to test a specific package
pnpm test:watch --filter @ts-ghost/core-api
```

### Integration Testing against real Ghost Instance

Integration testing is done in `@ts-ghost/content-api` and `@ts-ghost/admin-api` packages, against a test instance of Ghost called [`astro-starter-ghost`](https://astro-starter.digitalpress.blog). These tests are 
made to be run in CI with the hidden `.env` variables containing admin and content API key set for that specific ghost instance.

Trying to run these tests locally without having the correct `.env` values will certainly fail.

```bash
# From the project root directory
# This will fail as it is expecting specific values from a specific Ghost Instance
pnpm test:integration:watch
```

### Linting, typecheck

```bash
# Eslint
pnpm lint
# Typecheck typescript
pnpm typecheck
```

### Running `validate` to lint, typecheck and tests

```bash
# From the project root directory
pnpm validate
```

### Documentation

```bash
cd www/ && pnpm dev
```

## Project overview

This project is a monorepo of packages with well-defined purposes. It is composed of an app "ghost-blog-buster", and several API Client packages.

- The `ghost-blog-buster` CLI is located in the `apps` directory.
- Client API Packages are located in the `packages` directory.

### `@ts-ghost/ghost-blog-buster`

TODO: write description and help for this package.

### `@ts-ghost/content-api`

TODO: write description and help for this package.


### `@ts-ghost/admin-api`

TODO: write description and help for this package.

### `@ts-ghost/core-api`

TODO: write description and help for this package.
