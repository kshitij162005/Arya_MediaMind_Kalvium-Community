import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api';
import { SourceMeta } from './SourceCard';

/** Side panel showing the exact passage behind a citation, with surrounding context. */
export default function PassagePanel({ citation, onClose, onOpenDocument }) {
  const { claim, source } = citation;
  const docId = source.doc_id;
  const start = claim ? claim.start : source.start;
  const end = claim ? claim.end : source.end;

  const [passage, setPassage] = useState(null);
  const [error, setError] = useState('');

  // Parent re-keys this panel per citation, so state starts fresh for each one.
  useEffect(() => {
    api.passage(docId, start, end).then(setPassage).catch((e) => setError(e.message));
  }, [docId, start, end]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="panel" role="dialog" aria-label="Source passage">
        <div className="panel-head">
          <span className="muted small">Source {source.n}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <h3>{source.title}</h3>
        <SourceMeta source={source} />

        {claim && (
          <div className="claim">
            <span className="muted small">Claim in answer</span>
            <p>{claim.text}</p>
          </div>
        )}

        <span className="muted small">{claim ? 'Exact passage in original document' : 'Best matching passage'}</span>
        {error && <div className="alert error">{error}</div>}
        {!passage && !error && <div className="skeleton small" />}
        {passage && (
          <div className="passage">
            <span className="context">{passage.before}</span>
            <mark>{passage.passage}</mark>
            <span className="context">{passage.after}</span>
          </div>
        )}

        <button className="btn block" onClick={() => onOpenDocument({ docId, start, end })}>
          Open full document
        </button>
      </aside>
    </>
  );
}
