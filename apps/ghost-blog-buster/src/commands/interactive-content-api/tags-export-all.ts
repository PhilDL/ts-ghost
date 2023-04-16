import * as fs from "fs";
import path from "path";
import { isCancel } from "@clack/core";
import { cancel, log, note, select, spinner, text } from "@clack/prompts";
import type { TSGhostContentAPI } from "@ts-ghost/content-api";

export const tagsExportAll = async (ghost: TSGhostContentAPI, siteName: string) => {
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

  s.start(`Fetching Tags...`);
  const res = await ghost.tags.browse().fetch();
  if (!res.success || res.data.length === 0) {
    note(`No tags were found on "${siteName}.".`, "No tags found");
    return;
  }
  const tags = res.data;
  s.stop(`🏷️ Found ${tags.length} Tags...`);
  const content = JSON.stringify(tags, null, 2);
  if (outputType === "stdout") {
    process.stdout.write(`${content} \n`);
  } else {
    fs.writeFile(path.join(output, "tags.json"), content, "utf8", (err) => {
      if (err) {
        log.error(err.toString());
      }
    });
    note(`${tags.length} tags converted to Json file and saved to ${output}/tags.json`, "Success");
  }
  return;
};
