import type { GhostAPI } from "@tryghost/content-api";
import GhostContentAPI from "@tryghost/content-api";

// url: "https://codingdodo.com",
//     key: "eb5378f191161d77c939390ec3",
//     version: "v5.0",
export class Ghost {
  api: GhostAPI;

  constructor(url: string, key: string, version: "v5.0" | "v2" | "v3" | "v4" | "canary" = "v5.0") {
    this.api = new GhostContentAPI({
      url,
      key,
      version,
    });
  }

  fetchBlogPosts = async (page = 1) => {
    const posts = await this.api.posts
      .browse({
        include: ["tags", "authors"],
        page,
      })
      .catch((err: Error) => {
        console.error(err.message);
      });
    console.log("meta", posts?.meta?.pagination);
    return posts;
  };

  fetchAllBlogPosts = async () => {
    const posts = await this.api.posts
      .browse({
        include: ["tags", "authors"],
      })
      .catch((err: Error) => {
        console.error(err.message);
      });
    const pages = posts?.meta?.pagination?.pages || 1;
    if ((pages || 1) > 1) {
      for (let i = 2; i <= pages; i++) {
        const morePosts = await this.api.posts
          .browse({
            include: ["tags", "authors"],
            page: i,
          })
          .catch((err: Error) => {
            console.error(err.message);
          });
        posts?.push(...(morePosts || []));
      }
    }
    return posts;
  };

  fetchBlogPost = async (slug: string) => {
    const post = await this.api.posts
      .read(
        {
          slug: slug,
        },
        {
          include: ["tags", "authors"],
          formats: ["html", "plaintext"],
        }
      )
      .catch((err: Error) => {
        console.error(err.message);
      });
    return post;
  };

  fetchSettings = async () => {
    const settings = await this.api.settings.browse().catch((err) => {
      console.error(err.message);
    });
    return settings;
  };
}
