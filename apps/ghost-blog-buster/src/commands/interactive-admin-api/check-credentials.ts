import { log, note, spinner } from "@clack/prompts";
import Configstore from "configstore";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

export const checkCredentials = async (config: Configstore) => {
  let validSettings = false;
  const s = spinner();
  if (!config.get("ghostUrl") || !config.get("ghostAdminApiKey")) {
    note(`Let's set your ghost URL and API key`, "Welcome");
  } else {
    try {
      const ghost = new TSGhostAdminAPI(config.get("ghostUrl"), config.get("ghostAdminApiKey"), "v5.0");
      s.start("Connecting to your blog...");
      const res = await ghost.site.fetch();
      if (res.status === "error") {
        s.stop(`❌ Credentials not valid...`);
        log.error(`There was an error trying to connect with these credentials: \n${res.errors.join("\n")}`);
      } else {
        config.set("siteName", res.data.title);
        s.stop(`✅ Connected to "${res.data.title}"`);
        validSettings = true;
      }
    } catch (error: unknown) {
      note(`There was an error trying to connect with these credentials: \n${error}`, "Error");
    }
  }
  return validSettings;
};
