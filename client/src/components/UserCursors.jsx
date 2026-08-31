
export default function UserCursors({ cursors, users }) {
  return (
    <>
      {Object.entries(cursors).map(([id, pos]) => {
        const user = users.find(u => u.id === id);
        if (!user) return null;

        return (
          <div
            key={id}
            className="user-cursor"
            style={{
              left: pos.x,
              top: pos.y,
              color: user.color
            }}
          >
            <div className="cursor-arrow" />
            <div
              className="cursor-label"
              style={{
                backgroundColor: user.color + '22',
                color: user.color
              }}
            >
              {user.displayName}
            </div>
          </div>
        );
      })}
    </>
  );
}
