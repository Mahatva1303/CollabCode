import "./CreateWorkspaceModal.css";

function CreateWorkspaceModal({
  isOpen,
  onClose,
  onSubmit,
  workspaceName,
  setWorkspaceName,
  template,
  setTemplate,
  editingWorkspace = null,
}) {
  if (!isOpen) return null;

  const isEditing = Boolean(editingWorkspace);

  return (
    <div
      className="create-workspace-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="create-workspace-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-workspace-title"
      >
        <div className="create-workspace-header">
          <div>
            <h2 id="create-workspace-title">
              {isEditing ? "Edit workspace" : "Create a workspace"}
            </h2>
            <p>
              {isEditing
                ? "Update your workspace details."
                : "Start a new project in CollabCode."}
            </p>
          </div>

          <button
            type="button"
            className="create-workspace-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form className="create-workspace-form" onSubmit={onSubmit}>
          <label htmlFor="create-workspace-name">
            Workspace name
          </label>

          <input
            id="create-workspace-name"
            type="text"
            placeholder="e.g. My Portfolio"
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value)}
            maxLength={60}
            required
          />

          <label htmlFor="create-workspace-template">
            Choose a template
          </label>

          <select
            id="create-workspace-template"
            value={template}
            onChange={(event) => setTemplate(event.target.value)}
            disabled={isEditing}
          >
            <option value="HTML">HTML, CSS & JavaScript</option>
            <option value="React">React</option>
            <option value="Full Stack">Full Stack (React + Node.js)</option>
          </select>

          {isEditing && (
            <p className="workspace-edit-note">
              The template cannot be changed after workspace creation.
            </p>
          )}

          <div className="create-workspace-actions">
            <button
              type="button"
              className="create-workspace-cancel"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-workspace-submit"
            >
              {isEditing ? "Save changes" : "Create workspace"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateWorkspaceModal;