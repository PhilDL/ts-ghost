import { describe, test, expect, beforeEach } from "vitest";
import { TSGhostContentAPI } from "../content-api";

const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
const key = process.env.VITE_GHOST_CONTENT_API_KEY || "59d4bf56c73c04a18c867dc3ba";

const stub = {
  id: "1",
  name: "PhilDL",
  slug: "phildl",
  profile_image: "https://www.gravatar.com/avatar/c2baf8feb52fc654cc40c731207c677d?s=250&r=x&d=mp",
  cover_image: null,
  bio: null,
  website: "https://github.com/PhilDL",
  location: null,
  facebook: null,
  twitter: null,
  meta_title: null,
  meta_description: null,
  count: [Object],
  url: "https://astro-starter.digitalpress.blog/author/phildl/",
};
describe("authors integration tests browse", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI(url, key, "v5.0");
  });
  test("authors.browse()", async () => {
    const result = await api.authors.browse().fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (result.status === "error") {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.meta.pagination).toBeDefined();
      expect(result.meta.pagination.page).toBe(1);
      expect(result.meta.pagination.limit).toBe(15);
      expect(result.meta.pagination.pages).toBe(1);
      expect(result.data).toHaveLength(1);
      const author = result.data[0];
      expect(author).toBeDefined();
      expect(author.id).toBe(stub.id);
      expect(author.name).toBe(stub.name);
      expect(author.slug).toBe(stub.slug);
      expect(author.profile_image).toBe(stub.profile_image);
      expect(author.cover_image).toBe(stub.cover_image);
      expect(author.bio).toBe(stub.bio);
      expect(author.website).toBe(stub.website);
      expect(author.location).toBe(stub.location);
      expect(author.facebook).toBe(stub.facebook);
      expect(author.twitter).toBe(stub.twitter);
      expect(author.url).toBe(stub.url);
    }
  });

  test("authors.browse() with output", async () => {
    const result = await api.authors
      .browse()
      .fields({ id: true, name: true, slug: true, count: true })
      .include({ "count.posts": true })
      .fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (result.status === "error") {
      return;
    }
    expect(result.meta.pagination).toBeDefined();
    expect(result.meta.pagination.page).toBe(1);
    expect(result.meta.pagination.limit).toBe(15);
    expect(result.meta.pagination.pages).toBe(1);
    expect(result.data).toHaveLength(1);
    const author = result.data[0];
    expect(author).toBeDefined();
    expect(author.id).toBe(stub.id);
    expect(author.name).toBe(stub.name);
    expect(author.slug).toBe(stub.slug);
    // @ts-expect-error - shouldnt be defined because was not in fields output
    expect(author.facebook).toBe(undefined);
    // this would be undefined because Ghost API doesn't return it if the fields arg is there
    expect(author.count?.posts).toBe(undefined);
  });
  test("authors.browse() with include count.posts", async () => {
    const result = await api.authors.browse().include({ "count.posts": true }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (result.status === "error") {
      return;
    }
    expect(result.meta.pagination).toBeDefined();
    expect(result.meta.pagination.page).toBe(1);
    expect(result.meta.pagination.limit).toBe(15);
    expect(result.meta.pagination.pages).toBe(1);
    expect(result.data).toHaveLength(1);
    const author = result.data[0];
    expect(author).toBeDefined();
    expect(author.id).toBe(stub.id);
    expect(author.name).toBe(stub.name);
    expect(author.slug).toBe(stub.slug);
    expect(author.count?.posts).toBeGreaterThan(0);
  });
});

