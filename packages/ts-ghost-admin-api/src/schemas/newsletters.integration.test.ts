import { describe, test, beforeEach, assert, expect } from "vitest";
import { TSGhostAdminAPI } from "../admin-api";

const stubResult = {
  status: "success",
  meta: {
    pagination: { pages: 1, page: 1, limit: 2, total: 2, prev: null, next: null },
  },
  data: [
    {
      id: "63887bd07f2cf30001fec7a4",
      uuid: "15493024-f52f-416d-b7f6-8a77551a4a71",
      name: "Astro Starter",
      description: null,
      feedback_enabled: false,
      slug: "default-newsletter",
      sender_name: null,
      sender_email: null,
      sender_reply_to: "newsletter",
      status: "active",
      visibility: "members",
      subscribe_on_signup: true,
      sort_order: 0,
      header_image: null,
      show_header_icon: true,
      show_header_title: true,
      title_font_category: "sans_serif",
      title_alignment: "center",
      show_feature_image: true,
      body_font_category: "sans_serif",
      footer_content: null,
      show_badge: true,
      show_header_name: false,
      created_at: "2022-12-01T10:02:56.000Z",
      updated_at: "2022-12-01T10:03:27.000Z",
    },
  ],
};

describe("newsletters integration tests browse", () => {
  let api: TSGhostAdminAPI;
  beforeEach(() => {
    const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
    const key =
      process.env.VITE_GHOST_ADMIN_API_KEY ||
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
    api = new TSGhostAdminAPI(url, key, "v5.0");
  });
  test("newsletters.browse()", async () => {
    expect(api.newsletters).toBeDefined();
    const result = await api.newsletters
      .browse({
        limit: 1,
      })
      .fetch();

    assert(result.status === "success");
    const newsletter = result.data[0];
    const stubNewsletter = stubResult.data[0];
    expect(newsletter.id).toBe(stubNewsletter.id);
    expect(newsletter.name).toBe(stubNewsletter.name);
    expect(newsletter.description).toBe(stubNewsletter.description);
    expect(newsletter.slug).toBe(stubNewsletter.slug);
    expect(newsletter.sender_name).toBe(stubNewsletter.sender_name);
    expect(newsletter.sender_email).toBe(stubNewsletter.sender_email);
    expect(newsletter.sender_reply_to).toBe(stubNewsletter.sender_reply_to);
    expect(newsletter.status).toBe(stubNewsletter.status);
    expect(newsletter.visibility).toBe(stubNewsletter.visibility);
    expect(newsletter.subscribe_on_signup).toBe(stubNewsletter.subscribe_on_signup);
    expect(newsletter.sort_order).toBe(stubNewsletter.sort_order);
    expect(newsletter.header_image).toBe(stubNewsletter.header_image);
    expect(newsletter.show_header_icon).toBe(stubNewsletter.show_header_icon);
    expect(newsletter.show_header_title).toBe(stubNewsletter.show_header_title);
    expect(newsletter.title_font_category).toBe(stubNewsletter.title_font_category);
    expect(newsletter.title_alignment).toBe(stubNewsletter.title_alignment);
    expect(newsletter.show_feature_image).toBe(stubNewsletter.show_feature_image);
    expect(newsletter.body_font_category).toBe(stubNewsletter.body_font_category);
    expect(newsletter.footer_content).toBe(stubNewsletter.footer_content);
    expect(newsletter.show_badge).toBe(stubNewsletter.show_badge);
    expect(newsletter.show_header_name).toBe(stubNewsletter.show_header_name);
    expect(newsletter.created_at).toBe(stubNewsletter.created_at);
    expect(newsletter.updated_at).toBeDefined();
  });

  test("newsletters.read()", async () => {
    expect(api.newsletters).toBeDefined();
    const result = await api.newsletters
      .read({
        id: "63887bd07f2cf30001fec7a4",
      })
      .fetch();
    assert(result.status === "success");
    const newsletter = result.data;
    const stubNewsletter = stubResult.data[0];
    expect(newsletter.id).toBe(stubNewsletter.id);
    expect(newsletter.name).toBe(stubNewsletter.name);
    expect(newsletter.description).toBe(stubNewsletter.description);
    expect(newsletter.slug).toBe(stubNewsletter.slug);
    expect(newsletter.sender_name).toBe(stubNewsletter.sender_name);
    expect(newsletter.sender_email).toBe(stubNewsletter.sender_email);
    expect(newsletter.sender_reply_to).toBe(stubNewsletter.sender_reply_to);
    expect(newsletter.status).toBe(stubNewsletter.status);
    expect(newsletter.visibility).toBe(stubNewsletter.visibility);
    expect(newsletter.subscribe_on_signup).toBe(stubNewsletter.subscribe_on_signup);
    expect(newsletter.sort_order).toBe(stubNewsletter.sort_order);
    expect(newsletter.header_image).toBe(stubNewsletter.header_image);
    expect(newsletter.show_header_icon).toBe(stubNewsletter.show_header_icon);
    expect(newsletter.show_header_title).toBe(stubNewsletter.show_header_title);
    expect(newsletter.title_font_category).toBe(stubNewsletter.title_font_category);
    expect(newsletter.title_alignment).toBe(stubNewsletter.title_alignment);
    expect(newsletter.show_feature_image).toBe(stubNewsletter.show_feature_image);
    expect(newsletter.body_font_category).toBe(stubNewsletter.body_font_category);
    expect(newsletter.footer_content).toBe(stubNewsletter.footer_content);
    expect(newsletter.show_badge).toBe(stubNewsletter.show_badge);
    expect(newsletter.show_header_name).toBe(stubNewsletter.show_header_name);
    expect(newsletter.created_at).toBe(stubNewsletter.created_at);
    expect(newsletter.updated_at).toBeDefined();
  });
});
