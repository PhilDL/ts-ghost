import { inject, test, type ProvidedContext } from "vitest";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { clientVersion } from "../ghost/pin.ts";
import { recordResponses, unknownKeysOfResponses, type ResponseRecorder } from "../unknown-keys.ts";
import { PENDING_KEYS } from "./pending-keys.ts";

type CredentialKind = "integration" | "staff";

/** Public admin-api client against the live Ghost, untracked; `ghost` defaults to the injected one (unset in global setup). */
export function adminApi(
  key: CredentialKind = "integration",
  ghost: Pick<ProvidedContext["ghost"], "url" | "integrationKey" | "staffToken"> = inject("ghost"),
) {
  const apiKey = key === "integration" ? ghost.integrationKey : ghost.staffToken;
  return new TSGhostAdminAPI(ghost.url, apiKey, clientVersion());
}

type LiveFixtures = {
  /** Unknown-key paths deliberately left unmodelled; set per describe with `liveTest.override({ ignore })`. */
  ignore: string[];
  /** This test's raw responses; on teardown, fails the test for parsed keys outside `ignore` and PENDING_KEYS. */
  responses: Pick<ResponseRecorder, "all" | "last" | "track">;
  /** Integration-key client whose parsed results the unknown-key check compares with the raw responses. */
  api: TSGhostAdminAPI;
};

/** What a live test's function receives. */
export type LiveContext = LiveFixtures;

/** A live test: every one records its responses and runs the unknown-key check, even without `responses`. */
export const liveTest = test.extend<LiveFixtures>({
  ignore: [],
  responses: [
    async ({ ignore }, use) => {
      const recorder = recordResponses();
      try {
        await use(recorder);
      } finally {
        recorder.restore();
      }
      const unknown = unknownKeysOfResponses(recorder.all(), [...ignore, ...PENDING_KEYS]);
      if (unknown.length)
        throw new Error(`Keys Ghost sent that the client's schema lacks:\n${unknown.join("\n")}`);
    },
    { auto: true },
  ],
  api: async ({ responses }, use) => {
    await use(responses.track(adminApi()));
  },
});
