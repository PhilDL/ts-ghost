import { isCancel } from "@clack/core";
import { cancel, note, spinner, text } from "@clack/prompts";
import Configstore from "configstore";
import color from "picocolors";
import { TSGhostContentAPI } from "@ts-ghost/content-api";

export const promptCredentialsLoop = async (config: Configstore) => {
  let validSettings = false;
  let lastUrlInput = config.get("ghostUrl");
  const s = spinner();

  while (!validSettings) {
    const ghostUrl = await text({
      message: "Enter your Ghost blog URL",
      placeholder: "https://myblog.com",
      initialValue: lastUrlInput,
      validate(value) {
        let validUrl: URL;
        try {
          validUrl = new URL(value);
        } catch (error: unknown) {
          return `This is not a valid URL. Please try again and include the protocol (http or https)!`;
        }
        if (!validUrl.protocol) return `The URL should contain the protocol (http or https)!`;
        return undefined;
      },
    });
    if (isCancel(ghostUrl)) {
      cancel("Configuration step aborted. Exiting...");
      process.exit(0);
    }
    const url = new URL(ghostUrl);
    lastUrlInput = url.origin;
    const ghostContentApiKey = await text({
      message: `Enter your Ghost Content API key or create a new Integration at ${url.protocol}//${url.hostname}/ghost/#/settings/integrations`,
      placeholder: "eb3144f144F41d43c737350dc3",
      validate(value) {
        if (value.length !== 26) return `The API Key must have 26 characters!`;
        return undefined;
      },
    });
    if (isCancel(ghostContentApiKey)) {
      cancel("Configuration step aborted. Exiting...");
      process.exit(0);
    }
    try {
      const ghost = new TSGhostContentAPI(url.origin, ghostContentApiKey, "v5.0");
      s.start("Validating credentials");
      const res = await ghost.settings.fetch();
      if (res.success) {
        const settings = res.data;
        config.set("ghostUrl", url.origin);
        config.set("ghostContentApiKey", ghostContentApiKey);
        config.set("siteName", settings.title);
        s.stop(`✅ Connected to ${settings.title}`);
        validSettings = true;
      } else {
        s.stop(`❌ Credentials not valid... Please try again`);
      }
    } catch (error: unknown) {
      note(
        `${color.red("There was an error trying to connect with these credentials:")} \n${error}`,
        `${color.red("Error")}`
      );
    }
  }
};
