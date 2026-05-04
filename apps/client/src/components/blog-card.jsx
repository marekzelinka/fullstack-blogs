import { useId } from "react";
import { useReducer } from "react";

const getShowWhenVisibleStyles = (visible) => ({ display: visible ? undefined : "none" });

const cardStyles = {
  paddingBlock: 10,
  paddingInline: 5,
  border: "solid",
  borderWidth: 1,
  borderRadius: 4,
};
const inlineRowStyles = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

export function BlogCard({ blog, isOwner, onLike, onDelete }) {
  const [visible, toggleVisibility] = useReducer((state) => !state, false);

  const contentId = useId();

  return (
    <div style={cardStyles}>
      <div style={inlineRowStyles}>
        <span>{blog.title}</span> <span>by</span> <span>{blog.author}</span>{" "}
        <button
          type="button"
          onClick={toggleVisibility}
          aria-expanded={visible}
          aria-controls={contentId}
        >
          {visible ? "Hide" : "View"}
        </button>
      </div>
      <div id={contentId} style={getShowWhenVisibleStyles(visible)}>
        <div>{blog.url}</div>
        <div style={inlineRowStyles}>
          <span>
            {blog.likes} {`like${blog.likes === 1 ? "" : "s"}`}
          </span>{" "}
          <button type="button" onClick={onLike}>
            Like
          </button>
        </div>
        <div>{blog.owner.name ?? blog.owner.username}</div>
        {isOwner ? (
          <button
            type="button"
            onClick={() => {
              const shouldDelete = confirm(`Remove blog "${blog.title}" by "${blog.author}"?`);
              if (shouldDelete) {
                onDelete();
              }
            }}
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
