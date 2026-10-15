import { CONTENT_TYPE_LABELS, formatDate } from '../api';

export function SourceMeta({ source }) {
  // Web pages have no reliable publication date; the domain stands in for the publication.
  const date = source.content_type === 'web' ? null : formatDate(source.date);
  return (
    <div className="meta">
      <span className={`badge ${source.content_type === 'web' ? 'web' : ''}`}>
        {CONTENT_TYPE_LABELS[source.content_type] ?? source.content_type}
      </span>
      {[source.author, source.publication, date].filter(Boolean).join(' · ')}
    </div>
  );
}

export default function SourceCard({ source, onViewPassage, onOpen }) {
  const isWeb = source.content_type === 'web';
  return (
    <article className={`card source ${source.cited ? '' : 'uncited'}`}>
      <div className="source-num">{source.n}</div>
      <div className="source-body">
        <h3>{source.title}</h3>
        <SourceMeta source={source} />
        <p className="snippet">{source.snippet}</p>
        <div className="source-actions">
          <button className="link" onClick={onViewPassage}>View passage</button>
          {isWeb ? (
            <a className="link" href={source.url} target="_blank" rel="noopener noreferrer">Open page ↗</a>
          ) : (
            <button className="link" onClick={onOpen}>Open document</button>
          )}
          <span className="muted small push">
            {source.cited ? 'Cited' : 'Related, not cited'} · {Math.round(source.score * 100)}% match
          </span>
        </div>
      </div>
    </article>
  );
}
