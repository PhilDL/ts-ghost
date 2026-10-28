// Unknown keys awaiting a client schema fix (Ghost 6.72). Each resource's "carries no key the client's
// schema lacks" test.fails owns its keys; drop them here when that test turns green.

const USER = [
  "bluesky",
  "donation_notifications",
  "gift_subscription_notifications",
  "instagram",
  "linkedin",
  "mastodon",
  "recommendation_notifications",
  "threads",
  "tiktok",
  "youtube",
];
const AUTHOR = [...USER, "tour"];
const NEWSLETTER = [
  "background_color",
  "button_color",
  "button_corners",
  "button_style",
  "divider_color",
  "feedback_enabled",
  "header_background_color",
  "image_corners",
  "link_color",
  "link_style",
  "post_title_color",
  "section_title_color",
  "show_comment_cta",
  "show_excerpt",
  "show_latest_posts",
  "show_post_title_section",
  "show_share_button",
  "show_subscription_details",
  "title_font_weight",
];
const EMAIL = [
  "csd_email_count",
  "feedback_enabled",
  "newsletter_id",
  "post_id",
  "source_type",
  "track_clicks",
];
const MEMBER = [
  "attribution",
  "can_comment",
  "commenting",
  "current_subscription",
  "enable_comment_notifications",
  "enable_updates_and_announcements",
  "tiers",
  "unsubscribe_url",
  "uuid",
];
const SUBSCRIPTION = [
  "attribution",
  "discount_end",
  "discount_start",
  "next_payment",
  "offer.created_at",
  "offer.last_redeemed",
  "offer.redemption_type",
  "offer_redemptions",
  "plan",
  "price.tier",
  "tier.expiry_at",
  "tier.monthly_price_id",
  "tier.yearly_price_id",
  "trial_end_at",
  "trial_start_at",
];
const OFFER = ["created_at", "last_redeemed", "redemption_type"];
const SITE = [
  "accent_color",
  "allow_external_signup",
  "cover_image",
  "icon",
  "locale",
  "site_uuid",
  "timezone",
];

const authored = (resource: string) =>
  AUTHOR.flatMap((k) => [`${resource}[].authors[].${k}`, `${resource}[].primary_author.${k}`]);

export const PENDING_KEYS: string[] = [
  ...authored("posts"),
  ...EMAIL.map((k) => `posts[].email.${k}`),
  ...NEWSLETTER.map((k) => `posts[].newsletter.${k}`),
  ...authored("pages"),
  "pages[].show_title_and_feature_image",
  ...NEWSLETTER.map((k) => `newsletters[].${k}`),
  ...MEMBER.map((k) => `members[].${k}`),
  ...SUBSCRIPTION.map((k) => `members[].subscriptions[].${k}`),
  ...OFFER.map((k) => `offers[].${k}`),
  ...SITE.map((k) => `site.${k}`),
  ...USER.map((k) => `users[].${k}`),
];
