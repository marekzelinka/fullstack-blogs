import { useId } from "react";

const fieldStyles = { display: "flex", gap: 8, marginBottom: 6 };

export function LoginForm({ onSubmit }) {
  const formId = useId();

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);

        const result = await onSubmit({
          username: formData.get("username"),
          password: formData.get("password"),
        });
        if (result.success) {
          form.reset();
        }
      }}
    >
      <div style={fieldStyles}>
        <label htmlFor={`${formId}-username`}>Username</label>
        <input type="text" name="username" id={`${formId}-username`} required />
      </div>
      <div style={fieldStyles}>
        <label htmlFor={`${formId}-password`}>Password</label>
        <input type="password" name="password" id={`${formId}-password`} required />
      </div>
      <div>
        <button type="submit">Login</button>
      </div>
    </form>
  );
}
