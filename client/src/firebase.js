
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDcdfzCAVjSQugASpEZ8zVigxB8yoWhkSs',
  authDomain: 'collabcode-6bf68.firebaseapp.com',
  projectId: 'collabcode-6bf68',
  storageBucket: 'collabcode-6bf68.firebasestorage.app',
  messagingSenderId: '629579943967',
  appId: '1:629579943967:web:345986a01980fbc04bc52a',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
