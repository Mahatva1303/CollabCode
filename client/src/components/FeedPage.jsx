
import './FeedPage.css';

export default function FeedPage({ setCurrentPage }) {
  return (
    <section className="home-content feed-page">
      <div className="home-page-heading">
        <h1>Feed</h1>
        <p>Updates from your CollabCode workspaces.</p>
      </div>

      <div className="home-empty-state">
        <div className="home-empty-symbol">◎</div>
        <h2>Your feed starts here</h2>
        <p>
          Workspace activity and team updates will appear here as
          collaboration features are added.
        </p>

        <button
          className="home-primary-button"
          onClick={() => setCurrentPage('home')}
        >
          Explore workspaces
        </button>
      </div>
    </section>
  );
}
