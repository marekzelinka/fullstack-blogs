import { BlogCard } from "./blog-card.jsx";

const listStyles = { listStyle: "none", paddingLeft: 0, display: "grid", gap: 6 };

export function BlogList({ blogs, user, onLike, onDelete }) {
  const sortedBlogs = blogs.toSorted((blogA, blogB) => blogB.likes - blogA.likes);

  return (
    <ul role="list" style={listStyles}>
      {sortedBlogs.map((blog) => {
        const isOwner = blog.owner.username === user.username;

        return (
          <li key={blog.id}>
            <BlogCard
              blog={blog}
              isOwner={isOwner}
              onLike={() => onLike(blog.id)}
              onDelete={() => onDelete(blog.id)}
            />
          </li>
        );
      })}
    </ul>
  );
}
