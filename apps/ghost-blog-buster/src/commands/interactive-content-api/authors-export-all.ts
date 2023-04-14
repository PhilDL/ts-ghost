import * as fs from "fs";
import path from "path";
import { isCancel } from "@clack/core";
import { cancel, log, note, select, spinner, text } from "@clack/prompts";
import type { TSGhostContentAPI } from "@ts-ghost/content-api";

export const authorsExportAll = async (ghost: TSGhostContentAPI, siteName: string) => {
  const s = spinner();
  const outputType = await select({
    message: "Select the output type.",
    initialValue: "json",
    options: [
      { name: "JSON", value: "json" },
      { name: "stdout", value: "stdout", hint: "Prints the output to the console." },
    ],
  });
  if (isCancel(outputType)) {
    cancel("Operation aborted, back to action selection.");
    return;
  }
  let output = "";

  if (outputType === "json") {
    const outputFolder = await text({
      message: "Select the destination folder.",
      placeholder: "./output",
      initialValue: "./output",
      defaultValue: ".",
    });
    output = path.join(process.cwd(), outputFolder.toString());
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
  }

  s.start(`Fetching Authors...`);
  const authors = await ghost.authors
    .browse()
    .include({
      "count.posts": true,
    })
    .fetch();
  if (authors.status === "error") {
    log.error(`Error while fetching authors from "${siteName}."`);
    return;
  }
  if (!authors || authors.data.length === 0) {
    log.warn(`No authors were found on "${siteName}.".`);
    return;
  }
  s.stop(`🏷️ Found ${authors.data.length} Authors...`);
  const content = JSON.stringify(authors.data, null, 2);
  if (outputType === "stdout") {
    process.stdout.write(`${content} \n`);
  } else {
    fs.writeFile(path.join(output, "authors.json"), content, "utf8", (err) => {
      if (err) {
        log.error(err.toString());
      }
    });
    note(
      `${authors.data.length} authors converted to Json file and saved to ${output}/authors.json`,
      "Success"
    );
  }
  return;
};
