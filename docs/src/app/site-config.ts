export type NavItem = {
  title: string;
  href: string;
  external?: boolean;
  disabled?: boolean;
  label?: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export type PackageDocumentationConfig = {
  package: string;
  fsPath: string;
  title: string;
  path: string;
  description: string;
  disabled: boolean;
  navigation: NavSection[];
};

export type SiteConfig = {
  name: string;
  description: string;
  links: Record<string, string>;
  docs: PackageDocumentationConfig[];
};

export const siteConfig: SiteConfig = {
  name: "ts-ghost",
  description:
    "@ts-ghost is a collection of tools written in TypeScript to interract with a your Ghost Blog! \n End-to-end type-safety 🦾. Build on top of Zod, the Content and Admin API clients are type-safe and validated at runtime. There is also a beautiful CLI to interract with your Ghost Blog and extract data in Markdown or JSON.",
  links: {
    twitter: "https://twitter.com/_philDL",
    github: "https://github.com/PhilDL/ts-ghost",
    docs: "/docs",
  },
  docs: [
    {
      package: "@ts-ghost/content-api",
      fsPath: "packages/ts-ghost-content-api",
      title: "Content API",
      path: "/docs/content-api",
      description:
        "A TypeScript Content API Client for Ghost with end-to-end TypeSafety, using fetch compatible with NextJS and Remix.",
      disabled: false,
      navigation: [
        {
          title: "Content API",
          items: [
            {
              title: "Introduction",
              href: "/docs/content-api",
            },
            {
              title: "Quickstart",
              href: "/docs/content-api/quickstart",
            },
            {
              title: "Overview",
              href: "/docs/content-api/overview",
            },
          ],
        },
        {
          title: "Query methods",
          items: [
            {
              title: "Browse",
              href: "/docs/content-api/browse",
            },
            {
              title: "Read",
              href: "/docs/content-api/read",
            },
            {
              title: "Output modifiers",
              href: "/docs/content-api/output-modifiers",
            },
            {
              title: "Fetching",
              href: "/docs/content-api/fetching",
            },
          ],
        },
        {
          title: "How-to",
          items: [
            {
              title: "Common recipes",
              href: "/docs/content-api/common-recipes",
            },
            {
              title: "Remix",
              href: "/docs/content-api/remix",
            },
            {
              title: "NextJS",
              href: "/docs/content-api/nextjs",
            },
            {
              title: "TypeScript recipes",
              href: "/docs/content-api/advanced-typescript",
            },
            {
              title: "Migrating from Ghost SDK",
              href: "/docs/content-api/migrating-from-ghost-sdk",
            },
          ],
        },
      ],
    },
    {
      package: "@ts-ghost/admin-api",
      fsPath: "packages/ts-ghost-admin-api",
      title: "Admin API",
      path: "/docs/admin-api",
      description:
        "A TypeScript Admin API Client for Ghost with end-to-end TypeSafety for GET PUT and POST, using fetch compatible with NextJS and Remix.",
      disabled: false,
      navigation: [
        {
          title: "Admin API",
          items: [
            {
              title: "Introduction",
              href: "/docs/admin-api",
            },
            {
              title: "Quickstart",
              href: "/docs/admin-api/quickstart",
            },
            {
              title: "Overview",
              href: "/docs/admin-api/overview",
            },
          ],
        },
        {
          title: "Query methods",
          items: [
            {
              title: "Browse",
              href: "/docs/admin-api/browse",
            },
            {
              title: "Read",
              href: "/docs/admin-api/read",
            },
            {
              title: "Output modifiers",
              href: "/docs/admin-api/output-modifiers",
            },
            {
              title: "Fetching",
              href: "/docs/admin-api/fetching",
            },
          ],
        },
        {
          title: "Mutation methods",
          items: [
            {
              title: "Add",
              href: "/docs/admin-api/add",
            },
            {
              title: "Edit",
              href: "/docs/admin-api/edit",
            },
            {
              title: "Delete",
              href: "/docs/admin-api/delete",
            },
          ],
        },
        {
          title: "How-to",
          items: [
            {
              title: "Members & Subscriptions",
              href: "/docs/admin-api/members-recipes",
            },
            {
              title: "UPDATE_COLLISION error",
              href: "/docs/admin-api/posts-update-collision-error",
            },
            {
              title: "Common recipes",
              href: "/docs/admin-api/common-recipes",
            },
            {
              title: "Remix",
              href: "/docs/admin-api/remix",
            },
            {
              title: "NextJS",
              href: "/docs/admin-api/nextjs",
            },
            {
              title: "TypeScript recipes",
              href: "/docs/admin-api/advanced-typescript",
            },
            {
              title: "Migrating from Ghost SDK",
              href: "/docs/admin-api/migrating-from-ghost-sdk",
            },
          ],
        },
      ],
    },
    {
      package: "@ts-ghost/ghost-blog-buster",
      fsPath: "apps/ghost-blog-buster",
      title: "Ghost Blog Buster",
      path: "/docs/ghost-blog-buster",
      description:
        "A beautiful interractive CLI to connect to your Ghost Blog and export Posts to markdown, Members to JSON, etc...",
      disabled: false,
      navigation: [
        {
          title: "Ghost Blog Buster",
          items: [
            {
              title: "Introduction",
              href: "/docs/ghost-blog-buster",
            },
            {
              title: "Installation",
              href: "/docs/ghost-blog-buster/installation",
            },
            {
              title: "Usage",
              href: "/docs/ghost-blog-buster/usage",
            },
          ],
        },
      ],
    },
    {
      package: "@ts-ghost/core-api",
      fsPath: "packages/ts-ghost-core-api",
      title: "Core",
      path: "/docs/core-api",
      description: "The base building blocks for the Content and Admin API. Used internally.",
      disabled: false,
      navigation: [
        {
          title: "Core",
          items: [
            {
              title: "Introduction",
              href: "/docs/core-api",
            },
            // {
            //   title: "Usage",
            //   href: "/docs/core-api/usage",
            // },
          ],
        },
      ],
    },
  ],
};
