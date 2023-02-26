import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import { BrowseEndpointType, TSGhostContentAPI } from "../content-api";
import { ContentAPICredentialsSchema } from "@ts-ghost/core-api";
import { AuthorsAPI } from "./api";
import { authorsIncludeSchema, AuthorSchema } from "./schemas";

const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
const key = process.env.VITE_GHOST_CONTENT_API_KEY || "93fa6b1e07090ecdf686521b7e";

const stub = {
  slug: "coding-dodo",
  id: "1",
  meta_title: null,
  meta_description: null,
  name: "Philippe L'ATTENTION",
  profile_image: "https://codingdodo.com/content/images/2021/04/small-logo-1.png",
  cover_image: "https://codingdodo.com/content/images/2021/04/Coding-Dodo-1.png",
  bio: "Creator of CodingDodo, I am a Software Architect that loves Python, JavaScript, TypeScript, and Software Architecture in general. I like to share the things I learn through teaching them!",
  website: "https://bio.link/codingdodo",
  location: "Reunion Island",
  facebook: "CodingDodo/",
  twitter: "@_philDL",
  url: "https://codingdodo.com/author/coding-dodo/",
};
describe("Integration tests", () => {
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
      .browse({
        output: { fields: { id: true, name: true, slug: true, count: true }, include: { "count.posts": true } },
      })
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
    const result = await api.authors.browse({ output: { include: { "count.posts": true } } }).fetch();
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
    expect(author.count?.posts).toBeGreaterThan(10);
  });
});

describe("ContentApi.browse() Args Type-safety", () => {
  const api = new TSGhostContentAPI(url, key, "v5.0");
  test(".browse() params shouldnt accept invalid params", () => {
    // @ts-expect-error - shouldnt accept invalid params
    const browse = api.authors.browse({ input: { pp: 2 } });
    expect(browse.getBrowseParams()).toStrictEqual({});
  });

  test(".browse() 'order' params should ony accept fields values", () => {
    // @ts-expect-error - order should ony contain field
    expect(() => api.authors.browse({ input: { order: "foo ASC" } } as const)).toThrow();
    // valid
    expect(api.authors.browse({ input: { order: "name ASC" } } as const).getBrowseParams()).toStrictEqual({
      order: "name ASC",
    });
    expect(api.authors.browse({ input: { order: "name ASC,slug DESC" } } as const).getBrowseParams()).toStrictEqual({
      order: "name ASC,slug DESC",
    });
    expect(
      api.authors.browse({ input: { order: "name ASC,slug DESC,location ASC" } } as const).getBrowseParams()
    ).toStrictEqual({
      order: "name ASC,slug DESC,location ASC",
    });
    // @ts-expect-error - order should ony contain field (There is a typo in location)
    expect(() => api.authors.browse({ input: { order: "name ASC,slug DESC,locaton ASC" } } as const)).toThrow();
  });

  test(".browse() 'filter' params should ony accept valid field", () => {
    expect(() =>
      // @ts-expect-error - order should ony contain field
      api.authors.browse({
        input: { filter: "foo:bar" },
      } as const)
    ).toThrow();
    expect(
      api.authors
        .browse({
          input: { filter: "name:bar" },
        } as const)
        .getBrowseParams()
    ).toStrictEqual({
      filter: "name:bar",
    });
    expect(
      api.authors
        .browse({
          input: { filter: "name:bar+slug:-test" },
        } as const)
        .getBrowseParams()
    ).toStrictEqual({
      filter: "name:bar+slug:-test",
    });
  });

  test(".browse 'fields' argument should ony accept valid fields", () => {
    expect(
      api.authors
        .browse({
          output: {
            // @ts-expect-error - order should ony contain field
            fields: { foo: true },
          },
        } as const)
        .getOutputFields()
    ).toEqual([]);
    expect(
      api.authors
        .browse({
          output: {
            fields: { location: true },
          },
        } as const)
        .getOutputFields()
    ).toEqual(["location"]);
    expect(
      api.authors
        .browse({
          output: {
            fields: { name: true, website: true },
          },
        } as const)
        .getOutputFields()
    ).toEqual(["name", "website"]);
  });
});

describe("authors endpoint", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI("https://my-ghost-blog.com", "93fa6b1e07090ecdf686521b7e", "v5.0");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  test("New API", async () => {
    const api = ContentAPICredentialsSchema.parse({
      endpoint: BrowseEndpointType.authors,
      key: "93fa6b1e07090ecdf686521b7e",
      version: "v5.0",
      url: "https://my-ghost-blog.com",
    });
    const authors = new AuthorsAPI(
      {
        schema: AuthorSchema,
        output: AuthorSchema,
        include: authorsIncludeSchema,
      },
      api
    );
    expect(authors).not.toBeUndefined();
    const browseQuery = authors.browse({
      input: { page: 2 },
      output: {
        fields: {
          name: true,
          id: true,
        },
      },
    } as const);
    expect(browseQuery).not.toBeUndefined();
    expect(browseQuery.getBrowseParams()?.page).toBe(2);
    expect(browseQuery.getURL()?.searchParams.toString()).toBe(
      "key=93fa6b1e07090ecdf686521b7e&page=2&fields=name%2Cid"
    );

    const spy = vi.spyOn(browseQuery, "_fetch");
    // @ts-expect-error - mockResolvedValueOnce is expecting undefined because the class is abstract
    spy.mockImplementationOnce(() => {
      return {
        authors: [
          {
            name: "foo",
            id: "eaoizdjoa1321123",
          },
        ],
        meta: {
          pagination: {
            page: 1,
            limit: 15,
            pages: 1,
            total: 1,
            next: null,
            prev: null,
          },
        },
      };
    });
    const result = await browseQuery.fetch();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).not.toBeUndefined();
    if (result.status === "ok") {
      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe("foo");
      expect(result.data[0].id).toBe("eaoizdjoa1321123");
    }
  });
});

describe("authors endpoint .read()", () => {
  const api = new TSGhostContentAPI(url, key, "v5.0");
  test("should hae correct inputs", async () => {
    const result = api.authors.read({ input: { id: "1" }, output: { fields: { name: true } } }).fetch();
  });
});
