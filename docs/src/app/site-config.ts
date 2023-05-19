import { Book, BookLock, Boxes, ChevronRightSquare, type LucideIcon } from "lucide-react";

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
  disabled: false;
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
            // {
            //   title: "Usage",
            //   href: "/docs/admin-api/usage",

            // },
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
          ],
        },
      ],
    },
    {
      package: "@ts-ghost/core-api",
      fsPath: "packages/ts-ghost-core-api",
      title: "Core API",
      path: "/docs/core-api",
      description: "The base building blocks for the Content and Admin API. Used internally.",
      disabled: false,
      navigation: [
        {
          title: "Core API",
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
