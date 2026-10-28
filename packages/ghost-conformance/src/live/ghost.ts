import { afterEach, beforeEach, inject, type ProvidedContext } from "vitest";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { clientVersion } from "../ghost/pin.ts";
import {
  recordResponses,
  trackParsed,
  unknownKeysOfResponses,
  type ResponseRecorder,
} from "../unknown-keys.ts";
import { PENDING_KEYS } from "./pending-keys.ts";

/** Public admin-api client against the live Ghost; `ghost` defaults to the injected one (unset in global setup). */
export function adminApi(
  key: "integration" | "staff" = "integration",
  ghost: Pick<ProvidedContext["ghost"], "url" | "integrationKey" | "staffToken"> = inject("ghost"),
) {
  const apiKey = key === "integration" ? ghost.integrationKey : ghost.staffToken;
  return trackParsed(new TSGhostAdminAPI(ghost.url, apiKey, clientVersion()));
}

/**
 * Records raw responses for each test in the calling `describe`, and fails a test whose parsed responses
 * carry keys neither in `ignore` (deliberately unmodelled) nor in PENDING_KEYS.
 */
export function liveResponses(keys: { ignore?: string[] } = {}): Pick<ResponseRecorder, "all" | "last"> {
  let current: ResponseRecorder | undefined;
  beforeEach(() => {
    current = recordResponses();
  });
  afterEach(() => {
    const recorder = current;
    recorder?.restore();
    const unknown = unknownKeysOfResponses(recorder?.all() ?? [], [...(keys.ignore ?? []), ...PENDING_KEYS]);
    if (unknown.length)
      throw new Error(`Keys Ghost sent that the client's schema lacks:\n${unknown.join("\n")}`);
  });
  const active = () => {
    if (!current) throw new Error("liveResponses() is only usable inside a test");
    return current;
  };
  return { all: () => active().all(), last: (pathPart) => active().last(pathPart) };
}
