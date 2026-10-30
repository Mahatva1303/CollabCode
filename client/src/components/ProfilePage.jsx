
import { useEffect, useState } from 'react';
import './ProfilePage.css';

const POINTER_COLORS = [
  { name: 'Blue', value: '#388bfd' },
  { name: 'Green', value: '#3fbf9f' },
  { name: 'Purple', value: '#a371f7' },
  { name: 'Orange', value: '#f0883e' },
];

const TIME_ZONES = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

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
  const [pointerColor, setPointerColor] = useState(
    profile.pointerColor || POINTER_COLORS[0].value
  );
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [location, setLocation] = useState(profile.location || '');
  const [localTimeZone, setLocalTimeZone] = useState(
    profile.localTimeZone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      'Asia/Kolkata'
  );
  const [aboutMe, setAboutMe] = useState(profile.bio || '');
  const [emailConnected] = useState(false);
  const [detailsMessage, setDetailsMessage] = useState('');

  // Keep the fields in sync when saved profile data changes.
  useEffect(() => {
    setLocation(profile.location || '');
    setLocalTimeZone(
      profile.localTimeZone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        'Asia/Kolkata'
    );
    setPointerColor(profile.pointerColor || POINTER_COLORS[0].value);
    setAboutMe(profile.bio || '');
  }, [
    profile.location,
    profile.localTimeZone,
    profile.pointerColor,
    profile.bio,
  ]);

  const displayName = editDisplayName || profile.displayName || 'User';

  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Member';

  const resetChanges = () => {
    setEditDisplayName(profile.displayName || '');
    setEditBio(profile.bio || '');
    setAboutMe(profile.bio || '');
    setLocation(profile.location || '');
    setLocalTimeZone(
      profile.localTimeZone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        'Asia/Kolkata'
    );
    setPointerColor(profile.pointerColor || POINTER_COLORS[0].value);
    setIsEditingUsername(false);
    setDetailsMessage('');
  };

  const saveAbout = () => {
    setEditBio(aboutMe);
    setDetailsMessage(
      'About me updated in the form. Click Save profile to store all changes.'
    );
  };

  const handleSaveProfile = (event) => {
    // The parent save function also calls preventDefault().
    event.preventDefault();

    if (!editDisplayName.trim()) {
      setDetailsMessage('Username cannot be empty.');
      return;
    }

    // The parent save function reads this data from the form fields.
    // We pass the additional profile fields through a custom event property.
    saveProfile({
      preventDefault: () => {},
      profileDetails: {
        location: location.trim(),
        localTimeZone,
        pointerColor,
        bio: aboutMe.trim(),
      },
    });

    setEditBio(aboutMe.trim());
    setIsEditingUsername(false);
    setDetailsMessage('Profile save requested.');
  };

  return (
    <section className="profile-page">
      <button
        type="button"
        className="profile-back-button"
        onClick={() => setCurrentPage('home')}
      >
        ← Back to Home
      </button>

      <div className="profile-page-heading">
        <h1>Your profile</h1>
        <p>Manage how you appear in CollabCode.</p>
      </div>

      <form className="profile-card" onSubmit={handleSaveProfile}>
        <div className="profile-overview">
          <section className="profile-picture-section">
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

              <div className="pointer-color-section">
                <span>
                  Pointer colour <small>(workspace only)</small>
                </span>

                <div className="pointer-color-options">
                  {POINTER_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`pointer-color-option ${
                        pointerColor === color.value ? 'selected' : ''
                      }`}
                      style={{ '--pointer-color': color.value }}
                      onClick={() => setPointerColor(color.value)}
                      aria-label={`${color.name} pointer colour`}
                      aria-pressed={pointerColor === color.value}
                      title={color.name}
                    >
                      {pointerColor === color.value && (
                        <span className="pointer-color-check">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="profile-account-details">
            <div className="profile-detail-row">
              <span className="profile-detail-icon">♙</span>
              <span className="profile-detail-label">Username</span>

              {isEditingUsername ? (
                <input
                  id="profile-display-name"
                  className="profile-inline-input"
                  value={editDisplayName}
                  onChange={(event) =>
                    setEditDisplayName(event.target.value)
                  }
                  placeholder="Enter username"
                  maxLength={40}
                  autoFocus
                />
              ) : (
                <strong>{displayName}</strong>
              )}

              <button
                type="button"
                className="profile-secondary-button"
                onClick={() => {
                  if (isEditingUsername) {
                    setIsEditingUsername(false);
                    setEditDisplayName(profile.displayName || '');
                  } else {
                    setEditDisplayName(profile.displayName || '');
                    setIsEditingUsername(true);
                  }
                }}
              >
                {isEditingUsername ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="profile-detail-row">
              <span className="profile-detail-icon">✉</span>
              <span className="profile-detail-label">Email</span>
              <span className="profile-detail-value">
                {emailConnected ? 'Connected' : 'Not connected'}
              </span>
              <button
                type="button"
                className="profile-secondary-button"
                onClick={() =>
                  setDetailsMessage(
                    'Google sign-in and email display will be added with Firebase authentication.'
                  )
                }
              >
                Connect
              </button>
            </div>

            <div className="profile-detail-row">
              <span className="profile-detail-icon">⌖</span>
              <label
                className="profile-detail-label"
                htmlFor="profile-location"
              >
                Location
              </label>
              <input
                id="profile-location"
                className="profile-inline-input"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Add country or city"
                maxLength={80}
              />
            </div>

            <div className="profile-detail-row">
              <span className="profile-detail-icon">◷</span>
              <label
                className="profile-detail-label"
                htmlFor="profile-timezone"
              >
                Local time
              </label>
              <select
                id="profile-timezone"
                className="profile-inline-input"
                value={localTimeZone}
                onChange={(event) => setLocalTimeZone(event.target.value)}
              >
                {TIME_ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone.replaceAll('_', ' ')}
                  </option>
                ))}

                {!TIME_ZONES.includes(localTimeZone) && (
                  <option value={localTimeZone}>{localTimeZone}</option>
                )}
              </select>
            </div>

            <div className="profile-detail-row profile-joined-row">
              <span className="profile-detail-icon">▦</span>
              <span className="profile-detail-label">Joined</span>
              <strong>{joinedDate}</strong>
            </div>
          </div>
        </div>

        <div className="profile-lower-grid">
          <section className="profile-section-card achievements-card">
            <div className="profile-section-heading">
              <span className="profile-section-icon">♜</span>
              <div>
                <h2>Achievements</h2>
                <p>Showcase your milestones and contributions.</p>
              </div>
            </div>

            <div className="achievements-empty-state">
              <div className="achievement-trophy">♜</div>
              <strong>No achievements yet</strong>
              <p>
                Complete challenges and reach milestones to unlock
                achievements.
              </p>
            </div>
          </section>

          <section className="profile-section-card about-card">
            <div className="profile-section-heading">
              <span className="profile-section-icon">▤</span>
              <div>
                <h2>About me</h2>
                <p>Tell others a little about yourself.</p>
              </div>
            </div>

            <textarea
              className="about-me-textarea"
              value={aboutMe}
              onChange={(event) => setAboutMe(event.target.value)}
              maxLength={200}
              placeholder="Write something about yourself..."
              rows={4}
            />

            <div className="about-character-count">
              {aboutMe.length}/200
            </div>

            <div className="about-save-row">
              <button
                type="button"
                className="profile-secondary-button"
                onClick={() => {
                  setAboutMe(profile.bio || '');
                  setDetailsMessage('');
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="profile-save-button"
                onClick={saveAbout}
                disabled={aboutMe === (profile.bio || '')}
              >
                Save changes
              </button>
            </div>
          </section>
        </div>

        {detailsMessage && (
          <p className="profile-message" role="status">
            {detailsMessage}
          </p>
        )}

        {profileMessage && (
          <p className="profile-message" role="status">
            {profileMessage}
          </p>
        )}

        <p className="profile-help-text">
          Profile changes are currently stored in this browser.
        </p>

        <div className="profile-form-actions">
          <button
            type="button"
            className="profile-secondary-button"
            onClick={resetChanges}
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
