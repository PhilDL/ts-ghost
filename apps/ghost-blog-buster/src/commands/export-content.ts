import type { ArgumentsCamelCase, CommandBuilder } from "yargs";
import { requireGhostAPI } from "../utils/require-ghost-api";
import * as fs from "fs";
import path from "path";
import { syncCreateMarkdownFile, convertPostToMarkdown } from "../utils/markdown-converter";
import { log } from "@clack/prompts";

export const command = "export <endpoint>";

export const desc = "Export all sources on endpoint <endpoint>.";

export const builder: CommandBuilder = (yargs) => {
  return yargs
    .positional("endpoint", {
      describe: "The name of the endpoint (e.g. posts, tags, tiers, authors)",
      type: "string",
    })
    .choices("endpoint", ["posts", "pages", "authors", "tags", "tiers"])
    .option("host", {
      alias: "h",
      type: "string",
      description: "The host of the Ghost blog",
    })
    .option("key", {
      alias: ["k", "u"],
      type: "string",
      description: "The API Key of the Ghost COntent API",
    })
    .option("output", {
      alias: ["o"],
      type: "string",
      description: "Output content to folder <output>",
    });
};

export const handler = async function (argv: ArgumentsCamelCase<{ host?: string; key?: string; output?: string }>) {
  const api = await requireGhostAPI(argv);
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
  switch (argv.endpoint) {
    case "posts": {
      let currentPage = 1;
      let pages = 1;
      let postsCount = 0;

      while (currentPage <= pages) {
        const res = await api.posts
          .browse({
            input: {
              page: currentPage,
            },
            output: {
              include: {
                authors: true,
                tags: true,
              },
            },
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
            input: {
              page: currentPage,
            },
            output: {
              include: {
                authors: true,
                tags: true,
              },
            },
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
        .browse({
          output: {
            include: {
              "count.posts": true,
            },
          },
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
        .browse({
          output: {
            include: {
              "count.posts": true,
            },
          },
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
        .browse({
          output: {
            include: {
              benefits: true,
              monthly_price: true,
              yearly_price: true,
            },
          },
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
