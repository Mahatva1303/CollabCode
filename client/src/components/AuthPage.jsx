
import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import './AuthPage.css';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        if (name.trim()) {
          await updateProfile(result.user, {
            displayName: name.trim(),
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      setError(
        err.code === 'auth/email-already-in-use'
          ? 'An account already exists with this email.'
          : err.code === 'auth/invalid-email'
            ? 'Please enter a valid email address.'
            : err.code === 'auth/weak-password'
              ? 'Your password must be at least 6 characters.'
              : err.code === 'auth/invalid-credential'
                ? 'Incorrect email or password.'
                : err.code === 'auth/popup-closed-by-user'
                  ? 'Google sign-in was cancelled.'
                  : err.message || 'Authentication failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(
        err.code === 'auth/popup-closed-by-user'
          ? 'Google sign-in was cancelled.'
          : err.message || 'Google sign-in failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">C</div>
          <span>CollabCode</span>
        </div>

        <h1>{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-subtitle">
          {isSignUp
            ? 'Start building together.'
            : 'Sign in to continue to your workspaces.'}
        </p>

        <button
          type="button"
          className="auth-google-button"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <label>
              Display name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={6}
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
          >
            {isSignUp ? 'Sign in' : 'Create account'}
          </button>
        </p>
      </section>
    </main>
  );
}
