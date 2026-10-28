import type { RouteDefinition } from "./ghost-router.ts";

export const CREDENTIALS = ["integration", "staff", "session"] as const;
export type Credential = (typeof CREDENTIALS)[number];
/** "timeout": Ghost never answered (e.g. GET /config/featurebase hangs when featurebase is unconfigured). */
export type ProbeResponse = { status: number | "timeout" };
export type ProbeResponses = Record<Credential | "none", ProbeResponse>;
export type RouteAccess = { public: boolean } & Record<Credential, boolean>;

// Auth middleware answers a refusal at once, so a request left unanswered got past it.
const refused = ({ status }: ProbeResponse) => status === 401 || status === 403;

/**
 * Accepted means "got past Ghost's auth middleware": a body-less request with ids that don't exist can fail
 * validation (422) or lookup (404) before role permissions run, so role refusals may be masked.
 */
export function classifyRoute(route: RouteDefinition, responses: ProbeResponses): RouteAccess {
  // No auth middleware: credentials can't matter, so a 401/403 comes from the missing body or Ghost's state.
  if (route.guard === "none") return { public: true, integration: true, staff: true, session: true };

  for (const [credential, response] of Object.entries(responses)) {
    // 3xx (non-canonical URL), 429 (rate limit) and 503 (Ghost not ready) say nothing about auth.
    const { status } = response;
    if (typeof status === "number" && ((status >= 300 && status < 400) || status === 429 || status === 503))
      throw new Error(`${route.method} ${route.path}: ${credential} probe got ${response.status}`);
  }
  // Guarded routes refuse anonymous requests; anything else means the probe didn't hit the route it meant to.
  if (!refused(responses.none))
    throw new Error(
      `${route.method} ${route.path}: guarded route answered an anonymous probe with ${responses.none.status}`,
    );
  return {
    public: false,
    integration: !refused(responses.integration),
    staff: !refused(responses.staff),
    session: !refused(responses.session),
  };
}
