import { useState } from 'react';
import { api } from '../api';

export default function LoginPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = mode === 'login' ? await api.login(email, password) : await api.register(name, email, password);
      onAuth(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="center-screen">
      <form className="card auth-card" onSubmit={submit}>
        <div className="brand brand-lg">
          <span className="brand-mark">M</span>
          <span>MediaMind</span>
        </div>
        <p className="muted">Archive research for the newsroom. Every answer is traced back to its source.</p>

        {mode === 'register' && (
          <label className="field">
            <span>Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </label>
        )}
        <label className="field">
          <span>Work email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus={mode === 'login'} />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={mode === 'register' ? 8 : undefined}
            required
          />
        </label>

        {error && <div className="alert error">{error}</div>}

        <button className="btn primary block" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p className="muted small center">
          {mode === 'login' ? 'No account yet? ' : 'Already have an account? '}
          <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
        {mode === 'login' && (
          <p className="muted small center">Demo: demo@mediamind.news / demo1234</p>
        )}
      </form>
    </div>
  );
}
