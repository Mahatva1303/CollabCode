
import ActivityChart from './ActivityChart';
import './HomeDashboard.css';


const LANGUAGE_INFO = {
  JavaScript: { color: '#f1e05a' },
  TypeScript: { color: '#3178c6' },
  HTML: { color: '#e34c26' },
  CSS: { color: '#563d7c' },
  Python: { color: '#3572A5' },
  Java: { color: '#b07219' },
  JSON: { color: '#292929' },
  Markdown: { color: '#083fa1' },
  PHP: { color: '#4F5D95' },
  SQL: { color: '#e38c00' },
  Shell: { color: '#89e051' },
};

const EXTENSION_LANGUAGE = {
  js: 'JavaScript',
  jsx: 'JavaScript',
  mjs: 'JavaScript',
  cjs: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  html: 'HTML',
  htm: 'HTML',
  css: 'CSS',
  scss: 'CSS',
  py: 'Python',
  java: 'Java',
  json: 'JSON',
  md: 'Markdown',
  php: 'PHP',
  sql: 'SQL',
  sh: 'Shell',
};

function getWorkspaceLanguages(files = {}) {
  const totals = {};

  Object.entries(files).forEach(([filePath, content]) => {
    if (filePath.endsWith('/')) return;
    if (typeof content !== 'string' || !content.trim()) return;

    const extension = filePath.split('.').pop()?.toLowerCase();
    const language = EXTENSION_LANGUAGE[extension];

    if (!language) return;

    const size = new TextEncoder().encode(content).length;

    totals[language] = (totals[language] || 0) + size;
  });

  const totalSize = Object.values(totals).reduce(
    (sum, size) => sum + size,
    0
  );

  if (!totalSize) return [];

  return Object.entries(totals)
    .map(([name, size]) => ({
      name,
      percentage: (size / totalSize) * 100,
      color: LANGUAGE_INFO[name].color,
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

export default function HomeDashboard({
  profile,
  workspaces,
  savedProjects,
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
              <div className="workspace-icon">
                {workspace.icon || '◈'}
              </div>

              <div className="workspace-card-actions">
                <span className="workspace-status">
                  {workspace.status || 'Personal'}
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

{(() => {
  const languages = getWorkspaceLanguages(
    savedProjects?.[workspace.name]
  );

  if (!languages.length) return null;

  return (
    <div className="workspace-languages">
      <div className="language-bar">
        {languages.map((language) => (
          <span
            key={language.name}
            className="language-bar-segment"
            style={{
              width: `${language.percentage}%`,
              backgroundColor: language.color,
            }}
            title={`${language.name}: ${language.percentage.toFixed(1)}%`}
          />
        ))}
      </div>

      <div className="language-legend">
        {languages.map((language) => (
          <span key={language.name} className="language-item">
            <span
              className="language-dot"
              style={{ backgroundColor: language.color }}
            />
            <strong>{language.name}</strong>
            <span>{language.percentage.toFixed(1)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
})()}

<div className="tech-list">
              {(Array.isArray(workspace.tech) ? workspace.tech : []).map((tech) => (
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