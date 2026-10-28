import { describe, expect, test } from "vitest";

import { classifyRoute } from "./classify.ts";

const admin = { method: "PUT", path: "/settings", labs: null, guard: "admin" } as const;
const responses = (none: number, integration: number, staff: number, session: number) => ({
  none: { status: none },
  integration: { status: integration },
  staff: { status: staff },
  session: { status: session },
});

describe("classifyRoute", () => {
  test("401 and 403 mean refused; any other status, even an error, means accepted", () => {
    expect(classifyRoute(admin, responses(403, 403, 422, 404))).toEqual({
      public: false,
      integration: false,
      staff: true,
      session: true,
    });
    expect(classifyRoute(admin, responses(401, 401, 500, 400))).toMatchObject({
      staff: true,
      session: true,
    });
  });

  test("a route without auth middleware is public whatever its body-less request returns", () => {
    const signIn = { method: "POST", path: "/session", labs: null, guard: "none" } as const;
    expect(classifyRoute(signIn, responses(401, 401, 401, 401))).toEqual({
      public: true,
      integration: true,
      staff: true,
      session: true,
    });
  });

  test("a URL-token route refuses every header credential", () => {
    const schedules = {
      method: "PUT",
      path: "/schedules/:resource/:id",
      labs: null,
      guard: "url-token",
    } as const;
    expect(classifyRoute(schedules, responses(401, 401, 401, 401))).toEqual({
      public: false,
      integration: false,
      staff: false,
      session: false,
    });
  });

  test("a credential whose request never gets an answer got past auth, which refuses immediately", () => {
    const hanging = { ...responses(403, 403, 0, 0), staff: { status: "timeout" as const } };
    expect(classifyRoute(admin, hanging)).toMatchObject({ integration: false, staff: true });
    const anonymousHang = { ...responses(403, 403, 0, 0), none: { status: "timeout" as const } };
    expect(() => classifyRoute(admin, anonymousHang)).toThrow(/anonymous/);
  });

  test("a rate-limited response can't be classified", () => {
    expect(() => classifyRoute(admin, responses(403, 403, 429, 200))).toThrow(/429/);
  });

  test("a redirect means the probe URL wasn't the canonical one", () => {
    expect(() => classifyRoute(admin, responses(403, 301, 301, 301))).toThrow(/301/);
  });

  test("a guarded route that lets an anonymous request through means the probe missed the route", () => {
    expect(() => classifyRoute(admin, responses(404, 403, 200, 200))).toThrow(/anonymous/);
  });
});
