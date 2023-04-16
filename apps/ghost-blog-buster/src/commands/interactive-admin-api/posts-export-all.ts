import * as fs from "fs";
import path from "path";
import { isCancel } from "@clack/core";
import { cancel, log, note, spinner, text } from "@clack/prompts";
import type { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { createMarkdownFile } from "../../utils/markdown-converter";

export async function postsExportAll(ghost: TSGhostAdminAPI, siteName: string) {
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

  while (currentPage <= pages) {
    s.start(
      `Fetching Blog Posts, page ${currentPage} ${postsCount > 0 ? "of pages " + String(pages) : ""}...`
    );

    const res = await ghost.posts
      .browse({
        filter: "html:-null",
        page: currentPage,
      })
      .formats({ html: true })
      .fetch();
    if (!res.success || res.data.length === 0) {
      log.warn(`No post were found on "${siteName}.".`);
      return;
    }
    const posts = res.data;
    pages = res.meta.pagination.pages || 1;
    postsCount += posts.length || 0;
    posts.forEach((p) => createMarkdownFile(p, outputFolder.toString() || "."));

    s.stop(`📚 Converted ${postsCount} posts!`);
    currentPage += 1;
  }

  note(
    `${postsCount} posts converted to Markdown and saved to ${outputFolder.toString() || "."}`,
    "Success"
  );
  return;
}
