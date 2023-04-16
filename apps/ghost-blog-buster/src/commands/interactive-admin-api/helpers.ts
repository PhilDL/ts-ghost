import type { Member, Post, TSGhostAdminAPI } from "@ts-ghost/admin-api";

export const fetchAllBlogPosts = async (ghost: TSGhostAdminAPI) => {
  const posts: (Post & { html: string | null })[] = [];
  let cursor = await ghost.posts
    .browse({
      filter: "html:-null",
      order: "published_at DESC,updated_at DESC",
    })
    .formats({ html: true })
    .paginate();
  if (cursor.current.success) posts.push(...cursor.current.data);
  while (cursor.next) {
    cursor = await cursor.next.paginate();
    if (cursor.current.success) posts.push(...cursor.current.data);
  }
  return posts;
};

export const fetchAllMembers = async (ghost: TSGhostAdminAPI) => {
  const members: Member[] = [];
  let cursor = await ghost.members.browse().paginate();
  if (cursor.current.success) {
    members.push(...cursor.current.data);
  }
  while (cursor.next) {
    cursor = await cursor.next.paginate();
    if (cursor.current.success) {
      members.push(...cursor.current.data);
    }
  }
  return members;
};
