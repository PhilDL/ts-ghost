import { describe, expect, test } from "vitest";

import type { ManifestRoute } from "../manifest/manifest.ts";
import { checkCall } from "./route-check.ts";

const route = (method: string, path: string, integration = true): ManifestRoute => ({
  method,
  path,
  labs: null,
  public: false,
  integration,
  staff: true,
  session: true,
});
const routes = [
  route("GET", "/posts/:id/"),
  route("GET", "/posts/slug/:slug/"),
  route("PUT", "/settings/", false),
];

describe("client call against the manifest", () => {
  test("a call whose route exists and accepts integration tokens passes, whatever the param names", () => {
    expect(checkCall(routes, { name: "posts.read({slug})", method: "GET", path: "/posts/slug/:/" })).toBe(
      undefined,
    );
    expect(checkCall(routes, { name: "posts.read({id})", method: "GET", path: "/posts/:/" })).toBe(
      undefined,
    );
  });

  test("a route missing from the manifest is named with the client method", () => {
    expect(checkCall(routes, { name: "tags.read({id})", method: "GET", path: "/tags/:/" })).toBe(
      "tags.read({id}) calls GET /tags/:/, which Ghost does not have",
    );
  });

  test("a route that refuses integration tokens is named with the client method", () => {
    expect(checkCall(routes, { name: "settings.edit", method: "PUT", path: "/settings/" })).toBe(
      "settings.edit calls PUT /settings/, which refuses integration tokens",
    );
  });
});
