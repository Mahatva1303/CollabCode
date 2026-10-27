
import { useRef, useState } from 'react';
import TeamChat from './team-chat/TeamChat';
import WingsmanPanel from './wingsman-ai/WingsmanPanel';
import './ResizableRightPanel.css';

const MIN_WIDTH = 280;
const MAX_WIDTH = 650;
const DEFAULT_WIDTH = 360;

export default function ResizableRightPanel({
  initialWidth = DEFAULT_WIDTH,
}) {
  const [width, setWidth] = useState(
    Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, initialWidth))
  );

  const dragging = useRef(false);

  const handlePointerDown = (event) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    document.body.classList.add('resizing-right-panel');
  };

  const handlePointerMove = (event) => {
    if (!dragging.current) return;

    const panel = event.currentTarget.parentElement;
    const bounds = panel.parentElement.getBoundingClientRect();
    const nextWidth = bounds.right - event.clientX;

    setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, nextWidth)));
  };

  const stopDragging = () => {
    dragging.current = false;
    document.body.classList.remove('resizing-right-panel');
  };

  return (
    <aside
      className="resizable-right-panel"
      style={{ width: `${width}px` }}
    >
      <div
        className="right-panel-resize-handle"
        role="separator"
        aria-label="Resize chat sidebar"
        aria-orientation="vertical"
        aria-valuenow={width}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onLostPointerCapture={stopDragging}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            setWidth((current) =>
              Math.min(MAX_WIDTH, current + 20)
            );
          }

          if (event.key === 'ArrowRight') {
            setWidth((current) =>
              Math.max(MIN_WIDTH, current - 20)
            );
          }
        }}
      />

      <div className="right-panel-content">
        <TeamChat />
        <WingsmanPanel />
      </div>
    </aside>
  );
}
