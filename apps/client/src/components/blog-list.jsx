import { BlogCard } from "./blog-card.jsx";

export function BlogList({ blogs, user, onLike, onDelete }) {
  const sortedBlogs = blogs.toSorted((blogA, blogB) => blogB.likes - blogA.likes);

  return (
    <ul role="list" style={{ listStyle: "none", paddingLeft: 0, display: "grid", gap: 6 }}>
      {sortedBlogs.map((blog) => {
        const isOwner = blog.owner.username === user.username;

        return (
          <li key={blog.id}>
            <BlogCard blog={blog} isOwner={isOwner} onLike={onLike} onDelete={onDelete} />
          </li>
        );
      })}
    </ul>
  );
}
