import { TSGhostAdminAPI } from "@ts-ghost/admin-api";
import { TSGhostContentAPI } from "@ts-ghost/content-api";

export const ghostAdminAPI = new TSGhostAdminAPI(
  process.env.GHOST_URL || "",
  process.env.GHOST_ADMIN_API_KEY || "",
  "v5.0"
);

export const ghostContentAPI = new TSGhostContentAPI(
  process.env.GHOST_URL || "",
  process.env.GHOST_CONTENT_API_KEY || "",
  "v5.0"
);
