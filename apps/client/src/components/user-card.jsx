const cardStyles = { display: "flex", alignItems: "center", gap: 8 };

export function UserCard({ user, onLogout }) {
  return (
    <div style={cardStyles}>
      <div>Logged in as {user.name ?? user.username}</div>
      <button type="button" onClick={onLogout}>
        Log out
      </button>
    </div>
  );
}
