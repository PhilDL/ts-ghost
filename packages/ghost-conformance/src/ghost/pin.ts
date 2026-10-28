import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Path of the one file that pins the Ghost version (image tag, client version, manifest, drift job). */
export const GHOST_VERSION_FILE = fileURLToPath(new URL("../../ghost-version", import.meta.url));

export function ghostVersion(): string {
  const version = readFileSync(GHOST_VERSION_FILE, "utf8").trim();
  if (!/^\d+\.\d+\.\d+$/.test(version))
    throw new Error(`Invalid Ghost pin "${version}" in ${GHOST_VERSION_FILE}`);
  return version;
}

/** Version string the admin-api client sends, e.g. "v6.72" for Ghost 6.72.0. */
export function clientVersion(version = ghostVersion()): `v6.${string}` {
  const [major, minor] = version.split(".");
  if (major !== "6") throw new Error(`The client's version type only covers Ghost 6, got ${version}`);
  return `v6.${minor}`;
}
