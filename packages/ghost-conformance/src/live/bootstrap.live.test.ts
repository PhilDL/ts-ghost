import { describe, expect, inject, test } from "vitest";

import { adminApi, liveResponses } from "./ghost.ts";

describe("bootstrap credentials", () => {
  liveResponses({ ignore: [] });

  test.each(["integration", "staff"] as const)("the %s key authenticates the public client", async (key) => {
    const result = await adminApi(key).tags.browse({ limit: 1 }).fetch();
    expect(result.success).toBe(true);
  });

  test("the session cookie authenticates as the Owner", async () => {
    const ghost = inject("ghost");
    const response = await fetch(`${ghost.url}/ghost/api/admin/users/me/`, {
      headers: { cookie: ghost.sessionCookie },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { users: { email: string }[] };
    expect(body.users[0]?.email).toBe(ghost.owner.email);
  });
});
