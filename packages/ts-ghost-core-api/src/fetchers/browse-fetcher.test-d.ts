import createFetchMock from "vitest-fetch-mock";
import { describe, expectTypeOf, test } from "vitest";
import { z } from "zod";

import { HTTPClient, HTTPClientOptions } from "../helpers/http-client";
import { BrowseFetcher } from "./browse-fetcher";

const fetchMocker = createFetchMock(vi);

const fixture = JSON.stringify({
  posts: [
    {
      title: "title",
      slug: "this-is-a-slug-test",
      includeMe: 1,
      html: "html",
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

describe("BrowseFetcher", () => {
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
    includeMe: z.number().optional(),
    html: z.string().optional(),
  });

  const simplifiedIncludeSchema = z.object({
    includeMe: z.literal(true).optional(),
  });

  beforeEach(() => {
    httpClient = new HTTPClient(credentials);
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    fetchMocker.resetMocks();
    vi.restoreAllMocks();
  });

  test("that BrowseFetcher returns the correct types", async () => {
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
            includeMe?: number | undefined;
            html?: string | undefined;
          }[];
        }
      | {
          success: false;
          errors: {
            type: string;
            message: string;
          }[];
        }
    >();
    expectTypeOf(await browseFetcher.fields({ title: true, html: true }).fetch()).toEqualTypeOf<
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
            html?: string | undefined;
          }[];
        }
      | {
          success: false;
          errors: {
            type: string;
            message: string;
          }[];
        }
    >();

    expectTypeOf(
      await browseFetcher.fields({ title: true, html: true }).formats({ html: true }).fetch(),
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
            html: string;
          }[];
        }
      | {
          success: false;
          errors: {
            type: string;
            message: string;
          }[];
        }
    >();
  });
});
