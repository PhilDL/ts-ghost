import { randomUUID } from "node:crypto";

import { must } from "./seed-result.ts";
import { ghostId, insert, literal, raw, type SqlSeed, type SqlSeedContext } from "./sql.ts";

/** What the email seed creates; tests look it up by these slugs and emails. */
export const EMAIL_SEED = {
  posts: { failed: "conformance-email-failed", submitted: "conformance-email-submitted" },
  members: {
    /** Received both emails; not suppressed. */
    recipient: "email-recipient@conformance.test",
    /** Suppressed after a spam complaint on the submitted email. */
    spam: "suppressed-spam@conformance.test",
    /** Suppressed after a bounce, with no email recorded. */
    bounced: "suppressed-bounce@conformance.test",
  },
  label: "Email recipients",
  from: "Conformance <noreply@conformance.test>",
  replyTo: "reply@conformance.test",
} as const;

const LEXICAL = JSON.stringify({
  root: { type: "root", version: 1, children: [{ type: "paragraph", version: 1, children: [] }] },
});

/** Sent and failed emails, their batches, recipients and failures, and suppressions. */
export const emailSeed: SqlSeed = {
  name: "emails",
  tables: {
    emails: "Ghost writes an email only while sending a post through Mailgun.",
    email_batches: "Sending bookkeeping; email_recipients rows need a batch.",
    email_recipients: "Written per member while Ghost sends an email.",
    email_recipient_failures: "Written from Mailgun failure events.",
    suppressions: "Written from Mailgun bounce and spam-complaint events.",
    posts: "Only `newsletter_id`, which Ghost sets only when it sends the post.",
  },
  async run({ admin, exec }: SqlSeedContext) {
    const [failedPost, submittedPost] = await Promise.all(
      Object.values(EMAIL_SEED.posts).map(async (slug) =>
        must(await admin.posts.add({ title: slug, slug, status: "published" }), "email seed"),
      ),
    );
    // Sequential: concurrent creates that share a new label race on inserting it.
    const recipient = must(
      await admin.members.add({
        email: EMAIL_SEED.members.recipient,
        name: "Email Recipient",
        labels: [{ name: EMAIL_SEED.label }],
        subscribed: true,
      }),
      "email seed",
    );
    const spam = must(
      await admin.members.add({ email: EMAIL_SEED.members.spam, labels: [{ name: EMAIL_SEED.label }] }),
      "email seed",
    );
    const bounced = must(
      await admin.members.add({ email: EMAIL_SEED.members.bounced, name: "Bounced Member" }),
      "email seed",
    );

    const t = (minutes: number) => new Date(Date.UTC(2026, 0, 1, 12, minutes));
    const failedEmail = ghostId();
    const sentEmail = ghostId();
    const [failedBatch, sentBatch] = [ghostId(), ghostId()];
    const [r1, r2, r3] = [ghostId(), ghostId(), ghostId()];
    const recipientRow = ({
      id,
      email,
      batch,
      member,
      name = null,
      at = {},
    }: {
      id: string;
      email: string;
      batch: string;
      member: { id: string; email: string };
      name?: string | null;
      at?: { processed?: Date; delivered?: Date; opened?: Date; failed?: Date };
    }) => ({
      id,
      email_id: email,
      member_id: member.id,
      batch_id: batch,
      processed_at: at.processed ?? null,
      delivered_at: at.delivered ?? null,
      opened_at: at.opened ?? null,
      failed_at: at.failed ?? null,
      // The client's member schema drops `uuid`, so read it in SQL.
      member_uuid: raw(`(SELECT uuid FROM members WHERE id = ${literal(member.id)})`),
      member_email: member.email,
      member_name: name,
    });

    await exec([
      "SET @newsletter = (SELECT id FROM newsletters ORDER BY sort_order LIMIT 1);",
      `UPDATE posts SET newsletter_id = @newsletter WHERE id = ${literal(submittedPost.id)};`,
      insert("emails", [
        // A failed email as older Ghost versions stored it: no from, reply_to or source.
        {
          id: failedEmail,
          post_id: failedPost.id,
          uuid: randomUUID(),
          status: "failed",
          recipient_filter: "all",
          error: "Mailgun is not configured",
          error_data: JSON.stringify([{ id: failedBatch, error: { status: 500 } }]),
          email_count: 2,
          delivered_count: 0,
          opened_count: 0,
          failed_count: 1,
          subject: failedPost.title,
          from: null,
          reply_to: null,
          html: null,
          plaintext: null,
          source: null,
          source_type: "html",
          track_opens: false,
          submitted_at: t(0),
          newsletter_id: null,
          created_at: t(0),
          updated_at: null,
        },
        {
          id: sentEmail,
          post_id: submittedPost.id,
          uuid: randomUUID(),
          status: "submitted",
          recipient_filter: "status:free",
          error: null,
          error_data: null,
          email_count: 1,
          delivered_count: 1,
          opened_count: 1,
          failed_count: 0,
          subject: submittedPost.title,
          from: EMAIL_SEED.from,
          reply_to: EMAIL_SEED.replyTo,
          html: "<p>Hello</p>",
          plaintext: "Hello",
          source: LEXICAL,
          source_type: "lexical",
          track_opens: true,
          submitted_at: t(10),
          newsletter_id: raw("@newsletter"),
          created_at: t(10),
          updated_at: t(11),
        },
      ]),
      insert("email_batches", [
        { id: failedBatch, email_id: failedEmail, status: "failed", created_at: t(0), updated_at: t(1) },
        { id: sentBatch, email_id: sentEmail, status: "submitted", created_at: t(10), updated_at: t(11) },
      ]),
      insert("email_recipients", [
        recipientRow({ id: r1, email: failedEmail, batch: failedBatch, member: recipient }),
        recipientRow({
          id: r2,
          email: sentEmail,
          batch: sentBatch,
          member: recipient,
          name: "Email Recipient",
          at: { processed: t(10), delivered: t(11), opened: t(12) },
        }),
        recipientRow({
          id: r3,
          email: failedEmail,
          batch: failedBatch,
          member: bounced,
          name: "Bounced Member",
          at: { processed: t(0), failed: t(1) },
        }),
      ]),
      insert("email_recipient_failures", [
        {
          id: ghostId(),
          email_id: failedEmail,
          member_id: bounced.id,
          email_recipient_id: r3,
          code: 550,
          enhanced_code: "5.1.1",
          message: "mailbox does not exist",
          severity: "permanent",
          failed_at: t(1),
          event_id: "conformance-event-1",
        },
        {
          id: ghostId(),
          email_id: failedEmail,
          member_id: null,
          email_recipient_id: r1,
          code: 421,
          enhanced_code: null,
          message: "try again later",
          severity: "temporary",
          failed_at: t(1),
          event_id: null,
        },
      ]),
      insert("suppressions", [
        { id: ghostId(), email: spam.email, email_id: sentEmail, reason: "spam", created_at: t(20) },
        { id: ghostId(), email: bounced.email, email_id: null, reason: "bounce", created_at: t(2) },
      ]),
    ]);
  },
};
