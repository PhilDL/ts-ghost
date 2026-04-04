import createFetchMock from "vitest-fetch-mock";
import { describe, expectTypeOf, test } from "vitest";
import { z } from "zod";

import { HTTPClient, type HTTPClientOptions } from "../helpers/http-client";
import { BrowseFetcher } from "./browse-fetcher";

const fetchMocker = createFetchMock(vi);

const fixture = JSON.stringify({
  posts: [
    {
      title: "title",
      slug: "this-is-a-slug-test",
      count: {
        posts: 1,
      },
      html: "html",
      plaintext: "plaintext",
      published: true,
    },
  ],
  meta: {
    pagination: {
      pages: 1,
      page: 1,
      limit: 15,
      total: 1,
      prev: null,
      next: null,
    },
  },
});

describe("BrowseFetcher type narrowing", () => {
  const credentials: HTTPClientOptions = {
    url: "https://ghost.org",
    key: "1234",
    version: "v6.0",
    endpoint: "content",
  };
  let httpClient: HTTPClient;

  const simplifiedSchema = z.object({
    title: z.string(),
    slug: z.string(),
    published: z.boolean().optional(),
    count: z
      .object({
        posts: z.number(),
      })
      .optional(),
    html: z.string().optional(),
    plaintext: z.string().optional(),
    mobiledoc: z.string().optional(),
  });

  const simplifiedIncludeSchema = z.object({
    count: z.literal(true).optional(),
    "count.posts": z.literal(true).optional(),
  });

  beforeEach(() => {
    httpClient = new HTTPClient(credentials);
    fetchMocker.enableMocks();
  });

  afterEach(() => {
    fetchMocker.resetMocks();
    vi.restoreAllMocks();
  });

  test("keeps narrowing through include, dot-notation include, fields and formats", async () => {
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        browseParams: {},
        formats: ["html"],
      },
      httpClient,
    );

    fetchMocker.doMock(fixture);

    expectTypeOf(await browseFetcher.fetch()).toEqualTypeOf<
      | {
          success: true;
          meta: {
            pagination: {
              pages: number;
              page: number;
              limit: number | "all";
              total: number;
              prev: number | null;
              next: number | null;
            };
          };
          data: {
            title: string;
            slug: string;
            published?: boolean | undefined;
            count?:
              | {
                  posts: number;
                }
              | undefined;
            html?: string | undefined;
            plaintext?: string | undefined;
            mobiledoc?: string | undefined;
          }[];
        }
      | {
          success: false;
          errors: {
            type: string;
            message: string;
          }[];
          status: number;
        }
    >();

    expectTypeOf(await browseFetcher.include({ count: true }).fetch()).toEqualTypeOf<
      | {
          success: true;
          meta: {
            pagination: {
              pages: number;
              page: number;
              limit: number | "all";
              total: number;
              prev: number | null;
              next: number | null;
            };
          };
          data: {
            title: string;
            slug: string;
            published?: boolean | undefined;
            count: {
              posts: number;
            };
            html?: string | undefined;
            plaintext?: string | undefined;
            mobiledoc?: string | undefined;
          }[];
        }
      | {
          success: false;
          errors: {
            type: string;
            message: string;
          }[];
          status: number;
        }
    >();

    expectTypeOf(await browseFetcher.include({ count: true, "count.posts": true }).fetch()).toEqualTypeOf<
      | {
          success: true;
          meta: {
            pagination: {
              pages: number;
              page: number;
              limit: number | "all";
              total: number;
              prev: number | null;
              next: number | null;
            };
          };
          data: {
            title: string;
            slug: string;
            published?: boolean | undefined;
            count: {
              posts: number;
            };
            html?: string | undefined;
            plaintext?: string | undefined;
            mobiledoc?: string | undefined;
          }[];
        }
      | {
          success: false;
          errors: {
            type: string;
            message: string;
          }[];
          status: number;
        }
    >();

    expectTypeOf(await browseFetcher.include({ "count.posts": true }).fetch()).toEqualTypeOf<
      | {
          success: true;
          meta: {
            pagination: {
              pages: number;
              page: number;
              limit: number | "all";
              total: number;
              prev: number | null;
              next: number | null;
            };
          };
          data: {
            title: string;
            slug: string;
            published?: boolean | undefined;
            count?:
              | {
                  posts: number;
                }
              | undefined;
            html?: string | undefined;
            plaintext?: string | undefined;
            mobiledoc?: string | undefined;
          }[];
        }
      | {
          success: false;
          errors: {
            type: string;
            message: string;
          }[];
          status: number;
        }
    >();

    expectTypeOf(await browseFetcher.formats({ html: true, plaintext: true }).fetch()).toEqualTypeOf<
      | {
          success: true;
          meta: {
            pagination: {
              pages: number;
              page: number;
              limit: number | "all";
              total: number;
              prev: number | null;
              next: number | null;
            };
          };
          data: {
            title: string;
            slug: string;
            published?: boolean | undefined;
            count?:
              | {
                  posts: number;
                }
              | undefined;
            html: string;
            plaintext: string;
            mobiledoc?: string | undefined;
          }[];
        }
      | {
          success: false;
          errors: {
            type: string;
            message: string;
          }[];
          status: number;
        }
    >();

    expectTypeOf(
      await browseFetcher
        .include({ count: true, "count.posts": true })
        .fields({ title: true, html: true, count: true })
        .formats({ html: true })
        .fetch(),
    ).toEqualTypeOf<
      | {
          success: true;
          meta: {
            pagination: {
              pages: number;
              page: number;
              limit: number | "all";
              total: number;
              prev: number | null;
              next: number | null;
            };
          };
          data: {
            title: string;
            count: {
              posts: number;
            };
            html: string;
          }[];
        }
      | {
          success: false;
          errors: {
            type: string;
            message: string;
          }[];
          status: number;
        }
    >();
  });
});
