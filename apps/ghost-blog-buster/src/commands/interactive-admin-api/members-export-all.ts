import * as fs from "fs";
import path from "path";
import { isCancel } from "@clack/core";
import { cancel, log, note, select, spinner, text } from "@clack/prompts";
import type { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { fetchAllMembers } from "./helpers";

export const membersExportAll = async (ghost: TSGhostAdminAPI, _siteName: string) => {
  const s = spinner();
  const outputType = await select({
    message: "Select the output type.",
    initialValue: "json",
    options: [
      { label: "JSON", value: "json" },
      { label: "stdout", value: "stdout", hint: "Prints the output to the console." },
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
  s.start(`Fetching Members...`);
  const members = await fetchAllMembers(ghost);
  s.stop(`🏷️ Found ${members.length} Members...`);
  const content = JSON.stringify(members, null, 2);
  if (outputType === "stdout") {
    process.stdout.write(`${content} \n`);
  } else {
    fs.writeFile(path.join(output, "members.json"), content, "utf8", (err) => {
      if (err) {
        log.error(err.toString());
      }
    });
    note(`${members.length} members converted to Json file and saved to ${output}/members.json`, "Success");
  }
  return;
};
