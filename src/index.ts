import { NodeHtmlMarkdown } from "node-html-markdown";
import { Ghost } from "../src/ghost";
import { isCancel } from "@clack/core";
import { intro, outro, spinner, multiselect, text, cancel, note, select } from "@clack/prompts";
import * as fs from "fs";
import Configstore from "configstore";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

// Create a Configstore instance.
const config = new Configstore(packageJson.name, { ghostUrl: "", ghostApiKey: "" });

async function main() {
  const s = spinner();
  intro(`ghost-blog-buster`);
  let ghost: Ghost;
  let validSettings = false;
  let siteName = "";
  let lastUrlInput = config.get("ghostUrl");

  if (!config.get("ghostUrl") || !config.get("ghostApiKey")) {
    note(`Let's set your ghost URL and API key`, "Welcome");
  } else {
    try {
      ghost = new Ghost(config.get("ghostUrl"), config.get("ghostApiKey"));
      s.start("Connecting to your blog...");
      const settings = await ghost.fetchSettings();
      if (settings && settings.title) {
        siteName = settings.title;
        s.stop(`✅ Connected to "${siteName}"`);
        validSettings = true;
      } else {
        s.stop(`❌ Credentials not valid...`);
      }
    } catch (error: unknown) {
      note(`There was an error trying to connect to your credentials: \n${error}`, "Error");
    }
  }
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
    const ghostApiKey = await text({
      message: `Enter your Ghost Content API key or create a new Integration at ${url.protocol}//${url.hostname}/ghost/#/settings/integrations`,
      placeholder: "eb3144f144F41d43c737350dc3",
      validate(value) {
        if (value.length !== 26) return `The API Key must have 26 characters!`;
        return undefined;
      },
    });
    if (isCancel(ghostApiKey)) {
      cancel("Congfiguration step aborted. Exiting...");
      process.exit(0);
    }
    try {
      ghost = new Ghost(`${url.protocol}//${url.hostname}`, ghostApiKey);
      lastUrlInput = `${url.protocol}//${url.hostname}`;
      s.start("Validating credentials");
      const settings = await ghost.fetchSettings();
      if (settings && settings.title) {
        config.set("ghostUrl", `${url.protocol}//${url.hostname}`);
        config.set("ghostApiKey", ghostApiKey);
        siteName = settings.title;
        s.stop(`✅ Connected to ${siteName}`);
        validSettings = true;
      } else {
        s.stop(`❌ Credentials not valid... Please try again`);
      }
    } catch (error: unknown) {
      note(`There was an error trying to connect to your credentials: \n${error}`, "Error");
    }
  }
  let quit = false;
  ghost = new Ghost(config.get("ghostUrl"), config.get("ghostApiKey"));
  while (!quit) {
    const action = await select({
      message: "🤔 What would you like to do. Select an option and press Enter (or CTRL-C to quit)",
      options: [
        {
          value: "export-md",
          label: "Export some articles to Markdown",
          hint: "Will fetch a list of articles to select from.",
        },
        { value: "export-all-md", label: "Export all articles" },
        { value: "display-tags", label: "Display tags" },
        { value: "quit", label: "Quit" },
      ],
    });
    if (isCancel(action)) {
      cancel("Operation cancelled. Goodbye!");
      process.exit(0);
    }
    switch (action) {
      case "export-md":
        await exportMd();
        break;
      case "export-all-md":
        await exportAllMd();
        break;
      case "display-tags":
        await displayTags();
        break;
      case "quit":
        quit = true;
        break;
      default:
        break;
    }
  }
  async function exportAllMd() {
    s.start("Fetching your blog posts");
    const posts = await ghost.fetchAllBlogPosts();
    s.stop(`📚 Fetched ${posts?.length} posts...`);
    if (!posts || posts.length === 0) {
      note(`No post were found on "${siteName}.".`, "No posts found");
      return;
    }
    const outputFolder = await text({
      message: "Select the destination folder.",
      placeholder: "./output",
      initialValue: "./output",
      defaultValue: ".",
    });
    let output = outputFolder.toString();
    if (output.endsWith("/")) {
      output = output.slice(0, -1);
    }

    if (isCancel(outputFolder)) {
      cancel("Operation aborted, back to action selection.");
      return;
    }

    try {
      await fs.promises.access(output);
    } catch (error) {
      s.start(`Directory ${output} does not exist, creating...`);
      await fs.promises.mkdir(output);
      s.stop(`📂 Directory ${output} created`);
    }

    posts.forEach((p) => {
      fs.writeFile(
        `${outputFolder.toString() || "."}/${p.slug}.md`,
        NodeHtmlMarkdown.translate(p.html || ""),
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
    });
    note(`${posts.length} posts converted to Markdown and saved to ${outputFolder.toString() || "."}`, "Success");
  }
  async function displayTags() {
    note(`Sorry this functionnality is not implemented yet`, "Not implemented yet");
  }
  async function exportMd() {
    s.start("Fetching your blog posts");
    const posts = await ghost.fetchAllBlogPosts();
    s.stop(`📚 Fetched ${posts?.length} posts...`);
    if (!posts || posts.length === 0) {
      note(`No post were found on "${siteName}.".`, "No posts found");
      return;
    }

    const blogPostsSelection = await multiselect({
      message: "Select wich one to convert.",
      options: posts.map((p) => {
        return {
          value: p.slug,
          label: p.title,
          hint: p.published_at || "",
        };
      }),
      required: false,
    });

    if (isCancel(blogPostsSelection)) {
      cancel("No post selected, back to action selection.");
      return;
    }

    if (typeof blogPostsSelection === "object" && blogPostsSelection.length === 0) {
      note(`No post selected, back to action selection`, "No posts selected");
      return;
    }

    const outputFolder = await text({
      message: "Select the destination folder.",
      placeholder: "./output",
      initialValue: "./output",
      defaultValue: ".",
    });
    let output = outputFolder.toString();
    if (output.endsWith("/")) {
      output = output.slice(0, -1);
    }

    if (isCancel(outputFolder)) {
      cancel("Operation aborted, back to action selection.");
      return;
    }

    try {
      await fs.promises.access(output);
    } catch (error) {
      s.start(`Directory ${output} does not exist, creating...`);
      await fs.promises.mkdir(output);
      s.stop(`📂 Directory ${output} created`);
    }

    const postsToConvert = posts.filter((p) => (blogPostsSelection as string[]).includes(p.slug));
    postsToConvert.forEach((p) => {
      fs.writeFile(
        `${outputFolder.toString() || "."}/${p.slug}.md`,
        NodeHtmlMarkdown.translate(p.html || ""),
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
    });
    note(
      `${postsToConvert.length} posts converted to Markdown and saved to ${outputFolder.toString() || "."}`,
      "Success"
    );
  }

  outro(`Goodbye!`);
}

main().catch(console.error);
