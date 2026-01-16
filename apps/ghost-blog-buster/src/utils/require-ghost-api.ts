import { log } from "@clack/prompts";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";
import { TSGhostContentAPI } from "@ts-ghost/content-api";

import { getConfig } from "../config";
import { nonEmptyString } from "./non-empty-string";

export async function requireGhostContentAPI(argv: { host?: string; key?: string }) {
  let api: TSGhostContentAPI | undefined;
  const config = getConfig();
  const ghostUrl = config.get("ghostUrl");
  const ghostContentApiKey = config.get("ghostContentApiKey");

  if (argv.host && argv.key) {
    api = new TSGhostContentAPI(argv.host, argv.key, "v6.0");
  } else if (nonEmptyString(ghostUrl) && nonEmptyString(ghostContentApiKey)) {
    api = new TSGhostContentAPI(ghostUrl, ghostContentApiKey, "v6.0");
  }
  if (!api) {
    console.error(
      "No API credentials provided. Please provide them via command line arguments or set them in the interractive cli.",
    );
    process.exit(1);
  }
  try {
    const res = await api.settings.fetch();
    if (!res.success) {
      log.error(
        `There was an error trying to connect with these credentials: \n${res.errors
          .map((m) => m.message)
          .join("\n")}`,
      );
      process.exit(1);
    }
  } catch (error: unknown) {
    console.error(`There was an error trying to connect with these credentials: \n${error}`, "Error");
  }
  return api;
}

export async function requireGhostAdminAPI(argv: { host?: string; key?: string }) {
  let api: TSGhostAdminAPI | undefined;
  const config = getConfig();
  const ghostUrl = config.get("ghostUrl");
  const ghostAdminApiKey = config.get("ghostAdminApiKey");

  if (argv.host && argv.key) {
    api = new TSGhostAdminAPI(argv.host, argv.key, "v6.0");
  } else if (nonEmptyString(ghostUrl) && nonEmptyString(ghostAdminApiKey)) {
    api = new TSGhostAdminAPI(ghostUrl, ghostAdminApiKey, "v6.0");
  }
  if (!api) {
    console.error(
      "No API credentials provided. Please provide them via command line arguments or set them in the interractive cli.",
    );
    process.exit(1);
  }
  try {
    const res = await api.site.fetch();
    if (!res.success) {
      log.error(
        `There was an error trying to connect with these credentials: \n${res.errors
          .map((m) => m.message)
          .join("\n")}`,
      );
      process.exit(1);
    }
  } catch (error: unknown) {
    console.error(`There was an error trying to connect with these credentials: \n${error}`, "Error");
  }
  return api;
}
