import { NodeHtmlMarkdown } from "node-html-markdown";
import type { Post } from "@ts-ghost/content-api";
import * as fs from "fs";

export const frontMatterGenerator = (post: Post): string => {
  if (!post) return "";
  const frontMatter = `---
title: ${post.title}
date: ${post.published_at}
tags: ${post.tags?.map((t) => t.name).join(", ")}
status: ${post.published_at ? "published" : "draft"}
feature_image: ${post.feature_image}
canonical_url: ${post.canonical_url || post.url}
---
`;
  return frontMatter;
};

export const convertPostToMarkdown = (post: Post): string => {
  if (!post) return "";
  const content = NodeHtmlMarkdown.translate(post.html || "");
  const frontMatter = frontMatterGenerator(post);
  return `${frontMatter}\n${content}`;
};

export const createMarkdownFile = (post: Post, outputFolder: string): void => {
  const content = convertPostToMarkdown(post);
  fs.writeFile(`${outputFolder}/${post.slug}.md`, content, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

export const syncCreateMarkdownFile = (post: Post, outputFolder: string) => {
  const content = convertPostToMarkdown(post);
  fs.writeFileSync(`${outputFolder}/${post.slug}.md`, content);
};
