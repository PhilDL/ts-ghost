import type { TSGhostContentAPI } from "@ts-ghost/content-api";
import { isCancel } from "@clack/core";
import { text, cancel, note, spinner, select, log } from "@clack/prompts";
import * as fs from "fs";
import path from "path";

export const tiersExportAll = async (ghost: TSGhostContentAPI, siteName: string) => {
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

  s.start(`Fetching Tiers...`);
  const res = await ghost.tiers.browse().fetch();
  if (res.status === "error" || res.data.length === 0) {
    note(`No tiers were found on "${siteName}.".`, "No tiers found");
    return;
  }
  const tiers = res.data;
  s.stop(`🏷️ Found ${tiers.length} Tiers...`);
  const content = JSON.stringify(tiers, null, 2);
  if (outputType === "stdout") {
    process.stdout.write(`${content} \n`);
  } else {
    fs.writeFile(path.join(output, "tiers.json"), content, "utf8", (err) => {
      if (err) {
        log.error(err.toString());
      }
    });
    note(`${tiers.length} tiers converted to Json file and saved to ${output}/tiers.json`, "Success");
  }
  return;
};