describe("authors integration tests read", () => {
  const api = new TSGhostContentAPI(url, key, "v5.0");

  test("should fetch one author correctly by id", async () => {
    const readQuery = api.authors.read({ id: "1" });
    expect(readQuery).not.toBeUndefined();
    expect(readQuery.getParams().fields).toBeUndefined();
    expect(readQuery.getURL()?.searchParams.toString()).toBeDefined();
    expect(readQuery.getURL()?.searchParams.toString()).toContain("key=");
    const result = await readQuery.fetch();
    expect(result).not.toBeUndefined();
    if (result.status === "success") {
      expect(result.data.id).toBe("1");
      expect(result.data.slug).toBe("phildl");
      expect(result.data.name).toBe("PhilDL");
      expect(result.data.website).toBe("https://github.com/PhilDL");
      expect(result.data.facebook).toBeNull();
      expect(result.data.url).toBe("https://astro-starter.digitalpress.blog/author/phildl/");
      expect(result.data.profile_image).toBe(
        "https://www.gravatar.com/avatar/c2baf8feb52fc654cc40c731207c677d?s=250&r=x&d=mp"
      );
    }
  });

  test("should fetch one author correctly by slug", async () => {
    const readQuery = api.authors.read({ slug: "phildl" });
    expect(readQuery).not.toBeUndefined();
    expect(readQuery.getParams().fields).toBeUndefined();
    expect(readQuery.getURL()?.searchParams.toString()).toBeDefined();
    expect(readQuery.getURL()?.searchParams.toString()).toContain("key=");
    const result = await readQuery.fetch();
    expect(result).not.toBeUndefined();
    if (result.status === "success") {
      expect(result.data.id).toBe("1");
      expect(result.data.slug).toBe("phildl");
      expect(result.data.name).toBe("PhilDL");
      expect(result.data.website).toBe("https://github.com/PhilDL");
      expect(result.data.facebook).toBeNull();
      expect(result.data.url).toBe("https://astro-starter.digitalpress.blog/author/phildl/");
      expect(result.data.profile_image).toBe(
        "https://www.gravatar.com/avatar/c2baf8feb52fc654cc40c731207c677d?s=250&r=x&d=mp"
      );
    }
  });

  test("should fetch author correctly and accept specific field", async () => {
    const readQuery = api.authors.read({ id: "1" }).fields({ name: true });
    expect(readQuery).not.toBeUndefined();
    expect(readQuery.getOutputFields()).toStrictEqual(["name"]);
    expect(readQuery.getURL()?.searchParams.toString()).toContain("&fields=name");
    const result = await readQuery.fetch();
    expect(result).not.toBeUndefined();
    if (result.status === "success") {
      expect(result.data.name).toBe("PhilDL");
      // @ts-expect-error - these fields should not be defined
      expect(result.data.website).toBeUndefined();
      // @ts-expect-error - these fields should not be defined
      expect(result.data.facebook).toBeUndefined();
    }
  });

  test("should fetch author correctly and accept include", async () => {
    const readQuery = api.authors.read({ id: "1" }).include({ "count.posts": true });
    expect(readQuery).not.toBeUndefined();
    expect(readQuery.getParams()?.fields).toBeUndefined();
    expect(readQuery.getParams()?.include).toStrictEqual(["count.posts"]);
    expect(readQuery.getURL()?.searchParams.toString()).toContain("&include=count.posts");
    const result = await readQuery.fetch();
    expect(result).not.toBeUndefined();
    if (result.status === "success") {
      expect(result.data.name).toBe("PhilDL");
      expect(result.data.slug).toBe("phildl");
      expect(result.data.website).toBe("https://github.com/PhilDL");
      expect(result.data.facebook).toBeNull();
      expect(result.data.url).toBe("https://astro-starter.digitalpress.blog/author/phildl/");
      expect(result.data.count?.posts).toBe(1);
    }
  });

  test("should catch the case where author is not found", async () => {
    const readQuery = api.authors.read({ id: "32" });
    expect(readQuery).not.toBeUndefined();
    expect(readQuery.getParams().fields).toBeUndefined();
    expect(readQuery.getURL()?.searchParams.toString()).toBeDefined();
    expect(readQuery.getURL()?.searchParams.toString()).toContain("key=");
    const result = await readQuery.fetch();
    expect(result).not.toBeUndefined();
    assert(result.status === "error");
    expect(result.errors).toBeDefined();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain("author");
  });
});
