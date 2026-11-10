import './CollaboratorAvatars.css';
function CollaboratorAvatars({ collaborators = [] }) {
    if (!collaborators.length) return null;

    return (
        <div className="collaborator-avatars">
            {collaborators.map((collaborator, index) => (
                <div
                    key={collaborator.id || index}
                    className="collaborator-avatar"
                    title={collaborator.name || 'Collaborator'}
                    style={{
                        backgroundColor:
                            collaborator.color || '#388bfd',
                    }}
                >
                    {collaborator.avatar ? (
                        <img
                            src={collaborator.avatar}
                            alt={collaborator.name || 'Collaborator'}
                        />
                    ) : (
                        (collaborator.name || 'U')
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>
            ))}
        </div>
    );
}

export default CollaboratorAvatars;