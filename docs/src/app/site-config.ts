export const siteConfig = {
  name: "ts-ghost",
  description:
    "@ts-ghost is a collection of tools written in TypeScript to interract with a Ghost Blog. Strongly 🦾 typed Content-Api, Cli tools, and more coming!",
  mainNav: [
    {
      title: "Content API",
      href: "/docs/content-api/introduction",
    },
    {
      title: "Admin API",
      href: "/docs/admin-api/introduction",
    },
    {
      title: "Core API",
      href: "/docs/core-api/introduction",
    },
    {
      title: "Ghost Blog Buster",
      href: "/docs/ghost-blog-buster/introduction",
    },
  ],
  sidebarNav: [
    {
      pathname: "/docs/introduction",
      title: "Ecosystem",
      items: [
        {
          title: "Introduction",
          href: "/docs/introduction",
          items: [],
        },
        {
          title: "@ts-ghost/content-api",
          href: "/docs/content-api/introduction",
          items: [],
        },
        {
          title: "@ts-ghost/admin-api",
          href: "/docs/admin-api/introduction",
          items: [],
        },
        {
          title: "@ts-ghost/core-api",
          href: "/docs/core-api/introduction",
          items: [],
        },
      ],
    },
    {
      pathname: "/docs/content-api",
      title: "@ts-ghost/content-api",
      items: [
        {
          title: "Introduction",
          href: "/docs/content-api/introduction",
          items: [],
        },
        {
          title: "Usage",
          href: "/docs/content-api/usage",
          items: [],
        },
      ],
    },
    {
      pathname: "/docs/admin-api",
      title: "@ts-ghost/admin-api",
      items: [
        {
          title: "Introduction",
          href: "/docs/admin-api/introduction",
          items: [],
        },
        {
          title: "Usage",
          href: "/docs/admin-api/usage",
          items: [],
        },
      ],
    },
    {
      pathname: "/docs/core-api",
      title: "@ts-ghost/core-api",
      items: [
        {
          title: "Introduction",
          href: "/docs/core-api/introduction",
          items: [],
        },
        {
          title: "Usage",
          href: "/docs/core-api/usage",
          items: [],
        },
      ],
    },
    {
      pathname: "/docs/ghost-blog-buster",
      title: "Ghost Blog Buster",
      items: [
        {
          title: "Introduction",
          href: "/docs/ghost-blog-buster/introduction",
          items: [],
        },
        {
          title: "Usage",
          href: "/docs/ghost-blog-buster/usage",
          items: [],
        },
      ],
    },
  ],
  links: {
    twitter: "https://twitter.com/_philDL",
    github: "https://github.com/PhilDL/ts-ghost",
    docs: "/docs",
  },
};

export type SiteConfig = typeof siteConfig;

export type SidebarNav = {
  title: string;
  items: {
    title: string;
    href: string;
    items: never[];
  }[];
}[];
