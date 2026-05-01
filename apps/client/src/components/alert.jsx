export function Alert({ variant = "success", message }) {
  return (
    <div role="status" className="alert" data-variant={variant} aria-atomic="true">
      {message}
    </div>
  );
}
