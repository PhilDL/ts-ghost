import type { Post, TSGhostContentAPI } from "@ts-ghost/content-api";

export const fetchAllBlogPosts = async (ghost: TSGhostContentAPI) => {
  const posts: Post[] = [];
  let currentPage = 1;
  let pages = 1;
  while (currentPage <= pages) {
    const res = await ghost.posts
      .browse({
        input: {
          page: currentPage,
        },
        output: {
          include: {
            authors: true,
            tags: true,
          },
        },
      })
      .fetch();
    if (res.status === "success") {
      posts.push(...(res.data || []));
      pages = res.meta.pagination.pages || 1;
    }
    currentPage++;
  }
  return posts;
};
