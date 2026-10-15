import { useEffect, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { api, getToken, setToken, setUnauthorizedHandler } from './api';
import LoginPage from './components/LoginPage';
import SearchPage from './components/SearchPage';
import ArchivePage from './components/ArchivePage';
import HistoryPage from './components/HistoryPage';

const TABS = [
  { id: 'search', label: 'Search' },
  { id: 'archive', label: 'Archive' },
  { id: 'history', label: 'History' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));
  const [tab, setTab] = useState('search');
  const searchRef = useRef(null);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    if (!getToken()) return;
    api.me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setChecking(false));
  }, []);

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

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">M</span>
          <span>MediaMind</span>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="user">
          <span className="muted user-name">{user.name}</span>
          <button className="icon-btn" onClick={logout} title="Sign out" aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="main">
        {/* Search stays mounted so results survive switching tabs. */}
        <div hidden={tab !== 'search'}>
          <SearchPage ref={searchRef} active={tab === 'search'} />
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
      </main>
    </div>
  );
}
