import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api';
import { SourceMeta } from './SourceCard';
import ListenButton from './ListenButton';

/** Side panel showing the exact passage behind a citation, with surrounding context. */
export default function PassagePanel({ citation, onClose, onOpenDocument }) {
  const { claim, source } = citation;
  const docId = source.doc_id;
  const start = claim ? claim.start : source.start;
  const end = claim ? claim.end : source.end;

  // Web results arrive with their passage attached, since web pages are not stored.
  const preloaded = (claim ?? source).passage ?? null;
  const isWeb = source.content_type === 'web';
  const [passage, setPassage] = useState(preloaded);
  const [error, setError] = useState('');

  // Parent re-keys this panel per citation, so state starts fresh for each one.
  useEffect(() => {
    if (preloaded) return;
    api.passage(docId, start, end).then(setPassage).catch((e) => setError(e.message));
  }, [docId, start, end, preloaded]);

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
          <span className="muted small">{isWeb ? 'Web source' : 'Source'} {source.n}</span>
          <div className="row">
            {passage && (
              <ListenButton
                id={`passage:${docId}:${start}`}
                label="Listen to passage"
                parts={[passage.before, passage.passage, passage.after]}
              />
            )}
            <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
          </div>
        </div>

        <h3>{source.title}</h3>
        <SourceMeta source={source} />

        {claim && (
          <div className="claim">
            <span className="muted small">Claim in answer</span>
            <p>{claim.text}</p>
          </div>
        )}

        <span className="muted small">{claim ? `Exact passage in original ${isWeb ? 'page' : 'document'}` : 'Best matching passage'}</span>
        {error && <div className="alert error">{error}</div>}
        {!passage && !error && <div className="skeleton small" />}
        {passage && (
          <div className="passage">
            <span className="context">{passage.before}</span>
            <mark>{passage.passage}</mark>
            <span className="context">{passage.after}</span>
          </div>
        )}

        {isWeb ? (
          <a className="btn block" href={source.url} target="_blank" rel="noopener noreferrer">
            Open web page ↗
          </a>
        ) : (
          <button className="btn block" onClick={() => onOpenDocument({ docId, start, end })}>
            Open full document
          </button>
        )}
      </aside>
    </>
  );
}
