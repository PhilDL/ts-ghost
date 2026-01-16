import { log, note, spinner } from "@clack/prompts";
import Configstore from "configstore";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { nonEmptyString } from "../../utils/non-empty-string";

export const checkCredentials = async (config: Configstore) => {
  let validSettings = false;
  const s = spinner();
  const ghostUrl = config.get("ghostUrl");
  const ghostAdminApiKey = config.get("ghostAdminApiKey");
  if (nonEmptyString(ghostUrl) && nonEmptyString(ghostAdminApiKey)) {
    try {
      const ghost = new TSGhostAdminAPI(ghostUrl, ghostAdminApiKey, "v6.0");
      s.start("Connecting to your blog...");
      const res = await ghost.site.fetch();
      if (!res.success) {
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
  } else {
    note(`Let's set your ghost URL and API key`, "Welcome");
  }
  return validSettings;
};
