import type { Post, TSGhostContentAPI } from "@ts-ghost/content-api";

export const fetchAllBlogPosts = async (ghost: TSGhostContentAPI) => {
  const posts: Post[] = [];
  let cursor = await ghost.posts
    .browse()
    .include({
      authors: true,
      tags: true,
    })
    .paginate();
  if (cursor.current.status === "success") posts.push(...cursor.current.data);
  while (cursor.next) {
    cursor = await cursor.next.paginate();
    if (cursor.current.status === "success") posts.push(...cursor.current.data);
  }
  return posts;
};
