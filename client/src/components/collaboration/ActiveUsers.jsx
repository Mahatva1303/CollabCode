
import { useEffect, useState } from 'react';
import './ActiveUsers.css';

export default function ActiveUsers({ provider }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!provider) {
      setUsers([]);
      return;
    }

    const updateUsers = () => {
      const activeUsers = [];

      provider.awareness.getStates().forEach((state, clientId) => {
        if (!state.user) return;

        activeUsers.push({
          clientId,
          name: state.user.name || 'User',
          color: state.user.color || '#388bfd',
          avatar: state.user.avatar || '',
        });
      });

      setUsers(activeUsers);
    };

    updateUsers();
    provider.awareness.on('change', updateUsers);

    return () => {
      provider.awareness.off('change', updateUsers);
    };
  }, [provider]);

  return (
    <div className="active-users-panel">
      <div className="active-users-header">
        <span>ACTIVE USERS</span>
        <span className="active-users-count">{users.length}</span>
      </div>

      <div className="active-users-list">
        {users.map((user) => (
          <div className="active-user" key={user.clientId}>
            <div
              className="active-user-avatar"
              style={{ borderColor: user.color }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}

              <span className="active-user-online-dot" />
            </div>

            <div className="active-user-info">
              <span className="active-user-name">{user.name}</span>
              <span className="active-user-status">ONLINE</span>
            </div>

            <span
              className="active-user-color"
              style={{
                backgroundColor: `${user.color}25`,
                color: user.color,
              }}
            >
              ONLINE
            </span>
          </div>
        ))}

        {users.length === 0 && (
          <p className="no-active-users">No collaborators online</p>
        )}
      </div>
    </div>
  );
}
