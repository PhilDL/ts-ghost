import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { ghostVersion } from "./pin.ts";

const run = promisify(execFile);
const COMPOSE_FILE = fileURLToPath(new URL("../../docker/compose.yaml", import.meta.url));

export type GhostInstance = {
  url: string;
  project: string;
  version: string;
  stop(): Promise<void>;
  /** Runs `docker compose <args>` against this instance's project. */
  compose(...args: string[]): Promise<{ stdout: string; stderr: string }>;
};

/**
 * Starts a fresh official Ghost + MySQL 8 under its own compose project and waits until Ghost answers.
 * Every call gets a new project, so the live suite and a throwaway manifest instance never share state.
 */
export async function startGhost(opts: { name: string; version?: string }): Promise<GhostInstance> {
  const version = opts.version ?? ghostVersion();
  const project = `${opts.name}-${randomBytes(4).toString("hex")}`;
  const port = await freePort();
  const env = { ...process.env, GHOST_VERSION: version, GHOST_PORT: String(port) };
  const compose = (...args: string[]) =>
    run("docker", ["compose", "-p", project, "-f", COMPOSE_FILE, ...args], {
      env,
      maxBuffer: 64 * 1024 * 1024,
    });

  const stop = async () => {
    await compose("down", "--volumes", "--remove-orphans", "--timeout", "5");
  };
  try {
    await compose("up", "--detach", "--wait", "--wait-timeout", "300");
  } catch (error) {
    const logs = await compose("logs", "--no-color", "--tail", "80").catch(() => ({ stdout: "" }));
    await stop().catch(() => undefined);
    throw new Error(`Ghost ${version} did not become healthy (project ${project}):\n${logs.stdout}`, {
      cause: error,
    });
  }
  return { url: `http://localhost:${port}`, project, version, stop, compose };
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => (typeof address === "object" && address ? resolve(address.port) : reject()));
    });
  });
}
