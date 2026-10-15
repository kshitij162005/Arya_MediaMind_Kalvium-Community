import { useEffect, useState } from 'react';
import { api } from '../api';

function timeAgo(utc) {
  const seconds = (Date.now() - new Date(`${utc.replace(' ', 'T')}Z`).getTime()) / 1000;
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  return `${Math.floor(seconds / 86400)} d ago`;
}

export default function HistoryPage({ onRerun }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.history().then(setItems).catch((e) => setError(e.message));
  }, []);

  const clear = async () => {
    await api.clearHistory();
    setItems([]);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Search history</h1>
          <p className="muted">Your recent questions. Click one to run it again.</p>
        </div>
        {items?.length > 0 && <button className="btn ghost" onClick={clear}>Clear history</button>}
      </div>

      {error && <div className="alert error">{error}</div>}
      {items?.length === 0 && <div className="empty muted">No searches yet.</div>}

      <ul className="history">
        {items?.map((h) => (
          <li key={h.id}>
            <button className="history-item" onClick={() => onRerun(h.query)}>
              <span className="history-query">{h.query}</span>
              <span className="muted small nowrap">
                {h.sufficient ? `${h.result_count} source${h.result_count === 1 ? '' : 's'}` : 'Not found'} · {timeAgo(h.created_at)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
