
import { Fragment, useEffect, useRef, useState } from 'react';
import useCollaboration from '../../collaboration/useCollaboration';
import './TeamChat.css';

const formatChatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function TeamChat({
  workspaceId,
  token,
  user,
  profile,
}) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const messagesContainerRef = useRef(null);

  const {
    document,
    provider,
    isSynced,
    status,
  } = useCollaboration({
    workspaceId,
    filePath: '__team-chat__',
    enabled: Boolean(workspaceId && token),
    token,
  });

  // Load and observe shared messages.
  useEffect(() => {
    if (!document || !isSynced) return;

    const sharedMessages = document.getArray('team-chat-messages');

    const updateMessages = () => {
      setMessages(sharedMessages.toArray());
    };

    updateMessages();
    sharedMessages.observe(updateMessages);

    return () => {
      sharedMessages.unobserve(updateMessages);
    };
  }, [document, isSynced]);

  // Automatically scroll to the latest message.
useEffect(() => {
  const container = messagesContainerRef.current;

  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }
}, [messages]);

  // Publish current user's chat identity.
  useEffect(() => {
    if (!provider) return;

    provider.awareness.setLocalStateField('chatUser', {
      name:
        profile?.displayName ||
        user?.displayName ||
        user?.email?.split('@')[0] ||
        'User',
      avatar: profile?.avatar || user?.photoURL || '',
    });

    return () => {
      provider.awareness.setLocalStateField('chatUser', null);
    };
  }, [provider, profile, user]);

  // Send a message.
  const sendMessage = (event) => {
    event.preventDefault();

    const text = message.trim();

    if (!text || !document || !isSynced) return;

    const sharedMessages = document.getArray('team-chat-messages');

    const newMessage = {
      id: `${user?.uid || 'user'}-${Date.now()}`,
      uid: user?.uid || '',
      name:
        profile?.displayName ||
        user?.displayName ||
        user?.email?.split('@')[0] ||
        'User',
      avatar: profile?.avatar || user?.photoURL || '',
      color: profile?.pointerColor || '#388bfd',
      text,
      createdAt: new Date().toISOString(),
    };

    document.transact(() => {
      sharedMessages.push([newMessage]);
    });

    setMessage('');
  };

  // Delete all workspace chat messages.
  const handleDeleteChat = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete all workspace chat messages?'
    );

    if (!confirmed || !document || !isSynced) return;

    const sharedMessages = document.getArray('team-chat-messages');

    document.transact(() => {
      sharedMessages.delete(0, sharedMessages.length);
    });

    setShowMenu(false);
  };

  const isConnected = status === 'connected' && isSynced;

  return (
    <section className="team-chat">
      <header className="team-chat-header">
        <div className="team-chat-title">
          <span className="team-chat-icon">▤</span>

          <div>
            <h3>Team Chat</h3>

            <p>
              <span
                className="team-online-dot"
                style={{
                  background: isConnected ? '#3fb950' : '#d29922',
                }}
              />
              {isConnected ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>

        {/* Three-dot menu */}
        <div className="team-chat-menu-wrapper">
          <button
            className="team-chat-more"
            title="More options"
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
          >
            ···
          </button>

          {showMenu && (
            <>
              <div
                className="team-chat-menu-backdrop"
                onClick={() => setShowMenu(false)}
              />

              <div className="team-chat-dropdown">
                <button
                  type="button"
                  className="delete-chat-option"
                  onClick={handleDeleteChat}
                  disabled={!isConnected || messages.length === 0}
                >
                  <span>🗑</span>
                  Delete Chat
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Chat messages */}
      <div
  className="team-chat-messages"
  ref={messagesContainerRef}
>
        <div className="team-chat-date">WORKSPACE MESSAGES</div>

        
{messages.map((item, index) => {
  const own = item.uid === user?.uid;
  const currentDate = formatChatDate(item.createdAt);

  const previousMessage = messages[index - 1];

  const showDate =
    !previousMessage ||
    formatChatDate(previousMessage.createdAt) !== currentDate;

  const isSameSender =
    previousMessage &&
    previousMessage.uid === item.uid &&
    !showDate;

  return (
    <Fragment key={item.id}>
      {showDate && (
        <div className="team-chat-date">
          {currentDate}
        </div>
      )}

      <article
        className={`team-message ${own ? 'own-message' : ''} ${
          isSameSender ? 'same-sender-message' : ''
        }`}
      >
        {!own && !isSameSender && (
          <div
            className="team-message-avatar"
            style={{ background: item.color || '#388bfd' }}
          >
            {item.avatar ? (
              <img src={item.avatar} alt={item.name} />
            ) : (
              (item.name || 'U').slice(0, 2).toUpperCase()
            )}
          </div>
        )}

        {!own && isSameSender && (
          <div className="team-message-avatar-spacer" />
        )}

        
<div className="team-message-body">
  {!isSameSender && (
    <div className="team-message-meta">
      <strong>{own ? 'You' : item.name}</strong>
    </div>
  )}

  <div className="team-message-bubble">
    <p>{item.text}</p>

    <time className="team-message-time">
      {new Date(item.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })}
    </time>
  </div>
</div>

      </article>
    </Fragment>
  );
})}


        {messages.length === 0 && (
          <p className="no-file-message">
            No messages yet. Start a conversation!
          </p>
        )}
      </div>

      {/* Message composer */}
      <form className="team-chat-composer" onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Message your team..."
          aria-label="Team chat message"
          disabled={!isConnected}
        />

        <button
          type="submit"
          disabled={!message.trim() || !isConnected}
          title="Send message"
        >
          ↑
        </button>
      </form>
    </section>
  );
}
