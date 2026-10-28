import type { ProvidedContext } from "vitest";

import { adminApi } from "../live/ghost.ts";
import { must } from "./seed-result.ts";
import { sessionRequest } from "./session.ts";

/** Members the member suite seeds; looked up by email. */
export const MEMBER_SEED = {
  /** Free, with a label and the default newsletter. */
  plain: "member-plain@conformance.test",
  /** Comped onto the paid tier (Ghost's stand-in subscription). */
  comped: "member-comped@conformance.test",
  /** Free, with a custom metafield value. */
  metafields: "member-metafields@conformance.test",
  label: "Conformance members",
  metafield: { namespace: "custom", key: "company", value: "Acme" },
} as const;

/** Seeds MEMBER_SEED through the client; metafields go over raw HTTP since the client has no route for them. */
export async function seedMembers(ghost: ProvidedContext["ghost"]) {
  const admin = adminApi();
  const tiers = await admin.tiers.browse({ filter: "type:paid" }).fetch();
  if (!tiers.success || !tiers.data[0]) throw new Error("Member seed: no paid tier");
  const paidTier = tiers.data[0];

  const session = (method: string, path: string, body: unknown) =>
    sessionRequest<{ members?: { id: string }[] }>(ghost, method, path, body);

  // Sequential: concurrent creates that share a new label race on inserting it.
  const plain = must(
    await admin.members.add({
      email: MEMBER_SEED.plain,
      name: "Plain Member",
      note: "seeded",
      labels: [{ name: MEMBER_SEED.label }],
      subscribed: true,
    }),
    "member seed",
  );
  // Raw: the client can't parse the comped member it would get back (stand-in subscription).
  const comped = (
    await session("POST", "/members/", {
      members: [
        { email: MEMBER_SEED.comped, labels: [{ name: MEMBER_SEED.label }], tiers: [{ id: paidTier.id }] },
      ],
    })
  ).members![0]!;
  const withMetafields = must(await admin.members.add({ email: MEMBER_SEED.metafields }), "member seed");

  // Member metafields are behind the `membersCustomFields` labs flag, which only staff can switch on.
  const { namespace, key, value } = MEMBER_SEED.metafield;
  await session("PUT", "/settings/", { settings: [{ key: "labs", value: '{"membersCustomFields":true}' }] });
  await session("POST", `/members/metafields/${namespace}`, {
    members_metafields: [{ key, type: "short_text", name: "Company" }],
  });
  await session("PUT", `/members/${withMetafields.id}/`, {
    members: [{ metafields: { [namespace]: { [key]: value } } }],
  });

  return { plain, comped, withMetafields, paidTier };
}
