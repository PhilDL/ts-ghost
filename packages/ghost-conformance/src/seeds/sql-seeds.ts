import { adminApi } from "../live/ghost.ts";
import { emailSeed } from "./emails.ts";
import { mysqlExec, type SqlSeed } from "./sql.ts";
import { stripeSeed } from "./stripe.ts";

/** Every SQL seed; each is independent of the others. Add new ones here. */
export const SQL_SEEDS: SqlSeed[] = [emailSeed, stripeSeed];

/** Applies every SQL seed to a bootstrapped Ghost, after the bootstrap. */
export async function applySqlSeeds(ghost: {
  project: string;
  url: string;
  integrationKey: string;
  staffToken: string;
}) {
  const admin = adminApi("integration", ghost);
  const exec = (statements: string[]) => mysqlExec(ghost.project, statements);
  await Promise.all(
    SQL_SEEDS.map((seed) =>
      seed.run({ admin, exec }).catch((error: unknown) => {
        throw new Error(`SQL seed "${seed.name}" failed`, { cause: error });
      }),
    ),
  );
}
