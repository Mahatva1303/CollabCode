import './Sidebar.css';

export default function Sidebar({
  profile,
  currentPage,
  setCurrentPage,
  workspaces,
  openProfile,
  openWorkspace,
  setShowCreateModal,
  renderAvatar,
}) {
  return (
    <aside className="home-sidebar">
      <button
        className="sidebar-account"
        onClick={openProfile}
        title="Open your profile"
      >
        {renderAvatar()}

        <span className="sidebar-account-details">
          <strong>{profile.displayName}</strong>
          <small>Your personal account</small>
        </span>

        <span className="account-switch-icon">⇄</span>
      </button>

      <nav className="home-navigation">
        <button
          className={`home-nav-item ${
            currentPage === 'home' ? 'active' : ''
          }`}
          onClick={() => setCurrentPage('home')}
        >
          <span className="nav-symbol">⌂</span>
          <span>Home</span>
        </button>

        <button
          className={`home-nav-item ${
            currentPage === 'feed' ? 'active' : ''
          }`}
          onClick={() => setCurrentPage('feed')}
        >
          <span className="nav-symbol">◎</span>
          <span>Feed</span>
        </button>
      </nav>

      <div className="sidebar-divider" />

      <div className="top-workspaces-heading">
        <strong>Top Workspaces</strong>
        <button
          className="sidebar-icon-button"
          title="Create workspace"
          onClick={() => setShowCreateModal(true)}
        >
          +
        </button>
      </div>

      <div className="top-workspaces-list">
        {workspaces.length > 0 ? (
          workspaces.map((workspace, index) => (
            <button
              key={`${workspace.name}-${index}`}
              className="top-workspace-item"
              title={workspace.name}
              onClick={() => openWorkspace(workspace)}
            >
              <span className="workspace-mini-icon">
                {workspace.icon}
              </span>
              <span>{workspace.name}</span>
            </button>
          ))
        ) : (
          <p className="sidebar-empty">
            Your workspaces will appear here.
          </p>
        )}
      </div>

      <button
        className="sidebar-create-workspace"
        onClick={() => setShowCreateModal(true)}
      >
        <span>+</span> New workspace
      </button>

      <button className="sidebar-profile-link" onClick={openProfile}>
        {renderAvatar('small')}
        <span>Profile settings</span>
      </button>
    </aside>
  );
}
