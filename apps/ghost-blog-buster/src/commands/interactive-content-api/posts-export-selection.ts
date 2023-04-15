import * as fs from "fs";
import path from "path";
import { isCancel } from "@clack/core";
import { cancel, multiselect, note, spinner, text } from "@clack/prompts";
import type { TSGhostContentAPI } from "@ts-ghost/content-api";

import { createMarkdownFile } from "../../utils/markdown-converter";
import { fetchAllBlogPosts } from "./helpers";

export async function postsExportSelection(ghost: TSGhostContentAPI, siteName: string) {
  const s = spinner();
  s.start("Fetching your blog posts");
  const posts = await fetchAllBlogPosts(ghost);
  if (!posts || posts.length === 0) {
    s.stop(`No post were found on "${siteName}.".`);
    return;
  }
  s.stop(`📚 Fetched ${posts?.length} posts...`);

  const blogPostsSelection = await multiselect({
    message: "Select wich one to convert.",
    options: posts.map((p) => {
      return {
        value: p.slug,
        label: p.title,
        hint: p.published_at || "",
      };
    }),
    required: false,
  });

  if (isCancel(blogPostsSelection)) {
    cancel("No post selected, back to action selection.");
    return;
  }

  if (typeof blogPostsSelection === "object" && blogPostsSelection.length === 0) {
    note(`No post selected, back to action selection`, "No posts selected");
    return;
  }

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

  const postsToConvert = posts.filter((p) => (blogPostsSelection as string[]).includes(p.slug));
  postsToConvert.forEach((p) => createMarkdownFile(p, outputFolder.toString() || "."));
  note(
    `${postsToConvert.length} posts converted to Markdown and saved to ${outputFolder.toString() || "."}`,
    "Success"
  );
  return;
}
