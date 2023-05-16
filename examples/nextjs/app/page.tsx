import { TSGhostContentAPI } from "@ts-ghost/content-api";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

async function getBlogPosts() {
  const api = new TSGhostAdminAPI(
    process.env.GHOST_URL || "",
    process.env.GHOST_ADMIN_API_KEY || "",
    "v5.0"
  );
  const response = await api.posts.browse().fields({title: true, slug:true, id:true}).fetch();
  if(!response.success) {
    throw new Error(response.errors.join(", "));
  }
  return response.data;
}

async function getSiteSettings() {
  const api = new TSGhostContentAPI(
    process.env.GHOST_URL || "",
    process.env.GHOST_CONTENT_API_KEY || "",
    "v5.0"
  );
  const response = await api.settings.fetch();
  if(!response.success) {
    throw new Error(response.errors.join(", "));
  }
  return response.data;
}

export default async function HomePage() {
  const [posts, settings] = await Promise.all([getBlogPosts(), getSiteSettings()])
  return <div>
    <h1>This is a list of posts for {settings.title}:</h1>
    <ul>
      {(posts).map(post => <li key={post.id}>{post.title} ({post.slug})</li>)}
    </ul>
    
  </div>;
}
