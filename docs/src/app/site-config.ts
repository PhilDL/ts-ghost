export const siteConfig = {
  name: "ts-ghost",
  description:
    "@ts-ghost is a collection of tools written in TypeScript to interract with a Ghost Blog. Strongly 🦾 typed Content-Api, Cli tools, and more coming!",
  mainNav: [
    {
      title: "Documentation",
      href: "/docs/introduction",
    },
  ],
  sidebarNav: [
    {
      title: "ts-ghost ecosystem",
      items: [
        {
          title: "Introduction",
          href: "/docs/introduction",
          items: [],
        },
      ],
    },
    {
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
