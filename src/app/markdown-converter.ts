import { NodeHtmlMarkdown } from "node-html-markdown";
import type { PostOrPage, Tag, TagVisibility } from "@tryghost/content-api";
import * as fs from "fs";

type ITag = Omit<Tag, "visibility"> & {
  visibility?: string | TagVisibility;
};
type Post = Omit<PostOrPage, "tags" | "primary_tag" | "custom_excerpt"> & {
  tags?: ITag[];
  primary_tag?: ITag | null;
  custom_excerpt?: null | string;
};

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
