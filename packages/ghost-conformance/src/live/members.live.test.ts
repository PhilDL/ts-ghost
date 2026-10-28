import { beforeAll, describe, expect, inject, test } from "vitest";
import { adminMembersSchema } from "@ts-ghost/admin-api";

import { EMAIL_SEED } from "../seeds/emails.ts";
import { MEMBER_SEED, seedMembers } from "../seeds/members.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

// Keys Ghost sends that the client deliberately doesn't model.
const IGNORED: string[] = [];

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
  const responses = liveResponses({ ignore: IGNORED });

  test("browse returns the seeded member with its labels and newsletters", async () => {
    const result = await adminApi()
      .members.browse({ filter: `email:'${MEMBER_SEED.plain}'` })
      .fetch();
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toHaveLength(1);
    const [member] = result.data;
    expect(member).toMatchObject({ status: "free", subscribed: true, name: "Plain Member", note: "seeded" });
    expect(member!.labels.map((label) => label.name)).toEqual([MEMBER_SEED.label]);
    expect(member!.newsletters.length).toBeGreaterThan(0);
    expect(member!.newsletters[0]).toMatchObject({ status: "active" });
  });

  test("reading by id equals the browse entry", async () => {
    const browsed = await adminApi()
      .members.browse({ filter: `email:'${MEMBER_SEED.plain}'` })
      .fetch();
    if (!browsed.success) throw new Error("browse failed");
    const read = await adminApi().members.read({ id: seeded.plain.id }).fetch();
    expect(read.success).toBe(true);
    if (!read.success) return;
    expect(read.data).toEqual(browsed.data[0]);
  });

  test("add, edit and delete a member, reading back each write", async () => {
    const api = adminApi();
    const added = await api.members.add({
      email: "member-crud@conformance.test",
      name: "Crud Member",
      note: "first",
      labels: [{ name: "Conformance crud" }],
    });
    expect(added.success).toBe(true);
    if (!added.success) return;
    expect(added.data).toMatchObject({ status: "free", name: "Crud Member", note: "first" });

    const edited = await api.members.edit(added.data.id, { name: "Renamed Member", note: "second" });
    expect(edited.success).toBe(true);

    const read = await api.members.read({ id: added.data.id }).fetch();
    if (!read.success) throw new Error("read back failed");
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

  test("an unsuppressed member has no suppression info", async () => {
    const result = await adminApi().members.read({ id: seeded.plain.id }).fetch();
    if (!result.success) throw new Error("read failed");
    expect(result.data.email_suppression).toEqual({ suppressed: false, info: null });
  });

  // Expected failure: email_suppression.info is typed as a string; Ghost sends { reason, timestamp }.
  test.fails("a suppressed member's suppression info carries reason and timestamp", async () => {
    for (const [email, reason] of [
      [EMAIL_SEED.members.spam, "spam"],
      [EMAIL_SEED.members.bounced, "fail"],
    ] as const) {
      const result = await adminApi()
        .members.read({ id: await memberId(email) })
        .fetch();
      if (!result.success) throw new Error("read failed");
      expect(result.data.email_suppression).toEqual({
        suppressed: true,
        info: { reason, timestamp: expect.any(String) },
      });
    }
  });

  // Expected failure: email_suppression.info is typed as a string; Ghost sends { reason, timestamp }.
  test.fails("browsing suppressed members parses", async () => {
    const { spam, bounced } = EMAIL_SEED.members;
    const result = await adminApi()
      .members.browse({ filter: `email:['${spam}','${bounced}']` })
      .fetch();
    expect(result.success).toBe(true);
  });

  // Expected failure: subscriptions[].current_period_end is typed as a string; Ghost sends null when comped.
  test.fails("browsing a comped member parses", async () => {
    const result = await adminApi()
      .members.browse({ filter: `email:'${MEMBER_SEED.comped}'` })
      .fetch();
    expect(result.success).toBe(true);
  });

  // Expected failure: subscriptions[].current_period_end is typed as a string; Ghost sends null when comped.
  test.fails("a comped member carries Ghost's stand-in subscription", async () => {
    const result = await adminApi().members.read({ id: seeded.comped.id }).fetch();
    if (!result.success) throw new Error("read failed");
    expect(result.data).toMatchObject({ status: "comped", comped: true });
    expect(result.data.subscriptions).toEqual([
      expect.objectContaining({ id: "", current_period_end: null, default_payment_card_last4: "****" }),
    ]);
  });

  // Expected failure: the client offers no member includes, so `tiers` is never requested.
  // A set `tiers` is covered by the paid member in paid-members.live.test.ts.
  test.fails("browse sends tiers only when they are included", async () => {
    const filter = `email:'${MEMBER_SEED.plain}'` as const;
    const plain = await adminApi().members.browse({ filter }).fields({ id: true }).fetch();
    expect(plain.success).toBe(true);
    expect((responses.last("/members/") as { members: object[] }).members[0]).not.toHaveProperty("tiers");

    // @ts-expect-error the client's member include schema is empty
    const included = await adminApi().members.browse({ filter }).include({ tiers: true }).fetch();
    if (!included.success) throw new Error("browse failed");
    // @ts-expect-error the client's member schema lacks `tiers`
    expect(included.data[0]?.tiers).toEqual([]);
  });

  // Expected failure: Ghost always sends `tiers` on read, but the client's member schema strips it.
  test.fails("read returns tiers with or without the include", async () => {
    const result = await adminApi().members.read({ id: seeded.plain.id }).fetch();
    if (!result.success) throw new Error("read failed");
    expect((responses.last("/members/") as { members: { tiers: unknown }[] }).members[0]?.tiers).toEqual([]);
    // @ts-expect-error the client's member schema lacks `tiers`
    expect(result.data.tiers).toEqual([]);
  });

  // Expected failure: the client offers no `email_recipients` include and its schema lacks the key.
  test.fails("email recipients come only when included, with and without delivery data", async () => {
    const id = await memberId(EMAIL_SEED.members.recipient);
    const result = await adminApi()
      .members.read({ id })
      // @ts-expect-error the client's member include schema is empty
      .include({ email_recipients: true })
      .fetch();
    if (!result.success) throw new Error("read failed");
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
  });

  // Expected failure: the client offers no `metafields` include and its schema lacks the key.
  test.fails("metafields come only when included, and only for members that have them", async () => {
    const { namespace, key, value } = MEMBER_SEED.metafield;
    const result = await adminApi()
      .members.browse({ filter: `email:['${MEMBER_SEED.metafields}','${MEMBER_SEED.plain}']` })
      // @ts-expect-error the client's member include schema is empty
      .include({ metafields: true })
      .fetch();
    if (!result.success) throw new Error("browse failed");
    expect(new URL(responses.all().at(-1)!.url).searchParams.get("include")).toBe("metafields");
    const byEmail = Object.fromEntries(result.data.map((member) => [member.email, member]));
    // @ts-expect-error the client's member schema lacks `metafields`
    expect(byEmail[MEMBER_SEED.metafields]?.metafields).toEqual({ [namespace]: { [key]: value } });
    expect(byEmail[MEMBER_SEED.plain]).not.toHaveProperty("metafields");
  });

  // Expected failure: avatar_image is typed as a string; Ghost sends null when Gravatar is off site-wide.
  test.fails("a member without an avatar (Gravatar off) parses", async () => {
    await adminApi().members.read({ id: seeded.plain.id }).fetch();
    const raw = (responses.last("/members/") as { members: Record<string, unknown>[] }).members[0];
    // Patched, not seeded: Gravatar is a boot-time config switch that would null every member in other files.
    expect(adminMembersSchema.safeParse({ ...raw, avatar_image: null }).success).toBe(true);
  });

  // Expected failure: the member schema lacks uuid, attribution, can_comment, commenting, tiers,
  // current_subscription, unsubscribe_url and the notification flags (Ghost 6.72).
  test.fails("a member carries no key the client's schema lacks", async () => {
    const result = await adminApi().members.read({ id: seeded.plain.id }).fetch();
    if (!result.success) throw new Error("read failed");
    const raw = responses.last("/members/") as { members: unknown[] };
    expect(unknownKeys(raw.members[0], result.data, { at: "member", ignore: IGNORED })).toEqual([]);
  });
});
