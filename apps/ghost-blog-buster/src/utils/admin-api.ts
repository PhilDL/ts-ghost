import { TSGhostAdminAPI, type Member } from "@ts-ghost/admin-api";

export const fetchAllMembers = async (ghost: TSGhostAdminAPI) => {
  const members: Member[] = [];
  let cursor = await ghost.members.browse().paginate();
  if (cursor.current.status === "success") {
    members.push(...cursor.current.data);
  }
  while (cursor.next) {
    cursor = await cursor.next.paginate();
    if (cursor.current.status === "success") {
      members.push(...cursor.current.data);
    }
  }
  return members;
};
