import { useCallback, useEffect, useState } from 'react';
import { FileText, Film, Inbox, Mic, Newspaper, Plus, Search, Trash2 } from 'lucide-react';
import { api, CONTENT_TYPE_LABELS, formatDate, timeAgo, typeCount } from '../api';

const TYPE_ICONS = { article: Newspaper, interview: Mic, footage_notes: Film, document: FileText };
import UploadModal from './UploadModal';
import DocumentViewer from './DocumentViewer';

export default function ArchivePage() {
  const [docs, setDocs] = useState(null);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notice, setNotice] = useState('');
  const [counts, setCounts] = useState(null); // documents per type, unaffected by the filters

  const loadCounts = useCallback(() => {
    api.overview().then((o) => setCounts({ total: o.documents, passages: o.passages, ...o.by_type })).catch(() => {});
  }, []);
  useEffect(loadCounts, [loadCounts]);

  const load = useCallback(() => {
    api.documents({ q, content_type: type })
      .then(setDocs)
      .catch((e) => setError(e.message));
  }, [q, type]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  const remove = async (id) => {
    try {
      await api.deleteDocument(id);
      setConfirmDelete(null);
      load();
      loadCounts();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Archive</h1>
          <p className="muted">
            {counts ? `${counts.total} document${counts.total === 1 ? '' : 's'} · ${counts.passages.toLocaleString()} searchable passages` : 'Loading…'}
          </p>
        </div>
        <button className="btn primary" onClick={() => setShowUpload(true)}>
          <Plus size={16} /> Upload document
        </button>
      </div>

      {notice && <div className="alert success" onClick={() => setNotice('')}>{notice}</div>}
      {error && <div className="alert error">{error}</div>}

      {counts && (
        <div className="type-tiles">
          {Object.keys(CONTENT_TYPE_LABELS).map((t) => {
            const Icon = TYPE_ICONS[t];
            return (
              <button
                key={t}
                className={`card type-tile ${type === t ? 'on' : ''}`}
                onClick={() => setType(type === t ? '' : t)}
                aria-pressed={type === t}
              >
                <span className="doc-icon"><Icon size={16} /></span>
                <span>
                  <span className="stat-value">{counts[t] ?? 0}</span>
                  <span className="muted small tile-label">{typeCount(t, counts[t] ?? 0).replace(/^\d+ /, '')}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="toolbar">
        <div className="input-icon">
          <Search size={15} className="muted" />
          <input placeholder="Filter by title, author, publication or topic" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {docs && docs.length === 0 && (
        <div className="card empty-state">
          <Inbox size={28} />
          <h3>{q || type ? 'No matching documents' : 'The archive is empty'}</h3>
          <p className="muted">{q || type ? 'Try a different filter.' : 'Upload articles, transcripts or footage notes to get started.'}</p>
        </div>
      )}

      {docs && docs.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Author / Source</th>
                <th>Date</th>
                <th>Added</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td>
                    <button className="link title-link" onClick={() => setViewing(d.id)}>{d.title}</button>
                    {d.topic && <div className="muted small">{d.topic}</div>}
                  </td>
                  <td><span className="badge">{CONTENT_TYPE_LABELS[d.content_type] ?? d.content_type}</span></td>
                  <td className="muted">{[d.author, d.publication].filter(Boolean).join(' · ') || '—'}</td>
                  <td className="muted nowrap">{formatDate(d.date)}</td>
                  <td className="muted nowrap small">{timeAgo(d.created_at)}</td>
                  <td className="right nowrap">
                    {confirmDelete === d.id ? (
                      <>
                        <button className="btn danger small" onClick={() => remove(d.id)}>Delete</button>{' '}
                        <button className="btn ghost small" onClick={() => setConfirmDelete(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="icon-btn" title="Delete" aria-label="Delete" onClick={() => setConfirmDelete(d.id)}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={(doc) => {
            setShowUpload(false);
            setNotice(`“${doc.title}” was indexed into ${doc.chunk_count} searchable passage${doc.chunk_count === 1 ? '' : 's'}.`);
            load();
            loadCounts();
          }}
        />
      )}
      {viewing && <DocumentViewer docId={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
