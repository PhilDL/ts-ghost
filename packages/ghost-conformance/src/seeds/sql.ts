import { execFile, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { promisify } from "node:util";
import type { TSGhostAdminAPI } from "@ts-ghost/admin-api";

/**
 * A seed for data the Admin API can't create. It may create its own parent rows through the client,
 * then writes only the tables it lists, in one transaction. Seeds must not depend on each other.
 */
export type SqlSeed = {
  name: string;
  /** Tables the seed writes, each with the reason the API can't write it. */
  tables: Record<string, string>;
  run(ctx: SqlSeedContext): Promise<void>;
};

export type SqlSeedContext = {
  /** The public client, authenticated with the integration key. */
  admin: TSGhostAdminAPI;
  /** Runs the statements in one transaction against Ghost's MySQL. */
  exec(statements: string[]): Promise<void>;
};

type Raw = { readonly raw: string };
export type SqlValue = string | number | boolean | null | Date | Raw;

/** A verbatim SQL expression, e.g. a variable or subquery. */
export const raw = (expression: string): Raw => ({ raw: expression });

/** A new id in Ghost's format (24-hex ObjectId). */
export const ghostId = () => randomBytes(12).toString("hex");

export function insert(table: string, rows: Record<string, SqlValue>[]): string {
  const columns = Object.keys(rows[0] ?? {});
  if (rows.some((row) => Object.keys(row).join() !== columns.join()))
    throw new Error(`insert into ${table}: every row needs the same columns in the same order`);
  const values = rows.map((row) => `(${columns.map((c) => literal(row[c] ?? null)).join(", ")})`);
  return `INSERT INTO \`${table}\` (${columns.map((c) => `\`${c}\``).join(", ")}) VALUES ${values.join(", ")};`;
}

/** One value as a SQL literal, for statements `insert` doesn't cover. */
export function literal(value: SqlValue): string {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace("T", " ")}'`;
  if (typeof value === "object") return value.raw;
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}

const run = promisify(execFile);

/** Runs SQL through the `mysql` CLI inside the compose project's MySQL container. */
export async function mysqlExec(project: string, statements: string[]): Promise<void> {
  const { stdout } = await run("docker", [
    "ps",
    "--quiet",
    "--filter",
    `label=com.docker.compose.project=${project}`,
    "--filter",
    "label=com.docker.compose.service=mysql",
  ]);
  const container = stdout.trim().split("\n")[0];
  if (!container) throw new Error(`No MySQL container in compose project ${project}`);

  const sql = ["START TRANSACTION;", ...statements, "COMMIT;"].join("\n");
  // Credentials and database name match docker/compose.yaml.
  const child = spawn("docker", ["exec", "-i", container, "mysql", "-uroot", "-pconformance", "ghost"]);
  let stderr = "";
  child.stderr.on("data", (chunk) => (stderr += chunk));
  child.stdin.end(sql);
  const code = await new Promise<number | null>((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });
  if (code !== 0) throw new Error(`MySQL seed failed (exit ${code}): ${stderr.trim()}`);
}
