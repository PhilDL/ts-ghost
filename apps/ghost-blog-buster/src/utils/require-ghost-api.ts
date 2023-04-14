import { TSGhostContentAPI } from "@ts-ghost/content-api";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";
import { log } from "@clack/prompts";
import { getConfig } from "../config";

export async function requireGhostContentAPI(argv: { host?: string; key?: string }) {
  let api: TSGhostContentAPI | undefined;
  const config = getConfig();

  if (argv.host && argv.key) {
    api = new TSGhostContentAPI(argv.host, argv.key, "v5.0");
  } else if (config.get("ghostUrl") && config.get("ghostContentApiKey")) {
    api = new TSGhostContentAPI(config.get("ghostUrl"), config.get("ghostContentApiKey"), "v5.0");
  }
  if (!api) {
    console.error(
      "No API credentials provided. Please provide them via command line arguments or set them in the interractive cli."
    );
    process.exit(1);
  }
  try {
    const res = await api.settings.fetch();
    if (res.status === "error") {
      log.error(
        `There was an error trying to connect with these credentials: \n${res.errors.map((m) => m.message).join("\n")}`
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

  if (argv.host && argv.key) {
    api = new TSGhostAdminAPI(argv.host, argv.key, "v5.0");
  } else if (config.get("ghostUrl") && config.get("ghostAdminApiKey")) {
    api = new TSGhostAdminAPI(config.get("ghostUrl"), config.get("ghostAdminApiKey"), "v5.0");
  }
  if (!api) {
    console.error(
      "No API credentials provided. Please provide them via command line arguments or set them in the interractive cli."
    );
    process.exit(1);
  }
  try {
    const res = await api.site.fetch();
    if (res.status === "error") {
      log.error(
        `There was an error trying to connect with these credentials: \n${res.errors.map((m) => m.message).join("\n")}`
      );
      process.exit(1);
    }
  } catch (error: unknown) {
    console.error(`There was an error trying to connect with these credentials: \n${error}`, "Error");
  }
  return api;
}
