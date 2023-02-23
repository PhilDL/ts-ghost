import { z, ZodRawShape, ZodObject } from "zod";
import { Object, Any } from "ts-toolbelt";

// export type Endpoints = "tiers" | "posts" | "tags" | "settings" | "pages" | "authors";

export const GhostIdentificationSchema = z.object({
  slug: z.string(),
  id: z.string(),
});

export const GhostMetadataSchema = z.object({
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
});

export const GhostExcerptSchema = z.object({
  excerpt: z.string().optional(),
  custom_excerpt: z.string().optional(),
});

export const GhostCodeInjectionSchema = z.object({
  codeinjection_head: z.string().nullable(),
  codeinjection_foot: z.string().nullable(),
});

export const GhostFacebookSchema = z.object({
  og_image: z.string().nullable(),
  og_title: z.string().nullable(),
  og_description: z.string().nullable(),
});

export const GhostTwitterSchema = z.object({
  twitter_image: z.string().nullable(),
  twitter_title: z.string().nullable(),
  twitter_description: z.string().nullable(),
});

export const GhostSocialMediaSchema = z.object({
  ...GhostFacebookSchema.shape,
  ...GhostTwitterSchema.shape,
});

export const GhostVisibilitySchema = z.union([z.literal("public"), z.literal("members"), z.literal("none")]);
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

export const TierSchema = z.object({
  ...GhostIdentificationSchema.shape,
  name: z.string(),
  description: z.string().nullable(),
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
  visibility: GhostVisibilitySchema,
});
export const GhostFetchTiersSchema = z.object({
  meta: GhostMetaSchema,
  tiers: z.array(TierSchema),
});

export const TagSchema = z.object({
  ...GhostIdentificationSchema.shape,
  ...GhostMetadataSchema.shape,
  ...GhostCodeInjectionSchema.shape,
  ...GhostSocialMediaSchema.shape,
  name: z.string(),
  description: z.string().nullable(),
  feature_image: z.string().nullable(),
  visibility: GhostVisibilitySchema,
  canonical_url: z.string().nullable(),
  accent_color: z.string().nullable(),
  url: z.string(),
});

// Authors
// "slug": "cameron",
// "id": "5ddc9b9510d8970038255d02",
// "name": "Cameron Almeida",
// "profile_image": "https://docs.ghost.io/content/images/2019/03/1c2f492a-a5d0-4d2d-b350-cdcdebc7e413.jpg",
// "cover_image": null,
// "bio": "Editor at large.",
// "website": "https://example.com",
// "location": "Cape Town",
// "facebook": "example",
// "twitter": "@example",
// "meta_title": null,
// "meta_description": null,
// "url": "https://docs.ghost.io/author/cameron/"

export const AuthorSchema = z.object({
  ...GhostIdentificationSchema.shape,
  ...GhostMetadataSchema.shape,
  name: z.string(),
  profile_image: z.string().nullable(),
  cover_image: z.string().nullable(),
  bio: z.string().nullable(),
  website: z.string().nullable(),
  location: z.string().nullable(),
  facebook: z.string().nullable(),
  twitter: z.string().nullable(),
  url: z.string(),
});

export const GhostFetchAuthorsSchema = z.object({
  meta: GhostMetaSchema,
  authors: z.array(AuthorSchema),
});

