import { inject, type ProvidedContext } from "vitest";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { clientVersion } from "../ghost/pin.ts";

type CredentialKind = "integration" | "staff";

/** Public admin-api client against the live Ghost, untracked; `ghost` defaults to the injected one (unset in global setup). */
export function adminApi(
  key: CredentialKind = "integration",
  ghost: Pick<ProvidedContext["ghost"], "url" | "integrationKey" | "staffToken"> = inject("ghost"),
) {
  const apiKey = key === "integration" ? ghost.integrationKey : ghost.staffToken;
  return new TSGhostAdminAPI(ghost.url, apiKey, clientVersion());
}
