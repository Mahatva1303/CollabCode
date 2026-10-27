
import { useState } from 'react';
import './TeamChat.css';

const initialMessages = [
  {
    id: 1,
    name: 'Alex',
    initials: 'AL',
    color: '#8b7cf6',
    time: '10:42',
    text: 'I am working on the frontend layout.',
  },
  {
    id: 2,
    name: 'You',
    initials: 'YO',
    color: '#2f9e8f',
    time: '10:44',
    text: 'Great! I will handle the API integration.',
    own: true,
  },
];

export default function TeamChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState('');

  const sendMessage = (event) => {
    event.preventDefault();

    const text = message.trim();
    if (!text) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        name: 'You',
        initials: 'YO',
        color: '#2f9e8f',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        text,
        own: true,
      },
    ]);

    setMessage('');
  };

  return (
    <section className="team-chat">
      <header className="team-chat-header">
        <div className="team-chat-title">
          <span className="team-chat-icon">▤</span>
          <div>
            <h3>Team Chat</h3>
            <p><span className="team-online-dot" /> 3 members online</p>
          </div>
        </div>
        <button className="team-chat-more" title="More options">···</button>
      </header>

      <div className="team-chat-messages">
        <div className="team-chat-date">TODAY</div>

        {messages.map((item) => (
          <article
            className={`team-message ${item.own ? 'own-message' : ''}`}
            key={item.id}
          >
            <div
              className="team-message-avatar"
              style={{ background: item.color }}
            >
              {item.initials}
            </div>

            <div className="team-message-body">
              <div className="team-message-meta">
                <strong>{item.name}</strong>
                <time>{item.time}</time>
              </div>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>

      <form className="team-chat-composer" onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Message your team..."
          aria-label="Team chat message"
        />
        <button type="submit" disabled={!message.trim()} title="Send message">
          ↑
        </button>
      </form>
    </section>
  );
}
