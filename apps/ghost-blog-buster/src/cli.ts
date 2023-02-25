#!/usr/bin/env node

import { Ghost } from "./app/ghost";
import { isCancel } from "@clack/core";
import { intro, outro, cancel, note, select, confirm } from "@clack/prompts";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Configstore from "configstore";
import {
  postsExportSelection,
  postsExportAll,
  checkCredentials,
  promptCredentialsLoop,
  tagsExportAll,
  tiersExportAll,
  authorsExportAll,
} from "./commands";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
import color from "picocolors";

async function main() {
  const config = new Configstore(packageJson.name, { ghostUrl: "", ghostContentApiKey: "" });
  intro(`${color.bgYellow(color.black(" ghost-blog-buster "))}`);

  const validSettings = await checkCredentials(config);
  if (!validSettings) {
    await promptCredentialsLoop(config);
  }

  const ghost = new Ghost(config.get("ghostUrl"), config.get("ghostContentApiKey"));
  const siteName = config.get("siteName");

  const quit = false;
  while (!quit) {
    const action = await select({
      message: "🤔 What would you like to export. Select an option and press Enter (or CTRL-C to quit)",
      options: [
        {
          value: "export-posts",
          label: "Posts",
        },
        { value: "export-tags", label: "Tags" },
        { value: "export-tiers", label: "Tiers" },
        { value: "export-authors", label: "Authors" },
        { value: "disconnect", label: "Disconnect from that blog", hint: "This will close the current session." },
        { value: "quit", label: "Quit" },
      ],
    });
    if (isCancel(action)) {
      cancel("Operation cancelled. Goodbye!");
      process.exit(0);
    }
    switch (action) {
      case "export-posts": {
        const postsActions = await select({
          message: "📚 Which posts do you want to export? (or CTRL-C to go back)",
          options: [
            { value: "export-all", label: "All Posts" },
            {
              value: "export-selection",
              label: "Select which ones to export",
            },
          ],
        });
        if (isCancel(postsActions)) {
          cancel("Operation cancelled.");
          break;
        }
        switch (postsActions) {
          case "export-all":
            await postsExportAll(ghost, siteName);
            break;
          case "export-selection":
            await postsExportSelection(ghost, siteName);
            break;
          default:
            break;
        }
        break;
      }
      case "export-tags":
        await tagsExportAll(ghost, siteName);
        break;
      case "export-tiers":
        await tiersExportAll(ghost, siteName);
        break;
      case "export-authors":
        await authorsExportAll(ghost, siteName);
        break;
      case "disconnect": {
        const shouldDisconnect = await confirm({
          message: `Do you want to disconnect from "${siteName}"?`,
        });
        if (isCancel(shouldDisconnect)) {
          cancel("Operation cancelled.");
          break;
        }
        if (shouldDisconnect) {
          config.set("ghostUrl", "");
          config.set("ghostContentApiKey", "");
          config.set("siteName", "");
          note(
            `You have been disconnected from ${siteName}. You can reconnect to another blog by running the command again.`,
            "Disconnected"
          );
          process.exit(0);
        }
        break;
      }
      case "quit":
        note(`Thank you for using Ghost Blog Buster`, "Goodbye");
        process.exit(0);
        break;
      default:
        break;
    }
  }

  outro(`Goodbye!`);
}

main().catch(console.error);
