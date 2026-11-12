
const path = require('path');

const {
    initializeApp,
    cert,
    getApps,
} = require('firebase-admin/app');

const { getAuth } = require('firebase-admin/auth');

// Load Firebase service account credentials
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : require(
        path.join(__dirname, '..', 'serviceAccountKey.json')
    );

// Initialize Firebase Admin only once
const firebaseAdminApp =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert(serviceAccount),
        });

// Get Firebase Admin Authentication
const adminAuth = getAuth(firebaseAdminApp);

// Verify Firebase ID token
async function verifyFirebaseToken(idToken) {
    if (!idToken || typeof idToken !== 'string') {
        throw new Error('Missing Firebase authentication token.');
    }

    return await adminAuth.verifyIdToken(idToken);
}

// Find a registered Firebase user by email
async function getFirebaseUserByEmail(email) {
    if (!email || typeof email !== 'string') {
        throw new Error('A valid email address is required.');
    }

    return await adminAuth.getUserByEmail(email.trim());
}

module.exports = {
    verifyFirebaseToken,
    getFirebaseUserByEmail,
};
