import { assert, beforeEach, describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";

describe("webhook integration tests", () => {
  let api: TSGhostAdminAPI;
  let integration_id = "";
  beforeEach(() => {
    const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
    const APIKey =
      process.env.VITE_GHOST_ADMIN_API_KEY ||
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
    integration_id = APIKey.split(":")[0] || "";
    api = new TSGhostAdminAPI(url, APIKey, "v5.0");
  });
  test("add, edit, delete", async () => {
    const add = await api.webhooks.add({
      event: "post.added",
      target_url: "https://example.com/hook/ts-ghost-integration",
      integration_id,
    });
    assert(add.status === "success");
    const webhook = add.data;
    expect(webhook.event).toBe("post.added");
    expect(webhook.target_url).toBe("https://example.com/hook/ts-ghost-integration");
    expect(webhook.integration_id).toBe(integration_id);
    expect(webhook.id).toBeDefined();
    const edit = await api.webhooks.edit(webhook.id, {
      name: "Updated webhook name",
    });
    assert(edit.status === "success");
    const updatedWebhook = edit.data;
    expect(updatedWebhook.name).toBe("Updated webhook name");

    const del = await api.webhooks.delete(webhook.id);
    assert(del.status === "success");
  });
});
