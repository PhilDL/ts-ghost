import { Expect, Equal } from "../app/type-utils";
import { describe, test, expect } from "vitest";
import { TSGhostContentAPI } from "./ts-ghost-content-api";
import { parseBrowseParams, type BrowseOrder, type BrowseFilter } from "./browse-params";
import { AuthorSchema, PostSchema } from "../app/zod-schemas";
import { z } from "zod";

describe("Isolated Browse", () => {
  test("BrowseOrder", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type test = Expect<Equal<BrowseOrder<"authors ASC", z.infer<typeof PostSchema>>, "authors ASC">>;
  });
  test("BrowseFilter", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type test2 = Expect<Equal<BrowseFilter<"authors.slug:~test", z.infer<typeof PostSchema>>, "authors.slug:~test">>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type test3 = Expect<
      Equal<
        BrowseFilter<"authors.slug:~test+title:-toto", z.infer<typeof PostSchema>>,
        | "authors.slug:~test+title:-toto"
        | "authors.slug:~test,title:-toto"
        | "authors.slug:~test(title:-toto"
        | "authors.slug:~test)title:-toto"
      >
    >;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type test4 = Expect<Equal<BrowseFilter<"authors:~test", z.infer<typeof PostSchema>>, "authors:~test">>;
  });
});
describe("ContentApi.browse() Args Type-safety", () => {
  const api = new TSGhostContentAPI("https://my-ghost-blog.com", "93fa6b1e07090ecdf686521b7e", "v5.0");
  test(".browse() params shouldnt accept invalid params", () => {
    // @ts-expect-error - shouldnt accept invalid params
    api.authors.browse({ input: { pp: 2 } });
    expect(api.authors.browseParams).toStrictEqual({});
  });

  test(".browse() 'order' params should ony accept fields values", () => {
    // @ts-expect-error - order should ony contain field
    expect(() => api.authors.browse({ input: { order: "foo ASC" } } as const)).toThrow();
    // valid
    expect(api.authors.browse({ input: { order: "name ASC" } } as const).browseParams).toStrictEqual({
      order: "name ASC",
    });
    expect(api.authors.browse({ input: { order: "name ASC,slug DESC" } } as const).browseParams).toStrictEqual({
      order: "name ASC,slug DESC",
    });
    expect(
      api.posts.browse({ input: { order: "title ASC,slug DESC,authors ASC" } } as const).browseParams
    ).toStrictEqual({
      order: "title ASC,slug DESC,authors ASC",
    });
    // @ts-expect-error - order should ony contain field
    expect(() => api.posts.browse({ input: { order: "title ASC,slug DESC,authrs ASC" } } as const)).toThrow();
  });

  test(".browse() 'filter' params should ony accept valid field", () => {
    expect(() =>
      // @ts-expect-error - order should ony contain field
      api.authors.browse({
        input: { filter: "foo:bar" },
      } as const)
    ).toThrow();
    expect(
      api.authors.browse({
        input: { filter: "name:bar" },
      } as const).browseParams
    ).toStrictEqual({
      filter: "name:bar",
    });
    expect(
      api.authors.browse({
        input: { filter: "name:bar+slug:-test" },
      } as const).browseParams
    ).toStrictEqual({
      filter: "name:bar+slug:-test",
    });
    expect(api.posts.browse({ input: { filter: "authors:bar" } } as const).browseParams).toStrictEqual({
      filter: "authors:bar",
    });
    expect(api.posts.browse({ input: { filter: "authors.slug:bar" } } as const).browseParams).toStrictEqual({
      filter: "authors.slug:bar",
    });
    expect(api.posts.browse({ input: { filter: "authors.slug:bar,title:foo" } } as const).browseParams).toStrictEqual({
      filter: "authors.slug:bar,title:foo",
    });

    expect(() =>
      // @ts-expect-error - order should ony contain field
      api.posts.browse({
        input: { filter: "author.slug:bar" },
      } as const)
    ).toThrow();
    expect(() =>
      // @ts-expect-error - order should ony contain field
      api.posts.browse({
        input: { filter: "title:foo+author.slug:bar" },
      } as const)
    ).toThrow();
  });

  test(".browse 'fields' argument should ony accept valid fields", () => {
    expect(
      api.authors.browse({
        output: {
          // @ts-expect-error - order should ony contain field
          fields: { foo: true },
        },
      } as const).outputFields
    ).toEqual([]);
    expect(
      api.posts.browse({
        output: {
          fields: { title: true },
        },
      } as const).outputFields
    ).toEqual(["title"]);
    expect(
      api.authors.browse({
        output: {
          fields: { name: true, website: true },
        },
      } as const).outputFields
    ).toEqual(["name", "website"]);
  });
});
describe("parseBrowseArgs()", () => {
  test("'order' should accept valid fields and throw on unknown fields", () => {
    expect(() => parseBrowseParams({ order: "foo ASC" }, AuthorSchema)).toThrowError(Error);
    expect(parseBrowseParams({ order: "website ASC,name DESC" }, AuthorSchema)).toStrictEqual({
      order: "website ASC,name DESC",
    });
  });
  test("'filter' should accept valid filter and throw on unknown fields", () => {
    expect(() => parseBrowseParams({ filter: "foo:-bar" }, AuthorSchema)).toThrowError(Error);
    expect(parseBrowseParams({ filter: "website:bar" }, AuthorSchema)).toStrictEqual({
      filter: "website:bar",
    });
    expect(() => parseBrowseParams({ filter: "unknownkeys:bar+name:baz" }, AuthorSchema)).toThrow();
    expect(parseBrowseParams({ filter: "website:bar+name:baz" }, AuthorSchema)).toStrictEqual({
      filter: "website:bar+name:baz",
    });
  });
  test("'filter' should accept dotted notation", () => {
    expect(parseBrowseParams({ filter: "authors.slug:bar" }, PostSchema)).toStrictEqual({
      filter: "authors.slug:bar",
    });
  });
  test("'filter' should throw on unknown field dotted notation", () => {
    expect(() => parseBrowseParams({ filter: "authorss.slug:bar" }, PostSchema)).toThrow();
  });
});
