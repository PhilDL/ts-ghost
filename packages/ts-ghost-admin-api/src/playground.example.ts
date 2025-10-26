/**
 * This is a playground file for testing the API
 * it is not included in the build or package.
 *
 * To use it you will have to rename it to playground.ts
 * and add your own credentials.
 *
 * Then run with:
 * pnpm --filter=@ts-ghost/admin-api playground
 *
 * The entry is already in package.json
 */

import { TSGhostAdminAPI } from "./admin-api";

const api = new TSGhostAdminAPI(
  "https://astro-starter.digitalpress.blog",
  "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
  "v6.0",
);

// Example usage
const users = async () => {
  const users = await api.users
    .read({
      id: "1",
    })
    .fetch();
  console.log("users", users);
};

users();
