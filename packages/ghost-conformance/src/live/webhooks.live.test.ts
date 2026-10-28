import { randomBytes } from "node:crypto";
import { describe, expect, test } from "vitest";

import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { conformanceIntegration, WEBHOOK_TARGET } from "../seeds/webhooks.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

// Keys Ghost sends that the client deliberately doesn't model.
const IGNORED: string[] = [];

// Events no other test file fires: a concurrent delivery writes the old webhook back over an edit.
const newWebhook = () => ({
  event: "page.rescheduled" as const,
  target_url: `${WEBHOOK_TARGET}/${uniqueSuffix()}`,
  name: `Webhook ${uniqueSuffix()}`,
  secret: `secret-${randomBytes(8).toString("hex")}`,
});

async function readBack(id: string) {
  return (await conformanceIntegration()).webhooks.find((w) => w.id === id);
}

describe("webhooks", () => {
  const responses = liveResponses({ ignore: IGNORED });

  test("POST /webhooks/ ties the webhook to the calling integration and stores what it was sent", async () => {
    const input = newWebhook();
    const added = await adminApi().webhooks.add(input);
    if (!added.success) throw new Error(JSON.stringify(added.errors));
    const raw = responses.last("/webhooks/") as { webhooks: unknown[] };
    expect(unknownKeys(raw.webhooks[0], added.data, { at: "webhook", ignore: IGNORED })).toEqual([]);

    const integration = await conformanceIntegration();
    expect(added.data).toMatchObject({ ...input, integration_id: integration.id });
    expect(await readBack(added.data.id)).toMatchObject({ ...input, integration_id: integration.id });
  });

  test("PUT /webhooks/:id/ persists the edit", async () => {
    const api = adminApi();
    const added = await api.webhooks.add(newWebhook());
    if (!added.success) throw new Error(JSON.stringify(added.errors));

    const { name, target_url } = newWebhook();
    const edit = { event: "post.rescheduled" as const, name, target_url };
    const edited = await api.webhooks.edit(added.data.id, edit);
    if (!edited.success) throw new Error(JSON.stringify(edited.errors));
    const raw = responses.last(`/webhooks/${added.data.id}/`) as { webhooks: unknown[] };
    expect(unknownKeys(raw.webhooks[0], edited.data, { at: "webhook", ignore: IGNORED })).toEqual([]);

    expect(await readBack(added.data.id)).toMatchObject(edit);
  });

  test("PUT /webhooks/:id/ parses a webhook whose last delivery failed", async () => {
    const api = adminApi();
    const added = await api.webhooks.add({ ...newWebhook(), event: "tag.added" });
    if (!added.success) throw new Error(JSON.stringify(added.errors));
    expect(added.data.last_triggered_at).toBeNull();

    await api.tags.add({ name: `Webhook trigger ${uniqueSuffix()}` });
    await expect
      .poll(async () => (await readBack(added.data.id))?.last_triggered_at, { timeout: 10_000 })
      .toBeTruthy();

    const edited = await api.webhooks.edit(added.data.id, { name: "Triggered" });
    if (!edited.success) throw new Error(JSON.stringify(edited.errors));
    expect(edited.data.last_triggered_at).toEqual(expect.any(String));
    expect(edited.data.last_triggered_error).toEqual(expect.any(String));
    const raw = responses.last(`/webhooks/${added.data.id}/`) as { webhooks: unknown[] };
    expect(unknownKeys(raw.webhooks[0], edited.data, { at: "webhook", ignore: IGNORED })).toEqual([]);
  });

  // Expected failure: the webhook update schema drops secret, so a secret-only edit throws "No data to edit".
  test.fails("PUT /webhooks/:id/ rotates the secret on its own", async () => {
    const api = adminApi();
    const added = await api.webhooks.add(newWebhook());
    if (!added.success) throw new Error(JSON.stringify(added.errors));

    const secret = `rotated-${randomBytes(8).toString("hex")}`;
    // @ts-expect-error the update schema has no secret
    const edited = await api.webhooks.edit(added.data.id, { secret });
    if (!edited.success) throw new Error(JSON.stringify(edited.errors));
    expect(edited.data.secret).toBe(secret);
    expect((await readBack(added.data.id))?.secret).toBe(secret);
  });

  test("DELETE /webhooks/:id/ removes the webhook", async () => {
    const api = adminApi();
    const added = await api.webhooks.add(newWebhook());
    if (!added.success) throw new Error(JSON.stringify(added.errors));

    expect(await api.webhooks.delete(added.data.id)).toEqual({ success: true });
    expect(await readBack(added.data.id)).toBeUndefined();
  });
});
