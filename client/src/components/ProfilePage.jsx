
import './ProfilePage.css';

export default function ProfilePage({
  profile,
  editDisplayName,
  setEditDisplayName,
  editBio,
  setEditBio,
  profileMessage,
  avatarInputRef,
  selectAvatar,
  removeAvatar,
  saveProfile,
  renderAvatar,
  setCurrentPage,
}) {
  return (
    <section className="profile-page">
      <button
        className="profile-back-button"
        onClick={() => setCurrentPage('home')}
      >
        ← Back to Home
      </button>

      <div className="profile-page-heading">
        <h1>Your profile</h1>
        <p>Manage how you appear in CollabCode.</p>
      </div>

      <form className="profile-card" onSubmit={saveProfile}>
        <div className="profile-picture-section">
          <button
            type="button"
            className="profile-avatar-button"
            onClick={() => avatarInputRef.current?.click()}
            title="Change profile picture"
          >
            {renderAvatar('large')}
            <span className="avatar-edit-overlay">Edit</span>
          </button>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={selectAvatar}
          />

          <div className="profile-picture-details">
            <strong>Profile picture</strong>
            <p>Choose a picture to personalize your account.</p>

            <div className="profile-picture-actions">
              <button
                type="button"
                className="profile-secondary-button"
                onClick={() => avatarInputRef.current?.click()}
              >
                Upload picture
              </button>

              {profile.avatar && (
                <button
                  type="button"
                  className="profile-text-button"
                  onClick={removeAvatar}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="profile-form-divider" />

        <label htmlFor="profile-display-name">Display name</label>
        <input
          id="profile-display-name"
          type="text"
          value={editDisplayName}
          onChange={(event) => setEditDisplayName(event.target.value)}
          maxLength={40}
          placeholder="Enter your display name"
          required
        />

        <label htmlFor="profile-bio">Bio</label>
        <textarea
          id="profile-bio"
          value={editBio}
          onChange={(event) => setEditBio(event.target.value)}
          maxLength={160}
          placeholder="Write a short introduction about yourself"
          rows={3}
        />

        <p className="profile-help-text">
          Your profile changes are currently saved in this browser.
        </p>

        {profileMessage && (
          <p className="profile-message" role="status">
            {profileMessage}
          </p>
        )}

        <div className="profile-form-actions">
          <button
            type="button"
            className="profile-secondary-button"
            onClick={() => {
              setEditDisplayName(profile.displayName);
              setEditBio(profile.bio || '');
            }}
          >
            Reset changes
          </button>

          <button type="submit" className="profile-save-button">
            Save profile
          </button>
        </div>
      </form>
    </section>
  );
}
