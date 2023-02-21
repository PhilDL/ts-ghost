import type { PostOrPage, Tag, TagVisibility, GhostAPI } from "@tryghost/content-api";

type ITag = Omit<Tag, "visibility"> & {
  visibility: string | TagVisibility;
};
type Post = Omit<PostOrPage, "tags" | "primary_tag" | "custom_excerpt"> & {
  tags: ITag[];
  primary_tag?: ITag;
  custom_excerpt?: null | string;
};

export const frontMatterGenerator = async (post: Post) => {
  const frontMatter = `---
title: ${post?.title}
date: ${post?.published_at}
tags: ${post?.tags?.map((t) => t.name).join(", ")}
---
`;
  return frontMatter;
};
