
import { useState } from 'react';
import wingsmanLogo from '../../assets/wingsmanai.png';
import './WingsmanPanel.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { diffLines } from 'diff';

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

export default function WingsmanPanel({
  workspaceId,
  token,
  files = {},
  activeFile = '',
  applyWingsmanEdit,
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingEdit, setPendingEdit] = useState(null);
  const editDiff = pendingEdit
  ? diffLines(pendingEdit.originalCode, pendingEdit.code)
  : [];

  const sendMessage = async (event) => {
    event.preventDefault();

    const text = prompt.trim();

    if (!text || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text,
    };

    const conversation = [...messages, userMessage];

    setMessages(conversation);
    setPrompt('');
    setLoading(true);

    try {
      if (!workspaceId || !token) {
        throw new Error('Workspace authentication is not ready.');
      }

      const workspaceContext = Object.entries(files)
        .filter(([path]) => !path.endsWith('/.__collabcode_folder__'))
        .map(([path, code]) => `\n--- FILE: ${path} ---\n${code}`)
        .join('\n');

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/wingsman/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            workspaceId,
            activeFile,
            workspaceContext,
            messages: conversation
              .filter((message) => ['user', 'assistant'].includes(message.role))
              .map((message) => ({
                role: message.role,
                content: message.text,
              })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Wingsman could not generate a response.'
        );
      }

      if (data.type === 'code_edit') {
  const edit = data.edit;

  if (
    !edit ||
    typeof edit.filePath !== 'string' ||
    typeof edit.code !== 'string' ||
    !Object.prototype.hasOwnProperty.call(files, edit.filePath) ||
    edit.filePath.endsWith('/.__collabcode_folder__')
  ) {
    throw new Error('Wingsman returned an invalid file-edit proposal.');
  }

  setPendingEdit({
    filePath: edit.filePath,
    code: edit.code,
    originalCode: files[edit.filePath] ?? '',
  });
}

setMessages((current) => [
  ...current,
  {
    id: Date.now() + 1,
    role: 'assistant',
    text: data.reply,
  },
]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: `Sorry, ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  const acceptEdit = () => {
  if (!pendingEdit || typeof applyWingsmanEdit !== 'function') {
    return;
  }

  applyWingsmanEdit(
    pendingEdit.filePath,
    pendingEdit.code
  );

  setPendingEdit(null);
};

const rejectEdit = () => {
  setPendingEdit(null);
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
          disabled={loading}
          onClick={() => {
            setMessages(initialMessages);
            setPrompt('');
            setPendingEdit(null);
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

              <div className="wingsman-markdown">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {item.text}
  </ReactMarkdown>
</div>
            </div>
          </article>
        ))}


        {pendingEdit && (
  <article className="wingsman-edit-proposal">
    <div className="wingsman-edit-header">
      <div>
        <strong>Proposed code changes</strong>
        <p>{pendingEdit.filePath}</p>
      </div>
      <span className="wingsman-edit-badge">Review</span>
    </div>

    <div className="wingsman-diff">
  {editDiff.map((part, index) => {
    const lines = part.value.match(/[^\n]*\n|[^\n]+/g) || [];

    return lines.map((line, lineIndex) => (
      <div
        key={`${index}-${lineIndex}`}
        className={`wingsman-diff-line ${
          part.added
            ? 'wingsman-diff-added'
            : part.removed
            ? 'wingsman-diff-removed'
            : 'wingsman-diff-unchanged'
        }`}
      >
        <span className="wingsman-diff-symbol">
          {part.added ? '+' : part.removed ? '-' : ' '}
        </span>

        <code>{line.replace(/\n$/, '') || ' '}</code>
      </div>
    ));
  })}
</div>

    <div className="wingsman-edit-actions">
      <button
        type="button"
        className="wingsman-edit-reject"
        onClick={rejectEdit}
      >
        Reject
      </button>

      <button
        type="button"
        className="wingsman-edit-accept"
        onClick={acceptEdit}
      >
        Accept Changes
      </button>
    </div>
  </article>
)}

        {loading && (
          <div className="wingsman-loading">
            <WingsmanLogo />
            <span>Wingsman is thinking...</span>
          </div>
        )}
      </div>

      <form className="wingsman-composer" onSubmit={sendMessage}>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask Wingsman anything..."
          aria-label="Message Wingsman AI"
          rows={2}
          disabled={loading}
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
            disabled={!prompt.trim() || loading}
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
