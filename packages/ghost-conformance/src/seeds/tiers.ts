import type { ProvidedContext } from "vitest";

import { sessionRequest } from "./session.ts";
import { uniqueSuffix } from "./unique-suffix.ts";

type Tier = { id: string; slug: string };

/**
 * Seeds paid tiers over the session, since the client has no tier writes: one with every field set
 * and then edited, one never edited (nullable fields null) and one archived.
 */
export async function seedTiers(ghost: ProvidedContext["ghost"]) {
  const suffix = uniqueSuffix();
  const tier = async (method: "POST" | "PUT", path: string, body: object) =>
    (await sessionRequest<{ tiers: Tier[] }>(ghost, method, path, { tiers: [body] })).tiers[0]!;
  const prices = { currency: "usd", monthly_price: 700, yearly_price: 7000 };

  const full = await tier("POST", "/tiers/", {
    name: `Full tier ${suffix}`,
    description: "A tier with every field set",
    welcome_page_url: "https://example.com/welcome",
    visibility: "public",
    benefits: ["First benefit", "Second benefit"],
    trial_days: 7,
    ...prices,
  });
  const editedName = `Full tier ${suffix}, edited`;
  await tier("PUT", `/tiers/${full.id}/`, { name: editedName });
  const bare = await tier("POST", "/tiers/", { name: `Bare tier ${suffix}`, ...prices });
  const archived = await tier("POST", "/tiers/", { name: `Archived tier ${suffix}`, ...prices });
  await tier("PUT", `/tiers/${archived.id}/`, { active: false });

  const defaults = await sessionRequest<{ tiers: Tier[] }>(
    ghost,
    "GET",
    "/tiers/?filter=slug:default-product",
  );
  return { full: { ...full, editedName }, bare, archived, defaultTierId: defaults.tiers[0]!.id };
}
