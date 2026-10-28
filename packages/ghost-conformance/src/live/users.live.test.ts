import { beforeAll, describe, expect, inject } from "vitest";

import { seedUsers, STAFF_PROFILE, TOUR } from "../seeds/users.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { assertOk, liveTest } from "./live-test.ts";

describe("users", () => {
  let seeded: Awaited<ReturnType<typeof seedUsers>>;
  beforeAll(async () => {
    seeded = await seedUsers();
  });

  liveTest("GET /users/:id/ and /users/email/:email/ return the same user", async ({ api }) => {
    const owner = await api.users.read({ email: inject("ghost").owner.email }).fetch();
    assertOk(owner);

    for (const { id, email } of [{ id: owner.data.id, email: owner.data.email! }, seeded.staff]) {
      const byId = await api.users.read({ id }).fetch();
      const byEmail = await api.users.read({ email }).fetch();
      assertOk(byId);
      assertOk(byEmail);
      expect(byEmail.data).toEqual(byId.data);
    }
  });

  liveTest("GET /users/:id/ returns profile fields both null and set", async ({ api }) => {
    const owner = await api.users.read({ email: inject("ghost").owner.email }).fetch();
    const staff = await api.users.read({ id: seeded.staff.id }).fetch();
    assertOk(owner);
    assertOk(staff);

    expect(owner.data.bio).toBeNull();
    expect(staff.data).toMatchObject({ ...STAFF_PROFILE, status: "active" });
    expect(staff.data.last_seen).toEqual(expect.any(String));
  });

  // Expected failure: the users schema types tour as boolean; Ghost sends the stored JSON string.
  liveTest.fails("GET /users/:id/ returns a user's tour", async ({ api }) => {
    const result = await api.users.read({ id: seeded.toured.id }).fetch();
    assertOk(result);
    expect(result.data.tour).toBe(TOUR);
  });

  // Expected failure: the users schema rejects status inactive, which Ghost sends for a suspended user.
  liveTest.fails("GET /users/ lists an inactive user", async ({ api }) => {
    const filter = `slug:[${seeded.suspended.slug},${seeded.staff.slug}]` as const;
    const result = await api.users.browse({ filter }).fetch();
    assertOk(result);

    expect(result.data.find((u) => u.id === seeded.suspended.id)?.status).toBe("inactive");
    expect(result.data.map((u) => u.id)).toEqual(expect.arrayContaining([seeded.staff.id]));
  });

  // Expected failure: the users schema lacks Ghost 6.72's socials (bluesky, threads...) and notification flags.
  liveTest.fails("user responses send no key the client's schema lacks", async ({ api, responses }) => {
    const read = await api.users.read({ id: seeded.staff.id }).fetch();
    const readRaw = responses.last(`/users/${seeded.staff.id}/`) as { users: unknown[] };
    const byEmail = await api.users.read({ email: seeded.staff.email }).fetch();
    const emailRaw = responses.last(`/users/email/`) as { users: unknown[] };
    assertOk(read);
    assertOk(byEmail);

    expect([
      ...unknownKeys(readRaw.users[0], read.data, { at: "read.user" }),
      ...unknownKeys(emailRaw.users[0], byEmail.data, { at: "email.user" }),
    ]).toEqual([]);
  });
});
