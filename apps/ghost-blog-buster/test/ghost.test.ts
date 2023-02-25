import { Ghost } from "../src/app/ghost";
import { describe, it, expect } from "vitest";

describe.skip("Ghost", () => {
  it.skip("should fetch blog posts", async () => {
    const ghost = new Ghost("https://myblog.com", "eazoidjoaizd939390ec3");
    const posts = await ghost.fetchBlogPosts();
    expect(posts).not.toBeUndefined();
  });
  it.skip("should fetch blog post", async () => {
    const ghost = new Ghost("https://myblog.com", "eazoidjoaizd939390ec3");
    const post = await ghost.fetchBlogPost("odoo-15-javascript-reference");
    expect(post).not.toBeUndefined();
    // console.log(post);
  });
});
