#!/usr/bin/env node
import { isCancel } from "@clack/core";
import { intro, outro, select } from "@clack/prompts";
import color from "picocolors";
import type { Arguments } from "yargs";

import { entrypoint as interactiveAdminApiEntrypoint } from "./interactive-admin-api";
import { entrypoint as interactiveContentApiEntrypoint } from "./interactive-content-api";

export const command = "$0";
export const desc = "Interactive CLI";
export const builder = {};
export const handler = async function (_argv: Arguments) {
  intro(`${color.bgBlack(color.yellow(" 👻 ghost-blog-buster 👻 "))}`);

  const endpoint = await select({
    message:
      "📦 Please choose the API you want to interact with. Select an option and press Enter (or CTRL-C to quit)",
    options: [
      {
        value: "content-api",
        label: "Content API",
      },
      { value: "admin-api", label: "Admin API" },
    ],
  });
  if (isCancel(endpoint)) {
    outro("👋 Goodbye, Thank you for using Ghost Blog Buster.");
    process.exit(0);
  }
  switch (endpoint) {
    case "admin-api": {
      await interactiveAdminApiEntrypoint();
      break;
    }
    case "content-api": {
      await interactiveContentApiEntrypoint();
      break;
    }
  }

  outro("👋 Goodbye, Thank you for using Ghost Blog Buster.");
};
