
import { auth } from '../firebase';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function request(path, options = {}) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('Please sign in first.');
    }

    const token = await user.getIdToken();

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed.');
    }

    return data;
}

export async function fetchWorkspaces() {
    const data = await request('/api/workspaces');
    return data.workspaces;
}

export async function createWorkspaceApi(payload) {
    const data = await request('/api/workspaces', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return data.workspace;
}

export async function inviteWorkspaceMemberApi(workspaceId, payload) {
    const data = await request(
        `/api/workspaces/${workspaceId}/members`,
        {
            method: 'POST',
            body: JSON.stringify(payload),
        }
    );

    return data;
}


export async function deleteWorkspaceApi(workspaceId) {
    const data = await request(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
    });

    return data;
}
