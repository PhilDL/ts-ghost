import { inject } from "vitest";

import { sessionRequest } from "./session.ts";

// Nothing listens here, so deliveries fail locally instead of leaving the machine.
export const WEBHOOK_TARGET = "http://127.0.0.1:9/ts-ghost-webhook";

type Integration = { id: string; name: string; webhooks?: Record<string, unknown>[] };

/**
 * The bootstrap's integration with its webhooks. The client has no webhook reads and Ghost only lists
 * them on the integration, which takes a session, so read-backs go through this.
 */
export async function conformanceIntegration(): Promise<
  Integration & { webhooks: Record<string, unknown>[] }
> {
  const { integrations } = await sessionRequest<{ integrations: Integration[] }>(
    inject("ghost"),
    "GET",
    "/integrations/?include=webhooks&limit=all",
  );
  const integration = integrations.find((i) => i.name === "ts-ghost conformance");
  if (!integration) throw new Error("The bootstrap's integration is missing");
  return { ...integration, webhooks: integration.webhooks ?? [] };
}
