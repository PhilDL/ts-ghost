import type { Ghost } from "../app/ghost";
import { isCancel } from "@clack/core";
import { multiselect, text, cancel, note, spinner } from "@clack/prompts";
import { createMarkdownFile } from "../app/markdown-converter";
import * as fs from "fs";
import path from "path";

export async function postsExportSelection(ghost: Ghost, siteName: string) {
  const s = spinner();
  s.start("Fetching your blog posts");
  const posts = await ghost.fetchAllBlogPosts();
  s.stop(`📚 Fetched ${posts?.length} posts...`);
  if (!posts || posts.length === 0) {
    note(`No post were found on "${siteName}.".`, "No posts found");
    return;
  }

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
