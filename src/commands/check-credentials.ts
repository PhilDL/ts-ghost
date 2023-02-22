import { Ghost } from "../app/ghost";
import { spinner, note } from "@clack/prompts";

import Configstore from "configstore";

export const checkCredentials = async (config: Configstore) => {
  let validSettings = false;
  const s = spinner();
  if (!config.get("ghostUrl") || !config.get("ghostContentApiKey")) {
    note(`Let's set your ghost URL and API key`, "Welcome");
  } else {
    try {
      const ghost = new Ghost(config.get("ghostUrl"), config.get("ghostContentApiKey"));
      s.start("Connecting to your blog...");
      const settings = await ghost.fetchSettings();
      if (settings && settings.title) {
        config.set("siteName", settings.title);
        s.stop(`✅ Connected to "${settings.title}"`);
        validSettings = true;
      } else {
        s.stop(`❌ Credentials not valid...`);
      }
    } catch (error: unknown) {
      note(`There was an error trying to connect to your credentials: \n${error}`, "Error");
    }
  }
  return validSettings;
};
