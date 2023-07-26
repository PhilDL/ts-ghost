import { Callout } from "~/components/mdx/callout";
import { Codeblock } from "~/components/mdx/code-block";
import { ContentNavigation } from "~/components/mdx/content-navigation";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import * as React from "react";

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    h1: (props) => <h1 className="font-cal mt-10 scroll-m-20 text-4xl font-bold" {...props} />,
    h2: (props) => (
      <h2 className="font-cal mt-10 scroll-m-20 border-b pb-2 text-3xl font-bold first:mt-0" {...props} />
    ),
    h3: (props) => <h3 className="font-cal mt-8 scroll-m-20 text-2xl font-bold" {...props} />,
    h4: (props) => <h4 className="font-cal -mb-4 mt-6 scroll-m-20 text-2xl font-bold" {...props} />,
    p: (props) => <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />,
    a: ({ children, href }) => {
      const isExternal = href?.startsWith("http");
      const Component = isExternal ? "a" : Link;
      return (
        <Component
          href={href as string}
          className="decoration-primary underline decoration-2 underline-offset-4"
        >
          {children}
        </Component>
      );
    },
    ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-8" {...props} />,
    blockquote: (props) => <blockquote className="mt-4 border-l-4 pl-4" {...props} />,
    table: (props) => <table className="border-muted w-full table-auto rounded-md border" {...props} />,
    thead: (props) => <thead className="bg-muted" {...props} />,
    tbody: (props) => <tbody className="divide-muted divide-y" {...props} />,
    tr: (props) => <tr className="divide-x" {...props} />,
    td: (props) => <td className="p-2" {...props} />,
    code: (props) => (
      <code
        className="bg-muted text-muted-foreground relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
        {...props}
      />
    ),
    pre: Codeblock,

    img: (props) => <img {...props} className="rounded-lg" />,

    // Add custom components.
    Callout,
    ContentNavigation,
    Steps: ({ ...props }) => (
      <div className="[&>h3]:step mb-12 ml-4 border-l pl-6 [counter-reset:step]" {...props} />
    ),

    // Pass through all other components.
    ...components,
  };
}
