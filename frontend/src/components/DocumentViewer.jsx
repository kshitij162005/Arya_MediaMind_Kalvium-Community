import { useEffect, useRef, useState } from 'react';
import { Download, X } from 'lucide-react';
import { api, CONTENT_TYPE_LABELS, formatDate } from '../api';

/** Full original document, with an optional highlighted range scrolled into view. */
export default function DocumentViewer({ docId, start, end, onClose }) {
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  const markRef = useRef(null);

  useEffect(() => {
    api.document(docId).then(setDoc).catch((e) => setError(e.message));
  }, [docId]);

  useEffect(() => {
    markRef.current?.scrollIntoView({ block: 'center' });
  }, [doc]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const hasRange = Number.isInteger(start) && Number.isInteger(end) && end > start;

  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="modal doc-viewer" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="panel-head">
          <span className="muted small">Original document</span>
          <div className="row">
            {doc?.file_name && (
              <button className="btn ghost small" onClick={() => api.openOriginal(docId).catch((e) => setError(e.message))}>
                <Download size={14} /> {doc.file_name}
              </button>
            )}
            <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}
        {!doc && !error && <div className="skeleton" />}
        {doc && (
          <>
            <h2 className="doc-title">{doc.title}</h2>
            <div className="meta">
              <span className="badge">{CONTENT_TYPE_LABELS[doc.content_type] ?? doc.content_type}</span>
              {[doc.author, doc.publication, formatDate(doc.date), doc.topic].filter(Boolean).join(' · ')}
            </div>
            {doc.url && (
              <a className="link small" href={doc.url} target="_blank" rel="noreferrer">{doc.url}</a>
            )}
            <div className="doc-text">
              {hasRange ? (
                <>
                  {doc.text.slice(0, start)}
                  <mark ref={markRef}>{doc.text.slice(start, end)}</mark>
                  {doc.text.slice(end)}
                </>
              ) : (
                doc.text
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
