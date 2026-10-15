import { useState } from 'react';
import { Quote, Search, ShieldCheck } from 'lucide-react';
import { api } from '../api';

const FEATURES = [
  { icon: Search, title: 'Ask in plain language', text: 'Search decades of articles, interviews and footage notes by meaning, not keywords.' },
  { icon: Quote, title: 'Every sentence cited', text: 'Answers are quoted verbatim from the archive, each linked to its source.' },
  { icon: ShieldCheck, title: 'Verify in one click', text: 'Open the exact passage in the original document before you publish.' },
];

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
    <div className="auth">
      <section className="auth-intro">
        <a className="brand brand-lg" href="/" title="Reload MediaMind">
          <span className="brand-mark">M</span>
          <span>MediaMind</span>
        </a>
        <div>
          <h1>Research the archive.<br />Trust every answer.</h1>
          <p className="muted">The newsroom's research assistant. The AI is never more authoritative than the archive.</p>
        </div>
        <ul className="features">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <span className="feature-icon"><Icon size={16} /></span>
              <div>
                <strong>{title}</strong>
                <p className="muted small">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="auth-form-wrap">
        <form className="card auth-card" onSubmit={submit}>
          <div>
            <h2>{mode === 'login' ? 'Sign in' : 'Create your account'}</h2>
            <p className="muted small">
              {mode === 'login' ? 'Welcome back. Use your work email.' : 'For newsroom staff only.'}
            </p>
          </div>

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
            <div className="demo-hint small">
              <span className="muted">Demo account</span>
              <button
                type="button"
                className="link"
                onClick={() => { setEmail('demo@mediamind.news'); setPassword('demo1234'); }}
              >
                Fill in demo@mediamind.news
              </button>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
