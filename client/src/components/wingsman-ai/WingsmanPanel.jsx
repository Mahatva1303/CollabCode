
import { useState } from 'react';
import wingsmanLogo from '../../assets/wingsmanai.png';
import './WingsmanPanel.css';

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    text: 'Hey! I’m Wingsman, your coding assistant. Ask me about your code, debugging, or implementation ideas.',
  },
];

function WingsmanLogo() {
  return (
    <img
      src={wingsmanLogo}
      alt="Wingsman AI"
      className="wingsman-logo"
    />
  );
}

export default function WingsmanPanel() {
  const [messages, setMessages] = useState(initialMessages);
  const [prompt, setPrompt] = useState('');

  const sendMessage = (event) => {
    event.preventDefault();

    const text = prompt.trim();
    if (!text) return;

    const timestamp = Date.now();

    setMessages((current) => [
      ...current,
      { id: timestamp, role: 'user', text },
      {
        id: timestamp + 1,
        role: 'assistant',
        text: 'I’ve received your message. AI responses will be connected when we integrate the Wingsman backend.',
      },
    ]);

    setPrompt('');
  };

  return (
    <section className="wingsman-panel">
      <header className="wingsman-header">
        <div className="wingsman-heading">
          <WingsmanLogo />

          <div>
            <h3>Wingsman AI</h3>
            <p>
              <span className="wingsman-status-dot" />
              Coding assistant
            </p>
          </div>
        </div>

        <button
          className="wingsman-header-button"
          type="button"
          title="New conversation"
          aria-label="Start a new conversation"
          onClick={() => {
            setMessages(initialMessages);
            setPrompt('');
          }}
        >
          +
        </button>
      </header>

      <div className="wingsman-messages">
        {messages.map((item) => (
          <article
            className={`wingsman-message ${
              item.role === 'user' ? 'wingsman-user-message' : ''
            }`}
            key={item.id}
          >
            {item.role === 'assistant' && <WingsmanLogo />}

            <div className="wingsman-message-content">
              {item.role === 'assistant' && (
                <span className="wingsman-message-author">
                  Wingsman
                </span>
              )}

              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>

      <form className="wingsman-composer" onSubmit={sendMessage}>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask Wingsman anything..."
          aria-label="Message Wingsman AI"
          rows={2}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form.requestSubmit();
            }
          }}
        />

        <div className="wingsman-composer-footer">
          <span>Enter to send · Shift+Enter for newline</span>

          <button
            type="submit"
            disabled={!prompt.trim()}
            title="Send message"
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
      </form>
    </section>
  );
}
