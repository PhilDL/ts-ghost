import { adminApi } from "../live/ghost.ts";
import { must } from "./seed-result.ts";
import { uniqueSuffix } from "./unique-suffix.ts";

/** Every optional tag field with a value; the bare tag leaves them all null. */
export const fullTagInput = (suffix: string) => ({
  name: `Seeded full tag ${suffix}`,
  slug: `seeded-full-tag-${suffix}`,
  description: "A tag with every optional field set.",
  feature_image: "https://example.com/tag-feature.png",
  visibility: "public" as const,
  meta_title: "Tag meta title",
  meta_description: "Tag meta description",
  og_image: "https://example.com/tag-og.png",
  og_title: "Tag OG title",
  og_description: "Tag OG description",
  twitter_image: "https://example.com/tag-twitter.png",
  twitter_title: "Tag Twitter title",
  twitter_description: "Tag Twitter description",
  codeinjection_head: "<style>.tag-head{}</style>",
  codeinjection_foot: "<script>void 0</script>",
  canonical_url: "https://example.com/canonical-tag",
  accent_color: "#ff0000",
});

/** Seeds a full and a bare tag, each on two published posts of its own, so post counts are real. */
export async function seedTags() {
  const api = adminApi();
  const suffix = uniqueSuffix();
  const full = must(await api.tags.add(fullTagInput(suffix)), "full tag");
  const bare = must(await api.tags.add({ name: `Seeded bare tag ${suffix}` }), "bare tag");
  for (const tag of [full, bare]) {
    for (const n of [1, 2]) {
      must(
        await api.posts.add({ title: `${tag.name} post ${n}`, status: "published", tags: [{ id: tag.id }] }),
        "tagged post",
      );
    }
  }
  return { full, bare, postsPerTag: 2 };
}
