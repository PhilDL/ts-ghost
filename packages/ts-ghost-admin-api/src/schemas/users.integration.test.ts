import { describe, test, beforeEach, assert } from "vitest";
import { TSGhostAdminAPI } from "../admin-api";

const stubResult = {
  status: "success",
  meta: {
    pagination: { pages: 1, page: 1, limit: 2, total: 2, prev: null, next: null },
  },
  data: [
    {
      id: "1",
      name: "PhilDL",
      slug: "phildl",
      email: "philippe.lattention@hotmail.fr",
      profile_image: "https://www.gravatar.com/avatar/c2baf8feb52fc654cc40c731207c677d?s=250&r=x&d=mp",
      cover_image: null,
      bio: null,
      website: "https://github.com/PhilDL",
      location: null,
      facebook: null,
      twitter: null,
      accessibility: null,
      status: "active",
      meta_title: null,
      meta_description: null,
      tour: null,
      last_seen: "2023-03-23T18:25:24.000Z",
      comment_notifications: true,
      free_member_signup_notification: true,
      paid_subscription_started_notification: true,
      paid_subscription_canceled_notification: false,
      created_at: "2022-12-01T10:02:56.000Z",
      updated_at: "2023-03-23T18:25:24.000Z",
      mention_notifications: true,
      milestone_notifications: true,
      url: "https://astro-starter.digitalpress.blog/author/phildl/",
    },
  ],
};

describe("users integration tests browse", () => {
  let api: TSGhostAdminAPI;
  beforeEach(() => {
    const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
    const key =
      process.env.VITE_GHOST_ADMIN_API_KEY ||
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
    api = new TSGhostAdminAPI(url, key, "v5.0");
  });
  test("users.browse()", async () => {
    expect(api.users).toBeDefined();
    const result = await api.users
      .browse({
        input: { limit: 1 },
      })
      .fetch();

    assert(result.status === "success");
    const user = result.data[0];
    const stubUser = stubResult.data[0];
    expect(user.id).toBe(stubUser.id);
    expect(user.name).toBe(stubUser.name);
    expect(user.slug).toBe(stubUser.slug);
    expect(user.email).toBe(stubUser.email);
    expect(user.profile_image).toBe(stubUser.profile_image);
    expect(user.cover_image).toBe(stubUser.cover_image);
    expect(user.bio).toBe(stubUser.bio);
    expect(user.website).toBe(stubUser.website);
    expect(user.location).toBe(stubUser.location);
    expect(user.facebook).toBe(stubUser.facebook);
    expect(user.twitter).toBe(stubUser.twitter);
    expect(user.accessibility).toBe(stubUser.accessibility);
    expect(user.status).toBe(stubUser.status);
    expect(user.meta_title).toBe(stubUser.meta_title);
    expect(user.meta_description).toBe(stubUser.meta_description);
    expect(user.tour).toBe(stubUser.tour);
    expect(user.last_seen).toBe(stubUser.last_seen);
    expect(user.comment_notifications).toBe(stubUser.comment_notifications);
    expect(user.free_member_signup_notification).toBe(stubUser.free_member_signup_notification);
    expect(user.paid_subscription_started_notification).toBe(stubUser.paid_subscription_started_notification);
    expect(user.paid_subscription_canceled_notification).toBe(stubUser.paid_subscription_canceled_notification);
    expect(user.created_at).toBe(stubUser.created_at);
    expect(user.updated_at).toBeDefined();
  });

  test("users.read()", async () => {
    expect(api.users).toBeDefined();
    const result = await api.users
      .read({
        input: { id: "63887bd07f2cf30001fec7a2" },
      })
      .fetch();
    assert(result.status === "success");
    const user = result.data;
    const stubUser = stubResult.data[0];
    expect(user.id).toBe(stubUser.id);
    expect(user.name).toBe(stubUser.name);
    expect(user.slug).toBe(stubUser.slug);
    expect(user.email).toBe(stubUser.email);
    expect(user.profile_image).toBe(stubUser.profile_image);
    expect(user.cover_image).toBe(stubUser.cover_image);
    expect(user.bio).toBe(stubUser.bio);
    expect(user.website).toBe(stubUser.website);
    expect(user.location).toBe(stubUser.location);
    expect(user.facebook).toBe(stubUser.facebook);
    expect(user.twitter).toBe(stubUser.twitter);
    expect(user.accessibility).toBe(stubUser.accessibility);
    expect(user.status).toBe(stubUser.status);
    expect(user.meta_title).toBe(stubUser.meta_title);
    expect(user.meta_description).toBe(stubUser.meta_description);
    expect(user.tour).toBe(stubUser.tour);
    expect(user.last_seen).toBe(stubUser.last_seen);
    expect(user.comment_notifications).toBe(stubUser.comment_notifications);
    expect(user.free_member_signup_notification).toBe(stubUser.free_member_signup_notification);
    expect(user.paid_subscription_started_notification).toBe(stubUser.paid_subscription_started_notification);
    expect(user.paid_subscription_canceled_notification).toBe(stubUser.paid_subscription_canceled_notification);
    expect(user.created_at).toBe(stubUser.created_at);
    expect(user.updated_at).toBeDefined();
  });
});
