import { beforeAll, describe, expect, inject } from "vitest";
import { adminMembersSchema } from "@ts-ghost/admin-api";

import { EMAIL_SEED } from "../seeds/emails.ts";
import { MEMBER_SEED, seedMembers } from "../seeds/members.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { adminApi, assertOk, liveTest } from "./ghost.ts";

type Seeded = Awaited<ReturnType<typeof seedMembers>>;
let seeded: Seeded;
beforeAll(async () => {
  seeded = await seedMembers(inject("ghost"));
});

/** Id of a member by email; selects only `id` so members the client can't parse still resolve. */
async function memberId(email: string): Promise<string> {
  const result = await adminApi()
    .members.browse({ filter: `email:'${email}'` })
    .fields({ id: true })
    .fetch();
  if (!result.success || !result.data[0]) throw new Error(`No member ${email}`);
  return result.data[0].id;
}

describe("members", () => {
  liveTest("browse returns the seeded member with its labels and newsletters", async ({ api }) => {
    const result = await api.members.browse({ filter: `email:'${MEMBER_SEED.plain}'` }).fetch();
    assertOk(result);
    expect(result.data).toHaveLength(1);
    const [member] = result.data;
    expect(member).toMatchObject({ status: "free", subscribed: true, name: "Plain Member", note: "seeded" });
    expect(member!.labels.map((label) => label.name)).toEqual([MEMBER_SEED.label]);
    expect(member!.newsletters.length).toBeGreaterThan(0);
    expect(member!.newsletters[0]).toMatchObject({ status: "active" });
  });

  liveTest("reading by id equals the browse entry", async ({ api }) => {
    const browsed = await api.members.browse({ filter: `email:'${MEMBER_SEED.plain}'` }).fetch();
    assertOk(browsed);
    const read = await api.members.read({ id: seeded.plain.id }).fetch();
    assertOk(read);
    expect(read.data).toEqual(browsed.data[0]);
  });

  liveTest("add, edit and delete a member, reading back each write", async ({ api }) => {
    const added = await api.members.add({
      email: "member-crud@conformance.test",
      name: "Crud Member",
      note: "first",
      labels: [{ name: "Conformance crud" }],
    });
    assertOk(added);
    expect(added.data).toMatchObject({ status: "free", name: "Crud Member", note: "first" });

    const edited = await api.members.edit(added.data.id, { name: "Renamed Member", note: "second" });
    assertOk(edited);

    const read = await api.members.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({
      email: "member-crud@conformance.test",
      name: "Renamed Member",
      note: "second",
    });
    expect(read.data.labels.map((label) => label.name)).toEqual(["Conformance crud"]);

    expect(await api.members.delete(added.data.id)).toEqual({ success: true });
    const gone = await api.members.read({ id: added.data.id }).fetch();
    expect(gone.success).toBe(false);
  });

  liveTest("an unsuppressed member has no suppression info", async ({ api }) => {
    const result = await api.members.read({ id: seeded.plain.id }).fetch();
    assertOk(result);
    expect(result.data.email_suppression).toEqual({ suppressed: false, info: null });
  });

  // Expected failure: email_suppression.info is typed as a string; Ghost sends { reason, timestamp }.
  liveTest.fails("a suppressed member's suppression info carries reason and timestamp", async ({ api }) => {
    for (const [email, reason] of [
      [EMAIL_SEED.members.spam, "spam"],
      [EMAIL_SEED.members.bounced, "fail"],
    ] as const) {
      const result = await api.members.read({ id: await memberId(email) }).fetch();
      assertOk(result);
      expect(result.data.email_suppression).toEqual({
        suppressed: true,
        info: { reason, timestamp: expect.any(String) },
      });
    }
  });

  // Expected failure: email_suppression.info is typed as a string; Ghost sends { reason, timestamp }.
  liveTest.fails("browsing suppressed members parses", async ({ api }) => {
    const { spam, bounced } = EMAIL_SEED.members;
    const result = await api.members.browse({ filter: `email:['${spam}','${bounced}']` }).fetch();
    assertOk(result);
  });

  // Expected failure: subscriptions[].current_period_end is typed as a string; Ghost sends null when comped.
  liveTest.fails("browsing a comped member parses", async ({ api }) => {
    const result = await api.members.browse({ filter: `email:'${MEMBER_SEED.comped}'` }).fetch();
    assertOk(result);
  });

  // Expected failure: subscriptions[].current_period_end is typed as a string; Ghost sends null when comped.
  liveTest.fails("a comped member carries Ghost's stand-in subscription", async ({ api }) => {
    const result = await api.members.read({ id: seeded.comped.id }).fetch();
    assertOk(result);
    expect(result.data).toMatchObject({ status: "comped", comped: true });
    expect(result.data.subscriptions).toEqual([
      expect.objectContaining({ id: "", current_period_end: null, default_payment_card_last4: "****" }),
    ]);
  });

  // Expected failure: the client offers no member includes, so `tiers` is never requested.
  // A set `tiers` is covered by the paid member in paid-members.live.test.ts.
  liveTest.fails("browse sends tiers only when they are included", async ({ api, responses }) => {
    const filter = `email:'${MEMBER_SEED.plain}'` as const;
    const plain = await api.members.browse({ filter }).fields({ id: true }).fetch();
    assertOk(plain);
    expect((responses.last("/members/") as { members: object[] }).members[0]).not.toHaveProperty("tiers");

    // @ts-expect-error the client's member include schema is empty
    const included = await api.members.browse({ filter }).include({ tiers: true }).fetch();
    assertOk(included);
    // @ts-expect-error the client's member schema lacks `tiers`
    expect(included.data[0]?.tiers).toEqual([]);
  });

  // Expected failure: Ghost always sends `tiers` on read, but the client's member schema strips it.
  liveTest.fails("read returns tiers with or without the include", async ({ api, responses }) => {
    const result = await api.members.read({ id: seeded.plain.id }).fetch();
    assertOk(result);
    expect((responses.last("/members/") as { members: { tiers: unknown }[] }).members[0]?.tiers).toEqual([]);
    // @ts-expect-error the client's member schema lacks `tiers`
    expect(result.data.tiers).toEqual([]);
  });

  // Expected failure: the client offers no `email_recipients` include and its schema lacks the key.
  liveTest.fails(
    "email recipients come only when included, with and without delivery data",
    async ({ api }) => {
      const id = await memberId(EMAIL_SEED.members.recipient);
      const result = await api.members
        .read({ id })
        // @ts-expect-error the client's member include schema is empty
        .include({ email_recipients: true })
        .fetch();
      assertOk(result);
      // @ts-expect-error the client's member schema lacks `email_recipients`
      const recipients = result.data.email_recipients as Record<string, unknown>[];
      expect(recipients).toHaveLength(2);
      for (const recipient of recipients) {
        expect(recipient).toMatchObject({
          member_email: EMAIL_SEED.members.recipient,
          email_id: expect.any(String),
        });
      }
      expect(recipients.map((r) => r.member_name).sort()).toEqual(["Email Recipient", null]);
      expect(recipients.filter((r) => r.delivered_at === null)).toHaveLength(1);
    },
  );

  // Expected failure: the client offers no `metafields` include and its schema lacks the key.
  liveTest.fails(
    "metafields come only when included, and only for members that have them",
    async ({ api, responses }) => {
      const { namespace, key, value } = MEMBER_SEED.metafield;
      const result = await api.members
        .browse({ filter: `email:['${MEMBER_SEED.metafields}','${MEMBER_SEED.plain}']` })
        // @ts-expect-error the client's member include schema is empty
        .include({ metafields: true })
        .fetch();
      assertOk(result);
      expect(new URL(responses.all().at(-1)!.url).searchParams.get("include")).toBe("metafields");
      const byEmail = Object.fromEntries(result.data.map((member) => [member.email, member]));
      // @ts-expect-error the client's member schema lacks `metafields`
      expect(byEmail[MEMBER_SEED.metafields]?.metafields).toEqual({ [namespace]: { [key]: value } });
      expect(byEmail[MEMBER_SEED.plain]).not.toHaveProperty("metafields");
    },
  );

  // Expected failure: avatar_image is typed as a string; Ghost sends null when Gravatar is off site-wide.
  liveTest.fails("a member without an avatar (Gravatar off) parses", async ({ api, responses }) => {
    await api.members.read({ id: seeded.plain.id }).fetch();
    const raw = (responses.last("/members/") as { members: Record<string, unknown>[] }).members[0];
    // Patched, not seeded: Gravatar is a boot-time config switch that would null every member in other files.
    expect(adminMembersSchema.safeParse({ ...raw, avatar_image: null }).success).toBe(true);
  });

  // Expected failure: the member schema lacks uuid, attribution, can_comment, commenting, tiers,
  // current_subscription, unsubscribe_url and the notification flags (Ghost 6.72).
  liveTest.fails("a member carries no key the client's schema lacks", async ({ api, responses }) => {
    const result = await api.members.read({ id: seeded.plain.id }).fetch();
    assertOk(result);
    const raw = responses.last("/members/") as { members: unknown[] };
    expect(unknownKeys(raw.members[0], result.data, { at: "member" })).toEqual([]);
  });
});
