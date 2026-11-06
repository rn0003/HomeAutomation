import { useState } from 'react';
import { useAuth } from '../auth';
import Icon from './Icon';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name.trim()) { setError('Name is required'); return; }
      if (password !== confirm) { setError('Passwords do not match'); return; }
    }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name.trim(), email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-backdrop">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-header">
          <Icon name="home" />
          <h1>Home Panel</h1>
        </div>

        <div className="seg login-tabs">
          <button type="button" aria-pressed={mode === 'login' ? 'true' : 'false'} onClick={() => switchMode()}>
            Sign in
          </button>
          <button type="button" aria-pressed={mode === 'register' ? 'true' : 'false'} onClick={() => switchMode()}>
            Create account
          </button>
        </div>

        {mode === 'register' && (
          <div>
            <label className="lbl" htmlFor="auth-name">Name</label>
            <input
              className="txt"
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
        )}

        <div>
          <label className="lbl" htmlFor="auth-email">Email</label>
          <input
            className="txt"
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
          />
        </div>

        <div>
          <label className="lbl" htmlFor="auth-password">Password</label>
          <input
            className="txt"
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        {mode === 'register' && (
          <div>
            <label className="lbl" htmlFor="auth-confirm">Confirm password</label>
            <input
              className="txt"
              id="auth-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </div>
        )}

        {error && <div className="err" role="alert">{error}</div>}

        <button className="btn primary login-submit" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
