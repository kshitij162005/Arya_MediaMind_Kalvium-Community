import { useEffect, useState } from 'react';
import { CheckCircle2, CircleSlash, History, SlidersHorizontal } from 'lucide-react';
import { api, timeAgo } from '../api';

// Local calendar day of a SQLite UTC timestamp.
const localDay = (utc) => new Date(`${utc.replace(' ', 'T')}Z`).toDateString();

function dayLabel(utc) {
  const day = localDay(utc);
  if (day === new Date().toDateString()) return 'Today';
  if (day === new Date(Date.now() - 86400000).toDateString()) return 'Yesterday';
  return new Date(day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function groupByDay(items) {
  const groups = [];
  for (const item of items) {
    const label = dayLabel(item.created_at);
    if (groups.at(-1)?.label !== label) groups.push({ label, items: [] });
    groups.at(-1).items.push(item);
  }
  return groups;
}

const filterCount = (f) =>
  [f.year_from, f.year_to].filter(Boolean).length +
  ['content_types', 'authors', 'publications', 'topics'].reduce((n, k) => n + (f[k]?.length ?? 0), 0);

export default function HistoryPage({ onRerun }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    api.history().then(setItems).catch((e) => setError(e.message));
  }, []);

  const clear = async () => {
    await api.clearHistory();
    setItems([]);
    setConfirmClear(false);
  };

  const answered = items?.filter((h) => h.sufficient).length ?? 0;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Search history</h1>
          <p className="muted">Your recent questions. Click one to run it again.</p>
        </div>
        {items?.length > 0 && (
          confirmClear ? (
            <div className="row">
              <button className="btn danger" onClick={clear}>Clear all</button>
              <button className="btn ghost" onClick={() => setConfirmClear(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn ghost" onClick={() => setConfirmClear(true)}>Clear history</button>
          )
        )}
      </div>

      {error && <div className="alert error">{error}</div>}

      {items?.length > 0 && (
        <div className="mini-stats">
          <div className="card mini-stat"><span className="stat-value">{items.length}</span><span className="muted small">searches</span></div>
          <div className="card mini-stat"><span className="stat-value">{answered}</span><span className="muted small">answered from the archive</span></div>
          <div className="card mini-stat"><span className="stat-value">{items.length - answered}</span><span className="muted small">not found</span></div>
        </div>
      )}

      {items?.length === 0 && (
        <div className="card empty-state">
          <History size={28} />
          <h3>No searches yet</h3>
          <p className="muted">Questions you ask on the Search tab will be listed here.</p>
        </div>
      )}

      {items && groupByDay(items).map((g) => (
        <section key={g.label} className="history-group">
          <h2 className="group-label">{g.label}</h2>
          <ul className="history">
            {g.items.map((h) => {
              const nFilters = filterCount(h.filters);
              return (
                <li key={h.id}>
                  <button className="history-item" onClick={() => onRerun(h.query)}>
                    {h.sufficient
                      ? <CheckCircle2 size={16} className="status ok" aria-label="Answered" />
                      : <CircleSlash size={16} className="status miss" aria-label="Not found" />}
                    <span className="history-query">{h.query}</span>
                    {nFilters > 0 && (
                      <span className="badge" title="Filters were applied"><SlidersHorizontal size={11} /> {nFilters}</span>
                    )}
                    <span className="muted small nowrap">
                      {h.sufficient ? `${h.result_count} source${h.result_count === 1 ? '' : 's'}` : 'Not found'} · {timeAgo(h.created_at)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
