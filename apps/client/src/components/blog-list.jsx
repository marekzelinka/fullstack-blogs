import { BlogCard } from "./blog-card.jsx";

const listStyles = { listStyle: "none", paddingLeft: 0, display: "grid", gap: 6 };

export function BlogList({ blogs }) {
  return (
    <ul role="list" style={listStyles}>
      {blogs.map((blog) => (
        <li key={blog.id}>
          <BlogCard blog={blog} />
        </li>
      ))}
    </ul>
  );
}
