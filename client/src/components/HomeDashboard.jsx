
import ActivityChart from './ActivityChart';
import './HomeDashboard.css';

export default function HomeDashboard({
  profile,
  workspaces,
  openWorkspace,
  setShowCreateModal,
  openProfile,
  renderAvatar,
  deleteWorkspace,
  editWorkspace,
}) {
  const handleDelete = (event, workspace) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${workspace.name}"?`
    );

    if (confirmed) {
      deleteWorkspace(workspace);
    }
  };

  const handleEdit = (event, workspace) => {
    event.stopPropagation();
    editWorkspace(workspace);
  };

  return (
    <section className="home-content">
      <div className="home-welcome">
        <div>
          <p className="home-eyebrow">YOUR PERSONAL WORKSPACE</p>
          <h1>Welcome back, {profile.displayName}.</h1>
          <p>What are we building today?</p>
        </div>

        <button
          className="home-primary-button"
          onClick={() => setShowCreateModal(true)}
        >
          + Create workspace
        </button>
      </div>

      <div className="home-section-heading">
        <div>
          <h2>Your workspaces</h2>
          <p>Open a project and continue where you left off.</p>
        </div>

        <span className="workspace-count">
          {workspaces.length} workspace
          {workspaces.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="workspace-grid">
        {workspaces.map((workspace, index) => (
          <article
            className="workspace-card"
            key={`${workspace.name}-${index}`}
            onClick={() => openWorkspace(workspace)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openWorkspace(workspace);
              }
            }}
          >
            <div className="workspace-card-top">
              <div className="workspace-icon">{workspace.icon}</div>

              <div className="workspace-card-actions">
                <span className="workspace-status">
                  {workspace.status}
                </span>

                <button
                  type="button"
                  className="workspace-edit-button"
                  aria-label={`Edit ${workspace.name}`}
                  title="Edit workspace"
                  onClick={(event) => handleEdit(event, workspace)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="workspace-delete-button"
                  aria-label={`Delete ${workspace.name}`}
                  title="Delete workspace"
                  onClick={(event) => handleDelete(event, workspace)}
                >
                  Delete
                </button>
              </div>
            </div>

            <h3>{workspace.name}</h3>
            <p>{workspace.description}</p>

            <div className="tech-list">
              {workspace.tech.map((tech) => (
                <span className="tech-tag" key={tech}>
                  {tech}
                </span>
              ))}
            </div>

            <div className="workspace-card-footer">
              <span>Open workspace</span>
              <span className="card-arrow">→</span>
            </div>
          </article>
        ))}

        <button
          className="workspace-add-card"
          onClick={() => setShowCreateModal(true)}
        >
          <span className="workspace-add-symbol">+</span>
          <strong>Create a workspace</strong>
          <span>Start a new project</span>
        </button>
      </div>

      <ActivityChart />

      <section className="home-lower-section">
        <div>
          <h2>Build together</h2>
          <p>Your coding projects, organized in one place.</p>
        </div>

        <button
          className="profile-secondary-button"
          onClick={openProfile}
        >
          {renderAvatar('small')}
          Edit your profile
        </button>
      </section>
    </section>
  );
}