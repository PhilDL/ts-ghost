import { describe, test, expect, beforeEach } from "vitest";
import { TSGhostContentAPI } from "../content-api";

const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
const key = process.env.VITE_GHOST_CONTENT_API_KEY || "93fa6b1e07090ecdf686521b7e";

describe("settings integration tests browse", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI(url, key, "v5.0");
  });
  test("settings.fetch()", async () => {
    const result = await api.settings.fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (result.status === "error") {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toBeDefined();
      const settings = result.data;
      expect(settings).toBeDefined();
      expect(settings.title).toBe("Astro Starter");
      expect(settings.description).toBe("Thoughts, stories and ideas.");
      expect(settings.logo).toBeNull();
      expect(settings.cover_image).toBe("https://static.ghost.org/v4.0.0/images/publication-cover.jpg");
      expect(settings.icon).toBeNull();
      expect(settings.lang).toBe("en");
      expect(settings.timezone).toBe("Etc/UTC");
      expect(settings.codeinjection_head).toBeNull();
      expect(settings.codeinjection_foot).toBeNull();
      expect(settings.members_support_address).toBe("noreply");
    }
  });
});
