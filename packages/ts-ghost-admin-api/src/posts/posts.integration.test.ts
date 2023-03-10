import { describe, test, beforeEach } from "vitest";
import { TSGhostAdminAPI } from "../admin-api";

const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
const key = process.env.VITE_GHOST_ADMIN_API_KEY || "93fa6b1e07090ecdf686521b7e";

describe.only("posts integration tests browse", () => {
  let api: TSGhostAdminAPI;
  beforeEach(() => {
    api = new TSGhostAdminAPI(url, key, "v5.0");
  });
  test("posts.browse()", async () => {
    const result = await api.posts.browse({ input: { limit: 1 } }).fetch();
  });
});