// Post
// {
//   "slug": "welcome-short",
//   "id": "5c7ece47da174000c0c5c6d7",
//   "uuid": "3a033ce7-9e2d-4b3b-a9ef-76887efacc7f",
//   "title": "Welcome",
//   "html": "<p>👋 Welcome, it's great to have you here.</p>",
//   "comment_id": "5c7ece47da174000c0c5c6d7",
//   "feature_image": "https://casper.ghost.org/v2.0.0/images/welcome-to-ghost.jpg",
//   "feature_image_alt": null,
//   "feature_image_caption": null,
//   "featured": false,
//   "meta_title": null,
//   "meta_description": null,
//   "created_at": "2019-03-05T19:30:15.000+00:00",
//   "updated_at": "2019-03-26T19:45:31.000+00:00",
//   "published_at": "2012-11-27T15:30:00.000+00:00",
//   "custom_excerpt": "Welcome, it's great to have you here.",
//   "codeinjection_head": null,
//   "codeinjection_foot": null,
//   "og_image": null,
//   "og_title": null,
//   "og_description": null,
//   "twitter_image": null,
//   "twitter_title": null,
//   "twitter_description": null,
//   "custom_template": null,
//   "canonical_url": null,
//   "authors": [
//       {
//           "id": "5951f5fca366002ebd5dbef7",
//           "name": "Ghost",
//           "slug": "ghost",
//           "profile_image": "https://demo.ghost.io/content/images/2017/07/ghost-icon.png",
//           "cover_image": null,
//           "bio": "The professional publishing platform",
//           "website": "https://ghost.org",
//           "location": null,
//           "facebook": "ghost",
//           "twitter": "@tryghost",
//           "meta_title": null,
//           "meta_description": null,
//           "url": "https://demo.ghost.io/author/ghost/"
//       }
//   ],
//   "tags": [
//       {
//           "id": "59799bbd6ebb2f00243a33db",
//           "name": "Getting Started",
//           "slug": "getting-started",
//           "description": null,
//           "feature_image": null,
//           "visibility": "public",
//           "meta_title": null,
//           "meta_description": null,
//           "url": "https://demo.ghost.io/tag/getting-started/"
//       }
//   ],
//   "primary_author": {
//       "id": "5951f5fca366002ebd5dbef7",
//       "name": "Ghost",
//       "slug": "ghost",
//       "profile_image": "https://demo.ghost.io/content/images/2017/07/ghost-icon.png",
//       "cover_image": null,
//       "bio": "The professional publishing platform",
//       "website": "https://ghost.org",
//       "location": null,
//       "facebook": "ghost",
//       "twitter": "@tryghost",
//       "meta_title": null,
//       "meta_description": null,
//       "url": "https://demo.ghost.io/author/ghost/"
//   },
//   "primary_tag": {
//       "id": "59799bbd6ebb2f00243a33db",
//       "name": "Getting Started",
//       "slug": "getting-started",
//       "description": null,
//       "feature_image": null,
//       "visibility": "public",
//       "meta_title": null,
//       "meta_description": null,
//       "url": "https://demo.ghost.io/tag/getting-started/"
//   },
//   "url": "https://demo.ghost.io/welcome-short/",
//   "excerpt": "Welcome, it's great to have you here."
// }

export const PostSchema = z.object({
  ...GhostIdentificationSchema.shape,
  ...GhostMetadataSchema.shape,
  title: z.string(),
  html: z.string(),
  comment_id: z.string().nullable(),
  feature_image: z.string().nullable(),
  feature_image_alt: z.string().nullable(),
  feature_image_caption: z.string().nullable(),
  featured: z.boolean(),
  custom_excerpt: z.string().nullable(),
  ...GhostCodeInjectionSchema.shape,
  ...GhostSocialMediaSchema.shape,
  custom_template: z.string().nullable(),
  canonical_url: z.string().nullable(),
  authors: z.array(AuthorSchema).nullable(),
  tags: z.array(TagSchema).nullable(),
  primary_author: AuthorSchema,
  primary_tag: TagSchema.nullable(),
  url: z.string(),
  excerpt: z.string(),
});

export const PageSchema = z.object({
  ...GhostIdentificationSchema.shape,
  ...GhostMetadataSchema.shape,
  title: z.string(),
  html: z.string(),
  comment_id: z.string().nullable(),
  feature_image: z.string().nullable(),
  feature_image_alt: z.string().nullable(),
  feature_image_caption: z.string().nullable(),
  featured: z.boolean(),
  custom_excerpt: z.string().nullable(),
  ...GhostCodeInjectionSchema.shape,
  ...GhostSocialMediaSchema.shape,
  custom_template: z.string().nullable(),
  canonical_url: z.string().nullable(),
  authors: z.array(AuthorSchema).nullable(),
  tags: z.array(TagSchema).nullable(),
  primary_author: AuthorSchema,
  primary_tag: TagSchema.nullable(),
  url: z.string(),
  excerpt: z.string(),
});

const SchemaMap = {
  posts: PostSchema,
  pages: PageSchema,
  authors: AuthorSchema,
  tags: TagSchema,
  tiers: TierSchema,
} as const;

export type Schemap = {
  [K in keyof typeof SchemaMap]: z.infer<(typeof SchemaMap)[K]>;
};
export type Endpoints = keyof Schemap;

export type FieldsFromEndpoint<S extends keyof Schemap, F> = F extends (keyof Schemap[S])[] ? F : never;

export function filterSchema<Shape extends ZodRawShape, Mask extends { [K in keyof Shape]?: true }>(
  baseSchema: ZodObject<Shape>,
  keysSubsetObject: z.noUnrecognized<Mask, Shape>
) {
  return baseSchema.pick(keysSubsetObject);
}

export type Post = z.infer<typeof PostSchema>;

export type Page = z.infer<typeof PageSchema>;

export type Author = z.infer<typeof AuthorSchema>;

export type Tag = z.infer<typeof TagSchema>;

export type Tier = z.infer<typeof TierSchema>;
