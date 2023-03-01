import type { Post, TSGhostContentAPI } from "@ts-ghost/content-api";

export const fetchAllBlogPosts = async (ghost: TSGhostContentAPI) => {
  const posts: Post[] = [];
  let query = ghost.posts.browse({
    output: {
      include: {
        authors: true,
        tags: true,
      },
    },
  });
  let cursor: typeof query | undefined = query;
  while (cursor) {
    let result = await cursor.paginate();
    if (result.current.status === "success") posts.push(...result.current.data);
    cursor = result.next;
  }
  return posts;
};
