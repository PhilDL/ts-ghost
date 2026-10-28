import { inject } from "vitest";

import { ghostId, insert, mysqlExec, raw } from "./sql.ts";
import { uniqueSuffix } from "./unique-suffix.ts";

/** Profile fields the seeded staff user has set; the Owner and the suspended user leave them null. */
export const STAFF_PROFILE = {
  profile_image: "https://example.com/staff-profile.png",
  cover_image: "https://example.com/staff-cover.png",
  bio: "Seeded staff bio",
  website: "https://example.com",
  location: "Berlin",
  facebook: "seededstaff",
  twitter: "@seededstaff",
  accessibility: '{"nightShift":true}',
  meta_title: "Staff meta title",
  meta_description: "Staff meta description",
};

/** Social profiles the client doesn't model yet; seeded so they're set as well as null. */
const UNMODELLED_SOCIALS = {
  threads: "@seededstaff",
  bluesky: "seededstaff.bsky.social",
  mastodon: "@seededstaff@mastodon.social",
  tiktok: "@seededstaff",
  youtube: "@seededstaff",
  instagram: "seededstaff",
  linkedin: "seededstaff",
};

/** Ghost stores the admin onboarding tour as a JSON string. */
export const TOUR = '["getting-started"]';

/** The API can't create staff users (invites need email), so this is SQL: full, toured and suspended. */
export async function seedUsers() {
  const suffix = uniqueSuffix();
  const user = (kind: string) => ({
    id: ghostId(),
    email: `${kind}-${suffix}@conformance.test`,
    slug: `${kind}-${suffix}`,
  });
  const [staff, suspended, toured] = [user("staff"), user("suspended"), user("toured")];
  const row = (u: typeof staff, name: string, status: string) => ({
    id: u.id,
    name: `${name} ${suffix}`,
    slug: u.slug,
    password: "x",
    email: u.email,
    status,
    created_at: raw("NOW()"),
  });
  const contributor = raw("(SELECT id FROM roles WHERE name = 'Contributor')");
  await mysqlExec(inject("ghost").composeProject, [
    insert("users", [
      {
        ...row(staff, "Seeded Staff", "active"),
        last_seen: raw("NOW()"),
        updated_at: raw("NOW()"),
        ...STAFF_PROFILE,
        ...UNMODELLED_SOCIALS,
      },
    ]),
    insert("users", [row(suspended, "Suspended", "inactive")]),
    insert("users", [{ ...row(toured, "Toured", "active"), tour: TOUR }]),
    insert(
      "roles_users",
      [staff, suspended, toured].map((u) => ({ id: ghostId(), role_id: contributor, user_id: u.id })),
    ),
  ]);
  return { staff, suspended, toured };
}
