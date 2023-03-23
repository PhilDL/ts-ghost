---
"@ts-ghost/admin-api": patch
"@ts-ghost/content-api": patch
"@ts-ghost/core-api": patch
"@ts-ghost/ghost-blog-buster": patch
---

## Improved admin-api
Add missing resources:

- tags
- offers
- users
- newsletters

## Improved typing and usage of the new fetchers methods.
Fetcher methods .fields(), .formats() and .include() got some upgrade to have better type-safety for unknown fields and runtime stripping of unknown keys.

## Upgrade dependencies
Upgrade most of the devDependencies with TypeScript 5.0 compatible versions (lint, prettier, etc)
