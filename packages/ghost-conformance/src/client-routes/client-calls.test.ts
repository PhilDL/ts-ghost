import { describe, expect, test } from "vitest";

import { recordClientCalls } from "./client-calls.ts";

describe("recording the client's calls", () => {
  test("every public method is called once per identity form, recording method and erased path", async () => {
    const calls = await recordClientCalls();
    expect(calls).toEqual(
      expect.arrayContaining([
        { name: "posts.browse", method: "GET", path: "/posts/" },
        { name: "posts.read({id})", method: "GET", path: "/posts/:/" },
        { name: "posts.read({slug})", method: "GET", path: "/posts/slug/:/" },
        { name: "posts.add", method: "POST", path: "/posts/" },
        { name: "posts.edit", method: "PUT", path: "/posts/:/" },
        { name: "posts.delete", method: "DELETE", path: "/posts/:/" },
        { name: "users.read({email})", method: "GET", path: "/users/email/:/" },
        { name: "offers.add", method: "POST", path: "/offers/" },
        { name: "webhooks.edit", method: "PUT", path: "/webhooks/:/" },
        { name: "site.fetch", method: "GET", path: "/site/" },
      ]),
    );
    expect(calls.map((c) => c.name)).not.toContain("users.read({slug})");
  });
});
