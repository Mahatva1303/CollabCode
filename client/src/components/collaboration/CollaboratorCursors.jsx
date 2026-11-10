
import { useEffect, useState, useRef } from 'react';
import './CollaboratorCursors.css';

export default function CollaboratorCursors({
  editor,
  provider,
}) {
  const [cursors, setCursors] = useState([]);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!editor || !provider) return;

    // Broadcast this user's mouse position.
    const mouseMoveListener = editor.onMouseMove((event) => {
      const position = event.target.position;

      if (!position) return;

      provider.awareness.setLocalStateField('pointer', {
        lineNumber: position.lineNumber,
        column: position.column,
      });
    });

    // Hide this user's pointer when they leave the editor.
    const mouseLeaveListener = editor.onMouseLeave(() => {
      provider.awareness.setLocalStateField('pointer', null);
    });

    const updateCursors = () => {
      const remoteCursors = [];

      const model = editor.getModel();
      const overlay = overlayRef.current;
      const editorNode = editor.getDomNode();

      if (!model || !overlay || !editorNode) {
        setCursors([]);
        return;
      }

      provider.awareness.getStates().forEach((state, clientId) => {
        if (clientId === provider.awareness.clientID) return;

        const pointer = state.pointer;
        const user = state.user;

        if (!pointer || !user) return;

        try {
          const coordinates = editor.getScrolledVisiblePosition({
            lineNumber: pointer.lineNumber,
            column: pointer.column,
          });

          if (!coordinates) return;

          const editorRect = editorNode.getBoundingClientRect();
          const overlayRect = overlay.getBoundingClientRect();

          remoteCursors.push({
            clientId,
            name: user.name || 'Collaborator',
            color: user.color || '#388bfd',
            top: editorRect.top - overlayRect.top + coordinates.top,
            left: editorRect.left - overlayRect.left + coordinates.left,
          });
        } catch (error) {
          console.error('Cursor position error:', error);
        }
      });

      setCursors(remoteCursors);
    };

    updateCursors();

    provider.awareness.on('change', updateCursors);

    const scrollListener = editor.onDidScrollChange(updateCursors);
    const layoutListener = editor.onDidLayoutChange(updateCursors);

    return () => {
      mouseMoveListener.dispose();
      mouseLeaveListener.dispose();

      provider.awareness.off('change', updateCursors);

      scrollListener.dispose();
      layoutListener.dispose();

      provider.awareness.setLocalStateField('pointer', null);
    };
  }, [editor, provider]);

  return (
    <div className="collaborator-cursors" ref={overlayRef}>
      {cursors.map((cursor) => (
        <div
          key={cursor.clientId}
          className="collaborator-cursor"
          style={{
            top: cursor.top,
            left: cursor.left,
            '--cursor-color': cursor.color,
          }}
        >
          <span className="collaborator-cursor-arrow">➤</span>

          <span className="collaborator-cursor-name">
            {cursor.name}
          </span>
        </div>
      ))}
    </div>
  );
}
