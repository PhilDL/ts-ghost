import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx", "md"],
  redirects: () => [{ source: "/docs", destination: "/docs/introduction", permanent: true }],
  typescript: { ignoreBuildErrors: true, tsconfigPath: "./tsconfig.json" },
};

const withMdx = createMDX({
  options: {
    rehypePlugins: [
      [
        "rehype-pretty-code",
        /** @type {import("rehype-pretty-code").Options} */
        ({
          theme: "nord",
          keepBackground: false,
        }),
      ],
    ],
    remarkPlugins: ["remark-gfm"],
  },
});

export default withMdx(nextConfig);
