import { TSGhostAdminAPI } from "@ts-ghost/admin-api";
import { isCancel } from "@clack/core";
import { cancel, note, select, confirm, outro } from "@clack/prompts";
import { postsExportSelection, postsExportAll, checkCredentials, promptCredentialsLoop } from "./";
import { membersExportAll } from "./members-export-all";

import { getConfig } from "../../config";

export const entrypoint = async function () {
  const config = getConfig();

  const validSettings = await checkCredentials(config);
  if (!validSettings) {
    await promptCredentialsLoop(config);
  }

  const ghost = new TSGhostAdminAPI(config.get("ghostUrl"), config.get("ghostAdminApiKey"), "v5.0");
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
        { value: "export-members", label: "Members" },
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
      case "export-members":
        await membersExportAll(ghost, siteName);
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
          config.set("ghostAdminApiKey", "");
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
        outro("👋 Goodbye, Thank you for using Ghost Blog Buster.");
        process.exit(0);
        break;
      default:
        break;
    }
  }
};
