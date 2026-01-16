# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ts-ghost is a monorepo containing TypeScript libraries and tools for interacting with the Ghost blogging platform API. It provides strongly-typed Content and Admin API clients with Zod schema validation.

All these packages are published to npm and can be used in other projects.

The main consumer-facing packages (npm packages) are:

- @ts-ghost/content-api
- @ts-ghost/admin-api
- @ts-ghost/ghost-blog-buster

Very important to say that these packages are used in production by consumers, so we need to be very careful with breaking changes.

These other packages are used internally and can handle breaking changes moderatly:

- @ts-ghost/core-api

## Build & Development Commands

```bash
# Install dependencies
pnpm i

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for a specific package
pnpm test:watch --filter @ts-ghost/core-api

# Integration tests (requires .env with real Ghost instance credentials)
pnpm test:integration

# Linting and type checking
pnpm lint
pnpm typecheck

# Run all validation (lint + typecheck + test)
pnpm validate

# Format code
pnpm format:write

# Run playground scripts for API packages
pnpm playground:admin-api
pnpm playground:content-api
```

## Monorepo Structure

- **packages/ts-ghost-core-api** (`@ts-ghost/core-api`): Core building blocks - APIComposer, Fetchers (Browse/Read/Mutation/Delete), HTTPClient, and Zod schemas for Ghost API resources
- **packages/ts-ghost-content-api** (`@ts-ghost/content-api`): Content API client for read-only operations (posts, pages, authors, tags, tiers, settings)
- **packages/ts-ghost-admin-api** (`@ts-ghost/admin-api`): Admin API client with full CRUD operations (posts, pages, members, tags, tiers, newsletters, offers, users, webhooks)
- **apps/ghost-blog-buster** (`@ts-ghost/ghost-blog-buster`): CLI tool for exporting Ghost blog content to Markdown
- **packages/tsconfig**: Shared TypeScript configuration
- **docs**: Documentation site
- **examples/nextjs**: Example Next.js integration

## Architecture

### Core API Pattern

The `@ts-ghost/core-api` package provides the foundation:

1. **APIComposer** (`api-composer.ts`): Generic class that composes API operations (browse, read, add, edit, delete) using Zod schemas for input/output validation. Configured with resource schemas, identity schemas, include schemas, and optional create/update schemas.

2. **Fetchers**: Each operation type has a dedicated fetcher class:
   - `BrowseFetcher`: List resources with filtering, pagination, field selection
   - `ReadFetcher`: Fetch single resource by id/slug/email
   - `MutationFetcher`: Create and update operations
   - `DeleteFetcher`: Delete operations

3. **HTTPClient/HTTPClientFactory**: Handles HTTP requests with JWT authentication for Admin API and key-based auth for Content API

4. **Schemas** (`schemas/`): Zod schemas for all Ghost API resources (posts, pages, authors, tags, tiers, members, newsletters, etc.)

### Type-Safe Query Building

Fetchers use a builder pattern with method chaining:

- `.fields({ title: true, slug: true })` - Select specific fields (modifies output type)
- `.include({ authors: true, tags: true })` - Include related resources (modifies output type)
- `.formats({ html: true })` - Select content formats for posts/pages
- `.fetch()` - Execute the query and return typed result

Results are discriminated unions with `{ success: true, data: T }` or `{ success: false, errors: Error[] }`.

### Package Dependency Flow

```
@ts-ghost/core-api (base schemas, fetchers, http client)
       ↓
@ts-ghost/content-api  &  @ts-ghost/admin-api (API-specific schemas and clients)
       ↓
@ts-ghost/ghost-blog-buster (CLI using both APIs)
```

## Environment Variables

For integration testing and playground scripts, create `.env`:

```
GHOST_URL=https://your-ghost-instance.com
GHOST_CONTENT_API_KEY=your-content-api-key
GHOST_ADMIN_API_KEY=your-admin-api-key
GHOST_VERSION=v5.x
```

## Versioning

Uses Changesets for version management:

```bash
pnpm changeset        # Create a new changeset
pnpm version-packages # Apply changesets and bump versions
```

## Key Dependencies

- **Zod**: Schema validation and TypeScript type inference (imported as `zod/v3`)
- **jose**: JWT signing for Admin API authentication
- **Turborepo**: Build orchestration
- **tsup**: TypeScript bundling
- **Vitest**: Testing framework

## Testing Notes

- Tests are extremly important, especially on new features.
- Unit tests run against mocked fetch responses
- Integration tests require a real Ghost instance with specific test data (CI uses `astro-starter.digitalpress.blog`)
- Tests include type checking via `vitest --typecheck`
