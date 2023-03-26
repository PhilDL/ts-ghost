import type { ArgumentsCamelCase, CommandBuilder } from "yargs";
import { requireGhostAdminAPI } from "../utils/require-ghost-api";
import * as fs from "fs";
import path from "path";
import { syncCreateMarkdownFile, convertPostToMarkdown } from "../utils/markdown-converter";
import { log } from "@clack/prompts";
import { fetchAllMembers } from "../utils/admin-api";

export const command = "export-admin <resource>";

export const desc = "Use the Ghost Admin API to export data on resource <resource>.";

export const builder: CommandBuilder = (yargs) => {
  return yargs
    .positional("resource", {
      describe: "The name of the resource Admin API (e.g. posts, pages, members)",
      type: "string",
    })
    .choices("resource", ["posts", "pages", "members"])
    .option("host", {
      alias: "h",
      type: "string",
      description: "The host of the Ghost blog",
    })
    .option("key", {
      alias: ["k", "u"],
      type: "string",
      description: "The Ghost Admin API Key",
    })
    .option("output", {
      alias: ["o"],
      type: "string",
      description: "Output content to folder <output>",
    });
};

export const handler = async function (argv: ArgumentsCamelCase<{ host?: string; key?: string; output?: string }>) {
  let output = argv.output || null;
  if (output) {
    output = path.join(process.cwd(), output.toString());
    if (output.endsWith("/")) {
      output = output.slice(0, -1);
    }
    try {
      await fs.promises.access(output);
    } catch (error) {
      await fs.promises.mkdir(output);
    }
  }
  const api = await requireGhostAdminAPI(argv);
  switch (argv.resource) {
    case "posts": {
      let currentPage = 1;
      let pages = 1;
      let postsCount = 0;

      while (currentPage <= pages) {
        const res = await api.posts
          .browse({
            page: currentPage,
            filter: "html:-null",
          })
          .formats({ html: true })
          .fetch();
        if (res.status === "error") {
          log.error(
            `There was an error trying to connect to your Ghost Instance: \n${res.errors
              .map((m) => m.message)
              .join("\n")}`
          );
          process.exit(0);
        }
        const posts = res.data;
        pages = res.meta.pagination.pages || 1;
        postsCount += posts.length || 0;
        if (output !== null) {
          posts.forEach(async (p) => syncCreateMarkdownFile(p, output || "."));
          process.stdout.write(`Exported ${postsCount} posts to ${output.toString() || "."}`);
        } else {
          posts.forEach(async (p) => process.stdout.write(convertPostToMarkdown(p)));
        }
        currentPage += 1;
      }
      break;
    }
    case "pages": {
      let currentPage = 1;
      let pages = 1;
      let postsCount = 0;

      while (currentPage <= pages) {
        const res = await api.pages
          .browse({
            page: currentPage,
            filter: "html:-null",
          })
          .formats({ html: true })
          .fetch();
        if (res.status === "error") {
          log.error(
            `There was an error trying to connect to your Ghost Instance: \n${res.errors
              .map((m) => m.message)
              .join("\n")}`
          );
          process.exit(0);
        }
        const posts = res.data;
        pages = res.meta.pagination.pages || 1;
        postsCount += posts.length || 0;
        if (output !== null) {
          posts.forEach(async (p) => syncCreateMarkdownFile(p, output || "."));
          process.stdout.write(`Exported ${postsCount} pages to ${output.toString() || "."}`);
        } else {
          posts.forEach(async (p) => process.stdout.write(convertPostToMarkdown(p)));
        }
        currentPage += 1;
      }
      break;
    }
    case "members": {
      const members = await fetchAllMembers(api);
      const content = JSON.stringify(members, null, 2);
      if (output !== null) {
        fs.writeFile(path.join(output, "members.json"), content, "utf8", (err) => {
          if (err) {
            log.error(err.toString());
          }
        });
      } else {
        process.stdout.write(content);
      }
      break;
    }
    default:
      {
        process.stdout.write("Not yet implemented");
        break;
      }
      break;
  }
  process.exit(0);
};
