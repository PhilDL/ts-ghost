import { TSGhostAdminAPI } from "@ts-ghost/admin-api";
import { TSGhostContentAPI } from "@ts-ghost/content-api";

export const ghostAdminAPI = new TSGhostAdminAPI(
  process.env.GHOST_URL || "",
  process.env.GHOST_ADMIN_API_KEY || "",
  "v6.0",
);

export const ghostContentAPI = new TSGhostContentAPI(
  process.env.GHOST_URL || "",
  process.env.GHOST_CONTENT_API_KEY || "",
  "v6.0",
);

async function getBlogPost(slug: string) {
  const response = await ghostAdminAPI.posts
    .read({ slug })
    .formats({ html: true })
    .fields({ title: true, html: true })
    .fetch();
  if (!response.success) {
    console.log(response.errors.join(", "));
    return null;
  }
  const post = response.data;
  return post;
}
