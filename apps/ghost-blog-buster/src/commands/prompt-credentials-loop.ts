import { Ghost } from "../app/ghost";
import { isCancel } from "@clack/core";
import { spinner, text, cancel, note } from "@clack/prompts";
import Configstore from "configstore";
import color from "picocolors";

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
      cancel("Congfiguration step aborted. Exiting...");
      process.exit(0);
    }
    const url = new URL(ghostUrl);
    lastUrlInput = `${url.protocol}//${url.hostname}`;
    const ghostContentApiKey = await text({
      message: `Enter your Ghost Content API key or create a new Integration at ${url.protocol}//${url.hostname}/ghost/#/settings/integrations`,
      placeholder: "eb3144f144F41d43c737350dc3",
      validate(value) {
        if (value.length !== 26) return `The API Key must have 26 characters!`;
        return undefined;
      },
    });
    if (isCancel(ghostContentApiKey)) {
      cancel("Congfiguration step aborted. Exiting...");
      process.exit(0);
    }
    try {
      const ghost = new Ghost(`${url.protocol}//${url.hostname}`, ghostContentApiKey);
      s.start("Validating credentials");
      const settings = await ghost.fetchSettings();
      if (settings && settings.title) {
        config.set("ghostUrl", `${url.protocol}//${url.hostname}`);
        config.set("ghostContentApiKey", ghostContentApiKey);
        config.set("siteName", settings.title);
        s.stop(`✅ Connected to ${settings.title}`);
        validSettings = true;
      } else {
        s.stop(`❌ Credentials not valid... Please try again`);
      }
    } catch (error: unknown) {
      note(
        `${color.red("There was an error trying to connect to your credentials:")} \n${error}`,
        `${color.red("Error")}`
      );
    }
  }
};
