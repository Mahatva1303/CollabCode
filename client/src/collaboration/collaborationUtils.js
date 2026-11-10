// Generate a unique document name for each workspace file
export function createDocumentName(workspaceId, filePath) {
    if (!workspaceId || !filePath) {
        throw new Error('Workspace ID and file path are required.');
    }

    return `workspace-${workspaceId}-file-${encodeURIComponent(filePath)}`;
}