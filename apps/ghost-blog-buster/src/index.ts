export { convertPostToMarkdown, createMarkdownFile } from "./utils/markdown-converter";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

const ghost = new TSGhostAdminAPI("https://ghost.org/ghost/api/admin", "1234", "v5.0");

const posts = await ghost.posts
  .browse({
    input: {
      filter: "html:-null",
      limit: 5,
    },
  })
  .formats({ html: true })
  .fields({ slug: true, html: true })
  .fetch();
