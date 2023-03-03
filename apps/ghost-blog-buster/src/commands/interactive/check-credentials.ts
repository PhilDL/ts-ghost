import { TSGhostContentAPI } from "@ts-ghost/content-api";
import { spinner, note, log } from "@clack/prompts";

import Configstore from "configstore";

export const checkCredentials = async (config: Configstore) => {
  let validSettings = false;
  const s = spinner();
  if (!config.get("ghostUrl") || !config.get("ghostContentApiKey")) {
    note(`Let's set your ghost URL and API key`, "Welcome");
  } else {
    try {
      const ghost = new TSGhostContentAPI(config.get("ghostUrl"), config.get("ghostContentApiKey"), "v5.0");
      s.start("Connecting to your blog...");
      const res = await ghost.settings.fetch();
      if (res.status === "error") {
        s.stop(`❌ Credentials not valid...`);
        log.error(`There was an error trying to connect to your credentials: \n${res.errors.join("\n")}`);
      } else {
        config.set("siteName", res.data.title);
        s.stop(`✅ Connected to "${res.data.title}"`);
        validSettings = true;
      }
    } catch (error: unknown) {
      note(`There was an error trying to connect to your credentials: \n${error}`, "Error");
    }
  }
  return validSettings;
};
