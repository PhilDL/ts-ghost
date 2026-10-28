import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import {
  recordResponses,
  trackParsed,
  unknownKeys,
  unknownKeysOfResponses,
  type ResponseRecorder,
} from "./unknown-keys.ts";

const KEY = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
const site = { title: "T", description: "D", logo: null, version: "6.72", url: "http://localhost/" };

function ghostReturns(body: unknown) {
  // A plain function, not vi.fn(): recordResponses() spies on whatever fetch it finds.
  vi.stubGlobal(
    "fetch",
    async () => new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } }),
  );
}

describe("unknown-key check", () => {
  let responses: ResponseRecorder;
  beforeEach(() => {
    ghostReturns({ site: { ...site, locale: "en", accent_color: "#fff" } });
    responses = recordResponses();
  });
  afterEach(() => {
    responses.restore();
    vi.unstubAllGlobals();
  });

  test("names the path of each key Ghost sends that the client's schema lacks", async () => {
    const result = await new TSGhostAdminAPI("http://localhost:2368", KEY, "v6.0").site.fetch();
    expect(result.success).toBe(true);
    if (!result.success) return;

    const raw = responses.last("/site/") as { site: unknown };
    expect(unknownKeys(raw.site, result.data, { at: "site" })).toEqual(["site.accent_color", "site.locale"]);
  });

  test("leaves out keys declared as deliberately ignored", async () => {
    const result = await new TSGhostAdminAPI("http://localhost:2368", KEY, "v6.0").site.fetch();
    if (!result.success) throw new Error("site fetch failed");

    const raw = responses.last("/site/") as { site: unknown };
    expect(unknownKeys(raw.site, result.data, { at: "site", ignore: ["site.locale"] })).toEqual([
      "site.accent_color",
    ]);
  });
});

describe("unknownKeys paths", () => {
  test("walks nested objects and arrays, collapsing array indices to []", () => {
    const raw = {
      a: { b: 1, c: 2 },
      list: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
      n: null,
    };
    const parsed = { a: { b: 1 }, list: [{ x: 1 }, { x: 3 }], n: null };
    expect(unknownKeys(raw, parsed, { at: "posts" })).toEqual(["posts.a.c", "posts.list[].y"]);
  });

  test("reports nothing when the parsed value keeps every key", () => {
    expect(unknownKeys({ a: [{ b: 1 }] }, { a: [{ b: 1 }] }, { at: "x" })).toEqual([]);
  });
});

describe("unknown keys of captured responses", () => {
  let responses: ResponseRecorder;
  afterEach(() => {
    responses.restore();
    vi.unstubAllGlobals();
  });

  test("checks each tracked client result against the response it parsed", async () => {
    ghostReturns({ site: { ...site, locale: "en" } });
    responses = recordResponses();
    const api = trackParsed(new TSGhostAdminAPI("http://localhost:2368", KEY, "v6.0"));
    expect((await api.site.fetch()).success).toBe(true);
    expect(unknownKeysOfResponses(responses.all(), [])).toEqual(["site.locale"]);
  });

  test("walks list resources as arrays and leaves out ignored paths", async () => {
    ghostReturns({ tags: [{ id: "1", extra: 1, other: 2 }], meta: { pagination: {} } });
    responses = recordResponses();
    const fakeClient = {
      tags: {
        browse: () => ({
          fetch: async () => {
            await fetch("http://localhost/tags/");
            return { success: true, data: [{ id: "1" }] };
          },
        }),
      },
    };
    await trackParsed(fakeClient).tags.browse().fetch();
    expect(unknownKeysOfResponses(responses.all(), ["tags[].other"])).toEqual(["tags[].extra"]);
  });

  test("compares a single result with the one entry Ghost wraps it in", async () => {
    ghostReturns({ tags: [{ id: "1", extra: 1 }] });
    responses = recordResponses();
    const fakeClient = {
      read: async () => {
        await fetch("http://localhost/tags/1/");
        return { success: true, data: { id: "1" } };
      },
    };
    await trackParsed(fakeClient).read();
    expect(unknownKeysOfResponses(responses.all(), [])).toEqual(["tags[].extra"]);
  });

  test("skips responses to a fields selection, whose result leaves out the other keys on purpose", async () => {
    ghostReturns({ tags: [{ id: "1", name: "n" }] });
    responses = recordResponses();
    const fakeClient = {
      read: async () => {
        await fetch("http://localhost/tags/1/?fields=id");
        return { success: true, data: { id: "1" } };
      },
    };
    await trackParsed(fakeClient).read();
    expect(unknownKeysOfResponses(responses.all(), [])).toEqual([]);
  });

  test("skips responses no client result parsed", async () => {
    ghostReturns({ site: { ...site, locale: "en" } });
    responses = recordResponses();
    await fetch("http://localhost:2368/ghost/api/admin/site/");
    expect(unknownKeysOfResponses(responses.all(), [])).toEqual([]);
  });
});
