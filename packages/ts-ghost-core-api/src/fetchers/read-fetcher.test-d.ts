import createFetchMock from "vitest-fetch-mock";
import { describe, expectTypeOf, test } from "vitest";
import { z } from "zod";

import { HTTPClient, HTTPClientOptions } from "../helpers/http-client";
import { ReadFetcher } from "./read-fetcher";

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
});

describe("ReadFetcher", () => {
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

  test("that ReadFetcher returns the correct types", async () => {
    const readFetcher = new ReadFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { id: "eh873jdLsnaUDj7149DSASJhdqsdj" },
        formats: ["html"],
      },
      httpClient,
    );
    fetchMocker.doMock(fixture);
    expectTypeOf(await readFetcher.fetch()).toEqualTypeOf<
      | {
          success: true;
          data: {
            title: string;
            slug: string;
            published?: boolean | undefined;
            includeMe?: number | undefined;
            html?: string | undefined;
          };
        }
      | {
          success: false;
          errors: {
            type: string;
            message: string;
          }[];
        }
    >();
    expectTypeOf(await readFetcher.fields({ title: true, html: true }).fetch()).toEqualTypeOf<
      | {
          success: true;
          data: {
            title: string;
            html?: string | undefined;
          };
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
      await readFetcher.fields({ title: true, html: true }).formats({ html: true }).fetch(),
    ).toEqualTypeOf<
      | {
          success: true;
          data: {
            title: string;
            html: string;
          };
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
