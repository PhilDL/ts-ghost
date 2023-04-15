import { faker } from "@faker-js/faker";
import { assert, beforeEach, describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";

const stubMember = {
  id: "64113de3e54f8b0001789b4e",
  uuid: "e7c335d0-649e-4bc4-891b-4ba2c906a871",
  name: "philippe",
  note: null,
  subscribed: true,
  created_at: "2023-03-15T03:39:15.000Z",
  updated_at: "2023-03-15T03:39:16.000Z",
  labels: [],
  subscriptions: [],
  avatar_image: "https://www.gravatar.com/avatar/c2baf8feb52fc654cc40c731207c677d?s=250&r=g&d=blank",
  comped: false,
  email_count: 0,
  email_opened_count: 0,
  email_open_rate: null,
  status: "free",
  last_seen_at: "2023-03-15T03:39:16.000Z",
  email_suppression: { suppressed: false, info: null },
  newsletters: [
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

describe("members integration tests browse", () => {
  let api: TSGhostAdminAPI;
  beforeEach(() => {
    const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
    const key =
      process.env.VITE_GHOST_ADMIN_API_KEY ||
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
    api = new TSGhostAdminAPI(url, key, "v5.0");
  });
  test("members.browse()", async () => {
    expect(api.members).toBeDefined();
    const result = await api.members
      .browse({
        limit: 1,
        order: "created_at ASC",
      })
      .fetch();

    assert(result.status === "success");
    const member = result.data[0];
    expect(member.id).toBe(stubMember.id);
    expect(member.name).toBe(stubMember.name);
    expect(member.status).toBe(stubMember.status);
    expect(member.created_at).toBe(stubMember.created_at);
    expect(member.updated_at).toBeDefined();
    expect(member.geolocation).toBeDefined();
    expect(member.email).toBeDefined();
    expect(member.subscribed).toBe(true);
    expect(member.note).toBe(null);
    expect(member.newsletters.length).toBe(1);
    expect(member.labels).toStrictEqual([]);
    expect(member.subscriptions).toStrictEqual([]);
    expect(member.avatar_image).toBe(
      "https://www.gravatar.com/avatar/c2baf8feb52fc654cc40c731207c677d?s=250&r=g&d=blank"
    );
    expect(member.comped).toBe(false);
    expect(member.email_count).toBe(0);
    expect(member.email_opened_count).toBe(0);
    expect(member.email_open_rate).toBe(null);
    expect(member.status).toBe("free");
    expect(member.last_seen_at).toBeDefined();
    expect(member.email_suppression).toStrictEqual({ suppressed: false, info: null });
  });

  test("members.read()", async () => {
    expect(api.members).toBeDefined();
    const result = await api.members
      .read({
        id: "64113de3e54f8b0001789b4e",
      })
      .fetch();
    assert(result.status === "success");
    const member = result.data;
    expect(member.id).toBe(stubMember.id);
    expect(member.name).toBe(stubMember.name);
    expect(member.status).toBe(stubMember.status);
    expect(member.created_at).toBe(stubMember.created_at);
    expect(member.updated_at).toBeDefined();
    expect(member.geolocation).toBeDefined();
    expect(member.email).toBeDefined();
    expect(member.subscribed).toBe(true);
    expect(member.note).toBe(null);
    expect(member.newsletters.length).toBe(1);
    expect(member.labels).toStrictEqual([]);
    expect(member.subscriptions).toStrictEqual([]);
    expect(member.avatar_image).toBe(
      "https://www.gravatar.com/avatar/c2baf8feb52fc654cc40c731207c677d?s=250&r=g&d=blank"
    );
    expect(member.comped).toBe(false);
    expect(member.email_count).toBe(0);
    expect(member.email_opened_count).toBe(0);
    expect(member.email_open_rate).toBe(null);
    expect(member.status).toBe("free");
    expect(member.last_seen_at).toBeDefined();
    expect(member.email_suppression).toStrictEqual({ suppressed: false, info: null });
  });

  // this test send emails because new signup
  test.skip("members mutations add, edit, delete", async () => {
    expect(api.members).toBeDefined();
    const email = faker.internet.email();
    const name = faker.name.fullName();

    const addOperation = await api.members.add({ email, name });
    assert(addOperation.status === "success");
    const newMember = addOperation.data;
    expect(newMember.id).toBeDefined();
    expect(newMember.name).toBe(name);
    expect(newMember.email).toBe(email);
    expect(newMember.status).toBe("free");
    expect(newMember.created_at).toBeDefined();
    expect(newMember.updated_at).toBeDefined();
    expect(newMember.comped).toBe(false);

    const editOperation = await api.members.edit(newMember.id, {
      note: "Hello from ts-ghost",
      labels: [{ name: "ts-ghost" }],
      geolocation: "Reunion",
    });
    assert(editOperation.status === "success");
    const editedMember = editOperation.data;
    expect(editedMember.id).toBe(newMember.id);
    expect(editedMember.name).toBe(name);
    expect(editedMember.email).toBe(email);
    expect(editedMember.status).toBe("free");
    expect(editedMember.note).toBe("Hello from ts-ghost");
    expect(editedMember.labels && editedMember.labels[0].name).toBe("ts-ghost");

    const deleteOperation = await api.members.delete(newMember.id);
    assert(deleteOperation.status === "success");
  });
});
