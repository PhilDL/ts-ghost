import * as fs from "fs";
import path from "path";
import { log } from "@clack/prompts";
import type { ArgumentsCamelCase, CommandBuilder } from "yargs";

import { convertPostToMarkdown, syncCreateMarkdownFile } from "../utils/markdown-converter";
import { requireGhostContentAPI } from "../utils/require-ghost-api";

export const command = "export <resource>";

export const desc = "Use the Ghost Content API to export data on resource <resource>.";

export const builder: CommandBuilder = (yargs) => {
  return yargs
    .positional("resource", {
      describe: "The name of the resource (e.g. posts, tags, tiers, authors)",
      type: "string",
    })
    .choices("resource", ["posts", "pages", "authors", "tags", "tiers"])
    .option("host", {
      alias: "h",
      type: "string",
      description: "The host of the Ghost blog",
    })
    .option("key", {
      alias: ["k", "u"],
      type: "string",
      description: "The API Key of the Ghost Content API",
    })
    .option("output", {
      alias: ["o"],
      type: "string",
      description: "Output content to folder <output>",
    });
};

export const handler = async function (
  argv: ArgumentsCamelCase<{ host?: string; key?: string; output?: string }>
) {
  const api = await requireGhostContentAPI(argv);
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
  switch (argv.resource) {
    case "posts": {
      let currentPage = 1;
      let pages = 1;
      let postsCount = 0;

      while (currentPage <= pages) {
        const res = await api.posts
          .browse({
            page: currentPage,
          })
          .include({
            authors: true,
            tags: true,
          })
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
          })
          .include({
            authors: true,
            tags: true,
          })
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
    case "authors": {
      const res = await api.authors
        .browse()
        .include({
          "count.posts": true,
        })
        .fetch();
      if (res.status === "error") {
        log.error(
          `There was an error trying to connect to your Ghost Instance: \n${res.errors
            .map((m) => m.message)
            .join("\n")}`
        );
        process.exit(0);
      }
      const content = JSON.stringify(res.data, null, 2);
      if (output !== null) {
        fs.writeFile(path.join(output, "authors.json"), content, "utf8", (err) => {
          if (err) {
            log.error(err.toString());
          }
        });
      } else {
        process.stdout.write(content);
      }
      break;
    }
    case "tags": {
      const res = await api.tags
        .browse()
        .include({
          "count.posts": true,
        })
        .fetch();
      if (res.status === "error") {
        log.error(
          `There was an error trying to connect to your Ghost Instance: \n${res.errors
            .map((m) => m.message)
            .join("\n")}`
        );
        process.exit(0);
      }
      const content = JSON.stringify(res.data, null, 2);
      if (output !== null) {
        fs.writeFile(path.join(output, "tags.json"), content, "utf8", (err) => {
          if (err) {
            log.error(err.toString());
          }
        });
      } else {
        process.stdout.write(content);
      }
      break;
    }
    case "tiers": {
      const res = await api.tiers
        .browse()
        .include({
          benefits: true,
          monthly_price: true,
          yearly_price: true,
        })
        .fetch();
      if (res.status === "error") {
        log.error(
          `There was an error trying to connect to your Ghost Instance: \n${res.errors
            .map((m) => m.message)
            .join("\n")}`
        );
        process.exit(0);
      }
      const content = JSON.stringify(res.data, null, 2);
      if (output !== null) {
        fs.writeFile(path.join(output, "tiers.json"), content, "utf8", (err) => {
          if (err) {
            log.error(err.toString());
          }
        });
      } else {
        process.stdout.write(content);
      }
      break;
    }
    default: {
      process.stdout.write("Not yet implemented");
      break;
    }
  }
  process.exit(0);
};
