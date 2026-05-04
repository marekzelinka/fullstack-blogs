import { useId } from "react";

const fieldStyles = { display: "flex", gap: 8, marginBottom: 6 };

export function AddBlogForm({ onSubmit }) {
  const formId = useId();

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);

        const result = await onSubmit({
          title: formData.get("title"),
          author: formData.get("author"),
          url: formData.get("url"),
        });
        if (result.success) {
          form.reset();
        }
      }}
    >
      <div style={fieldStyles}>
        <label htmlFor={`${formId}-title`}>Title</label>
        <input type="text" name="title" id={`${formId}-title`} required />
      </div>
      <div style={fieldStyles}>
        <label htmlFor={`${formId}-author`}>Author</label>
        <input type="text" name="author" id={`${formId}-author`} />
      </div>
      <div style={fieldStyles}>
        <label htmlFor={`${formId}-url`}>Url</label>
        <input type="url" name="url" id={`${formId}-url`} required />
      </div>
      <div>
        <button type="submit">Add New</button>
      </div>
    </form>
  );
}
