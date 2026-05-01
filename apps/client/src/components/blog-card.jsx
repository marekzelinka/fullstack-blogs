const cardStyles = { display: "flex", alignItems: "center", gap: 8 };

export function BlogCard({ blog }) {
  return (
    <div style={cardStyles}>
      <div>
        <span>{blog.title}</span> <span>by</span> <span>{blog.author}</span>
      </div>
    </div>
  );
}
