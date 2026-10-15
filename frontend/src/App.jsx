import { useEffect, useRef, useState } from 'react';
import { Archive, History, LogOut, Search, Settings } from 'lucide-react';
import { api, getToken, initials, setToken, setUnauthorizedHandler } from './api';
import { applySettings, loadSettings, saveSettings } from './settings';
import LoginPage from './components/LoginPage';
import SearchPage from './components/SearchPage';
import ArchivePage from './components/ArchivePage';
import HistoryPage from './components/HistoryPage';
import SettingsPage from './components/SettingsPage';

const NAV = [
  { id: 'search', label: 'Search', icon: Search },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'history', label: 'History', icon: History },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));
  const [tab, setTab] = useState('search');
  const [settings, setSettings] = useState(loadSettings);
  const searchRef = useRef(null);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    if (!getToken()) return;
    api.me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    applySettings(settings);
    saveSettings(settings);
  }, [settings]);

  const handleAuth = ({ token, user }) => {
    setToken(token);
    setUser(user);
    setTab('search');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  if (checking) return <div className="center-screen muted">Loading…</div>;
  if (!user) return <LoginPage onAuth={handleAuth} />;

  const navButton = ({ id, label, icon: Icon }) => (
    <button
      key={id}
      className={`nav-item ${tab === id ? 'active' : ''}`}
      onClick={() => setTab(id)}
      aria-current={tab === id ? 'page' : undefined}
    >
      <Icon size={17} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="app">
      <aside className="sidebar">
        {/* A real link to "/" so clicking the logo reloads the whole app. */}
        <a className="brand" href="/" title="Reload MediaMind">
          <span className="brand-mark">M</span>
          <div className="brand-text">
            <span>MediaMind</span>
            <span className="muted small">Archive research</span>
          </div>
        </a>

        <nav className="nav">
          <span className="nav-label">Workspace</span>
          {NAV.map(navButton)}
          <span className="nav-label">Preferences</span>
          {navButton({ id: 'settings', label: 'Settings', icon: Settings })}
        </nav>

        <div className="user-card">
          <span className="avatar">{initials(user.name)}</span>
          <div className="user-meta">
            <span className="user-name">{user.name}</span>
            <span className="muted small user-role">{user.role}</span>
          </div>
          <button className="icon-btn" onClick={logout} title="Sign out" aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main">
        {/* Search stays mounted so results survive switching tabs. */}
        <div hidden={tab !== 'search'}>
          <SearchPage ref={searchRef} active={tab === 'search'} user={user} settings={settings} />
        </div>
        {tab === 'archive' && <ArchivePage />}
        {tab === 'history' && (
          <HistoryPage
            onRerun={(q) => {
              setTab('search');
              searchRef.current?.run(q);
            }}
          />
        )}
        {tab === 'settings' && (
          <SettingsPage settings={settings} onChange={setSettings} user={user} onLogout={logout} />
        )}
      </main>
    </div>
  );
}
