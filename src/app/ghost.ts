import type { GhostAPI } from "@tryghost/content-api";
import GhostContentAPI from "@tryghost/content-api";
import fetch from "node-fetch";
import { z } from "zod";

// page: 1, pages: 1, limit: 2, total: 2, prev: null, next: null
export const GhostMetaSchema = z.object({
  pagination: z.object({
    pages: z.number(),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    prev: z.number().nullable(),
    next: z.number().nullable(),
  }),
});
// Tier example
// "id": "622727ad96a190e914ab6664",
//             "name": "Free",
//             "description": null,
//             "slug": "free",
//             "active": true,
//             "type": "free",
//             "welcome_page_url": null,
//             "created_at": "2022-03-08T09:53:49.000Z",
//             "updated_at": "2022-03-08T10:43:15.000Z",
//             "stripe_prices": null,
//             "monthly_price": null,
//             "yearly_price": null,
//             "benefits": [],
//             "visibility": "public"
export const GhostFetchTiersSchema = z.object({
  meta: GhostMetaSchema,
  tiers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      slug: z.string(),
      active: z.boolean(),
      type: z.union([z.literal("free"), z.literal("paid")]),
      welcome_page_url: z.string().nullable(),
      created_at: z.string(),
      updated_at: z.string().nullable(),
      stripe_prices: z
        .array(z.number())
        .optional()
        .transform((v) => (v?.length ? v : [])),
      monthly_price: z
        .number()
        .nullable()
        .optional()
        .transform((v) => (v ? v : null)),
      yearly_price: z
        .number()
        .nullable()
        .optional()
        .transform((v) => (v ? v : null)),
      benefits: z.array(z.string()),
      visibility: z.union([z.literal("public"), z.literal("none")]),
    })
  ),
});

export class Ghost {
  api: GhostAPI;
  url: string;
  key: string;
  version: "v5.0" | "v2" | "v3" | "v4" | "canary";

  constructor(url: string, key: string, version: "v5.0" | "v2" | "v3" | "v4" | "canary" = "v5.0") {
    this.url = url;
    this.key = key;
    this.version = version;
    this.api = new GhostContentAPI({
      url,
      key,
      version,
    });
  }

  fetchBlogPosts = async (page = 1) => {
    const posts = await this.api.posts
      .browse({
        include: ["tags", "authors"],
        page,
      })
      .catch((err: Error) => {
        console.error(err.message);
      });
    return posts;
  };

  fetchAllBlogPosts = async () => {
    const posts = await this.api.posts
      .browse({
        include: ["tags", "authors"],
      })
      .catch((err: Error) => {
        console.error(err.message);
      });
    const pages = posts?.meta?.pagination?.pages || 1;
    if ((pages || 1) > 1) {
      for (let i = 2; i <= pages; i++) {
        const morePosts = await this.api.posts
          .browse({
            include: ["tags", "authors"],
            page: i,
          })
          .catch((err: Error) => {
            console.error(err.message);
          });
        posts?.push(...(morePosts || []));
      }
    }
    return posts;
  };

  fetchBlogPost = async (slug: string) => {
    const post = await this.api.posts
      .read(
        {
          slug: slug,
        },
        {
          include: ["tags", "authors"],
          formats: ["html", "plaintext"],
        }
      )
      .catch((err: Error) => {
        console.error(err.message);
      });
    return post;
  };

  fetchSettings = async () => {
    const settings = await this.api.settings.browse().catch((err) => {
      console.error(err.message);
    });
    return settings;
  };

  fetchAllTags = async () => {
    const tags = await this.api.tags
      .browse({
        limit: "all",
        fields: [
          "id",
          "name",
          "slug",
          "description",
          "feature_image",
          "visibility",
          "og_image",
          "og_title",
          "og_description",
          "twitter_image",
          "twitter_title",
          "twitter_description",
          "meta_title",
          "meta_description",
          "canonical_url",
          "accent_color",
          "url",
        ],
      })
      .catch((err) => {
        console.error(err.message);
      });
    return tags;
  };

  fetchAllTiers = async () => {
    const result = await (
      await fetch(`${this.url}/ghost/api/content/tiers/?key=${this.key}`, {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v5.0",
        },
      })
    ).json();
    const tiers = GhostFetchTiersSchema.parse(result);
    return tiers;
  };
}
