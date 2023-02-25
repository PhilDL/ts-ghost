import type { Ghost } from "../app/ghost";
import { isCancel } from "@clack/core";
import { text, cancel, note, spinner, select } from "@clack/prompts";
import * as fs from "fs";
import path from "path";

export const tagsExportAll = async (ghost: Ghost, siteName: string) => {
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
  const tags = await ghost.fetchAllTags();
  if (!tags || tags.length === 0) {
    note(`No tags were found on "${siteName}.".`, "No tags found");
    return;
  }
  s.stop(`🏷️ Found ${tags.length} Tags...`);
  const content = JSON.stringify(tags, null, 2);
  if (outputType === "stdout") {
    // process.stdout.write(content);
    note(content, "Sucess");
  } else {
    fs.writeFile(path.join(output, "tags.json"), content, "utf8", (err) => {
      if (err) {
        console.log(err);
      }
    });
    note(`${tags.length} tags converted to Json file and saved to ${output}/tags.json`, "Success");
  }
  return;
};
