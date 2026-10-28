import { randomBytes } from "node:crypto";
import { describe, expect } from "vitest";

import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { conformanceIntegration, WEBHOOK_TARGET } from "../seeds/webhooks.ts";
import { unknownKeysOfResponses } from "../unknown-keys.ts";
import { assertOk, liveTest } from "./ghost.ts";

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
  liveTest(
    "POST /webhooks/ ties the webhook to the calling integration and stores what it was sent",
    async ({ api }) => {
      const input = newWebhook();
      const added = await api.webhooks.add(input);
      assertOk(added);

      const integration = await conformanceIntegration();
      expect(added.data).toMatchObject({ ...input, integration_id: integration.id });
      expect(await readBack(added.data.id)).toMatchObject({ ...input, integration_id: integration.id });
    },
  );

  liveTest("PUT /webhooks/:id/ persists the edit", async ({ api }) => {
    const added = await api.webhooks.add(newWebhook());
    assertOk(added);

    const { name, target_url } = newWebhook();
    const edit = { event: "post.rescheduled" as const, name, target_url };
    const edited = await api.webhooks.edit(added.data.id, edit);
    assertOk(edited);

    expect(await readBack(added.data.id)).toMatchObject(edit);
  });

  liveTest("PUT /webhooks/:id/ parses a webhook whose last delivery failed", async ({ api }) => {
    const added = await api.webhooks.add({ ...newWebhook(), event: "tag.added" });
    assertOk(added);
    expect(added.data.last_triggered_at).toBeNull();

    await api.tags.add({ name: `Webhook trigger ${uniqueSuffix()}` });
    await expect
      .poll(async () => (await readBack(added.data.id))?.last_triggered_at, { timeout: 10_000 })
      .toBeTruthy();

    const edited = await api.webhooks.edit(added.data.id, { name: "Triggered" });
    assertOk(edited);
    expect(edited.data.last_triggered_at).toEqual(expect.any(String));
    expect(edited.data.last_triggered_error).toEqual(expect.any(String));
  });

  // Expected failure: the webhook update schema drops secret, so a secret-only edit throws "No data to edit".
  liveTest.fails("PUT /webhooks/:id/ rotates the secret on its own", async ({ api }) => {
    const added = await api.webhooks.add(newWebhook());
    assertOk(added);

    const secret = `rotated-${randomBytes(8).toString("hex")}`;
    // @ts-expect-error the update schema has no secret
    const edited = await api.webhooks.edit(added.data.id, { secret });
    assertOk(edited);
    expect(edited.data.secret).toBe(secret);
    expect((await readBack(added.data.id))?.secret).toBe(secret);
  });

  liveTest("DELETE /webhooks/:id/ removes the webhook", async ({ api }) => {
    const added = await api.webhooks.add(newWebhook());
    assertOk(added);

    expect(await api.webhooks.delete(added.data.id)).toEqual({ success: true });
    expect(await readBack(added.data.id)).toBeUndefined();
  });

  liveTest("webhook responses carry no key the client's schema lacks", async ({ api, responses }) => {
    const added = await api.webhooks.add(newWebhook());
    assertOk(added);
    assertOk(await api.webhooks.edit(added.data.id, { name: `Key check ${uniqueSuffix()}` }));

    expect(unknownKeysOfResponses(responses.all())).toEqual([]);
  });
});
