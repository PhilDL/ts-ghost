import { describe, expect, test } from "vitest";

import type { AdminAPICredentials, ContentAPICredentials } from "../schemas/shared";
import { HTTPClient } from "./http-client";

describe("HTTPClient", () => {
  const httpClient = new HTTPClient({
    key: "a:b",
    version: "v5.0",
    endpoint: "content",
  });
  test("expect instanciation OK", async () => {
    expect(httpClient).toBeDefined();
    expect(httpClient.jwt).toBeUndefined();
  });
  test("returns a JWT", async () => {
    const jwt = await httpClient.generateJWT("a:b");
    expect(jwt).toMatch(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/);
  });
  test("returns correct headers if content api", async () => {
    const api: ContentAPICredentials = {
      url: "https://ghost.org",
      key: "1234",
      version: "v5.0",
      resource: "posts",
      endpoint: "content",
    };
    const headers = await httpClient.genHeaders(api);
    expect(headers).toEqual({
      "Content-Type": "application/json",
      "Accept-Version": "v5.0",
    });
  });

  test("returns correct headers if admin api", async () => {
    const api: AdminAPICredentials = {
      url: "https://ghost.org",
      key: "a:b",
      version: "v5.22",
      resource: "posts",
      endpoint: "admin",
    };
    const headers = await httpClient.genHeaders(api);
    expect(headers["Content-Type"]).toEqual("application/json");
    expect(headers["Accept-Version"]).toEqual("v5.22");
    expect(headers["Authorization"]).toMatch(/^Ghost [a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/);
  });
});
