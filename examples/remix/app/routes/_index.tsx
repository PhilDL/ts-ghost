import { json, type LoaderArgs, type V2_MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";
import { TSGhostContentAPI } from "@ts-ghost/content-api";

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export async function loader({ request }: LoaderArgs) {
  const adminAPI = new TSGhostAdminAPI(
    process.env.GHOST_URL || "",
    process.env.GHOST_ADMIN_API_KEY || "",
    "v5.0"
  );
  const contentAPI = new TSGhostContentAPI(
    process.env.GHOST_URL || "",
    process.env.GHOST_CONTENT_API_KEY || "",
    "v5.0"
  );
  const [settings, posts] = await Promise.all([contentAPI.settings.fetch(), adminAPI.posts.browse().fetch()]);
  if(!settings.success) {
    throw new Error(settings.errors.join(", "));
  }
  if(!posts.success) {
    throw new Error(posts.errors.join(", "));
  }
  return json({ settings: settings.data, posts: posts.data });
}

export default function Index() {
  const { settings, posts } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>This is a list of posts for {settings.title}:</h1>
      <ul>
        {posts.map((post) => (
        <li key={post.slug}>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            {post.title}
          </a>
        </li>
        ))}
      </ul>
    </div>
  );
}
