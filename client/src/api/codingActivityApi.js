
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

// Record a coding activity
export async function recordCodingActivity(payload) {
    const data = await request('/api/coding-activity', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return data;
}

// Fetch the logged-in user's coding activity
export async function fetchCodingActivity() {
    const data = await request('/api/coding-activity');
    return data.activities;
}
