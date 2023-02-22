import { Ghost } from "../src/app/ghost";
import { describe, it, expect } from "vitest";

const ghost = new Ghost("https://myblog.com", "eazoidjoaizd939390ec3");

describe.skip("fetchBlogPosts", () => {
  it("should fetch blog posts", async () => {
    const posts = await ghost.fetchBlogPosts();
    expect(posts).not.toBeUndefined();
  });
});

describe.skip("fetchBlogPost", () => {
  it("should fetch blog post", async () => {
    const post = await ghost.fetchBlogPost("odoo-15-javascript-reference");
    expect(post).not.toBeUndefined();
    // console.log(post);
  });
});
