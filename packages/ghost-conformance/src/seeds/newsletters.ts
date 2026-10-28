import { adminApi } from "../live/ghost.ts";
import { must } from "./seed-result.ts";
import { uniqueSuffix } from "./unique-suffix.ts";

/** Optional newsletter fields with a value; Ghost's default newsletter leaves the nullable ones null. */
export const fullNewsletterInput = (suffix: string) => ({
  name: `Seeded newsletter ${suffix}`,
  description: "A newsletter with its optional fields set.",
  sender_name: "Seeded Sender",
  sender_reply_to: "newsletter",
  subscribe_on_signup: false,
  header_image: "https://example.com/newsletter-header.png",
  show_header_icon: false,
  show_header_title: false,
  title_font_category: "sans_serif" as const,
  title_alignment: "left",
  show_feature_image: false,
  body_font_category: "sans_serif" as const,
  footer_content: "<p>Seeded footer</p>",
  show_badge: false,
  show_header_name: false,
});

/** Seeds an active newsletter with values and an archived one, next to Ghost's default newsletter. */
export async function seedNewsletters() {
  const api = adminApi();
  const suffix = uniqueSuffix();
  const full = must(await api.newsletters.add(fullNewsletterInput(suffix)), "full newsletter");
  const toArchive = must(
    await api.newsletters.add({ name: `Archived newsletter ${suffix}`, sender_name: "Archived Sender" }),
    "newsletter to archive",
  );
  const archived = must(
    await api.newsletters.edit(toArchive.id, { status: "archived" }),
    "archived newsletter",
  );
  return { full, archived };
}
