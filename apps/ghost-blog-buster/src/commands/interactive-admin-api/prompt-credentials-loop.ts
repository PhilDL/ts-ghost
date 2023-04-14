import { isCancel } from "@clack/core";
import { cancel, note, spinner, text } from "@clack/prompts";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";
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
      cancel("Configuration step aborted. Exiting...");
      process.exit(0);
    }
    const url = new URL(ghostUrl);
    lastUrlInput = `${url.protocol}//${url.hostname}`;
    const ghostAdminApiKey = await text({
      message: `Enter a Ghost Admin API key. Here you can use a Staff Access token (RECOMMENDED: found on a User) or create a new Integration at ${url.protocol}//${url.hostname}/ghost/#/settings/integrations and copy the Admin API Key`,
      placeholder:
        "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
      validate(value) {
        if (!/[0-9a-f]{24}:[0-9a-f]{64}/.test(value))
          return `The Admin API Key must have the following format {A}:{B}, where A is 24 hex characters and B is 64 hex characters!`;
        return undefined;
      },
    });
    if (isCancel(ghostAdminApiKey)) {
      cancel("Configuration step aborted. Exiting...");
      process.exit(0);
    }
    try {
      const ghost = new TSGhostAdminAPI(`${url.protocol}//${url.hostname}`, ghostAdminApiKey, "v5.0");
      s.start("Validating credentials");
      const res = await ghost.site.fetch();
      if (res.status === "success") {
        const settings = res.data;
        config.set("ghostUrl", `${url.protocol}//${url.hostname}`);
        config.set("ghostAdminApiKey", ghostAdminApiKey);
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
