import type { PostsOrPages } from "@tryghost/content-api";
import type { Ghost } from "../app/ghost";
import { isCancel } from "@clack/core";
import { text, cancel, note, spinner } from "@clack/prompts";
import { createMarkdownFile } from "../app/markdown-converter";
import * as fs from "fs";
import path from "path";

export async function postsExportAll(ghost: Ghost, siteName: string) {
  const s = spinner();
  const outputFolder = await text({
    message: "Select the destination folder.",
    placeholder: "./output",
    initialValue: "./output",
    defaultValue: ".",
  });
  let output = path.join(process.cwd(), outputFolder.toString());
  if (output.endsWith("/")) {
    output = output.slice(0, -1);
  }

  if (isCancel(outputFolder)) {
    cancel("Operation aborted, back to action selection.");
    return;
  }

  try {
    await fs.promises.access(output);
  } catch (error) {
    s.start(`Directory ${output} does not exist, creating...`);
    await fs.promises.mkdir(output);
    s.stop(`📂 Directory ${output} created`);
  }

  let currentPage = 1;
  let pages = 1;
  let postsCount = 0;
  let posts: PostsOrPages | void;

  while (currentPage <= pages) {
    s.start(`Fetching Blog Posts, page ${currentPage} ${postsCount > 0 ? "of pages " + String(pages) : ""}...`);
    posts = await ghost.fetchBlogPosts(currentPage);
    if (!posts || posts.length === 0) {
      note(`No post were found on "${siteName}.".`, "No posts found");
      return;
    }
    pages = posts?.meta?.pagination?.pages || 1;
    postsCount += posts?.length || 0;
    posts.forEach((p) => createMarkdownFile(p, outputFolder.toString() || "."));
    s.stop(`📚 Converted ${postsCount} posts!`);
    currentPage += 1;
  }

  note(`${postsCount} posts converted to Markdown and saved to ${outputFolder.toString() || "."}`, "Success");
  return;
}
