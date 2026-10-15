import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Search, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { api } from '../api';
import Filters from './Filters';
import { EMPTY_FILTERS, activeFilterCount } from '../filters';
import SourceCard from './SourceCard';
import PassagePanel from './PassagePanel';
import DocumentViewer from './DocumentViewer';

const FALLBACK_EXAMPLES = [
  'What happened during the 2019 protests in Mumbai?',
  'How did the India-China border tensions develop?',
  'Why did Chennai run out of water in 2019?',
];
const MAX_SUGGESTIONS = 3;

// One suggestion per subject, newest uploads first.
function suggestionsFrom(docs) {
  const seen = new Set();
  const out = [];
  for (const doc of docs) {
    const subject = (doc.topic || doc.title).trim();
    if (!subject || seen.has(subject.toLowerCase())) continue;
    seen.add(subject.toLowerCase());
    out.push(`Tell me about ${subject}`);
    if (out.length === MAX_SUGGESTIONS) break;
  }
  return out;
}

export default function SearchPage({ ref, active }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [facets, setFacets] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [citation, setCitation] = useState(null); // { claim?, source }
  const [viewerDoc, setViewerDoc] = useState(null); // { docId, start, end }
  const lastQuery = useRef('');
  const requestId = useRef(0);

  const [examples, setExamples] = useState([]);

  useEffect(() => {
    api.facets().then(setFacets).catch(() => {});
  }, []);

  // Refresh on every return to the tab so new uploads show up straight away.
  useEffect(() => {
    if (!active) return;
    api.documents({ sort: 'recent', limit: 20 })
      .then((docs) => setExamples(suggestionsFrom(docs)))
      .catch(() => {});
  }, [active]);

  const shownExamples = examples.length ? examples : FALLBACK_EXAMPLES;

  const runSearch = async (q = query, f = filters) => {
    const text = q.trim();
    if (text.length < 3) return;
    lastQuery.current = text;
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    setCitation(null);
    try {
      const res = await api.search(text, f);
      if (id === requestId.current) setResult(res);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err.message);
      setResult(null);
    } finally {
      // Only the newest search may update the screen; older responses are dropped.
      if (id === requestId.current) setLoading(false);
    }
  };

  // Lets other pages (History) run a query here.
  useImperativeHandle(ref, () => ({
    run(q) {
      setQuery(q);
      runSearch(q, filters);
    },
  }));

  const changeFilters = (next) => {
    setFilters(next);
    if (lastQuery.current) runSearch(lastQuery.current, next);
  };

  const sourcesByN = Object.fromEntries((result?.sources ?? []).map((s) => [s.n, s]));
  const filterCount = activeFilterCount(filters);
  const hasResults = result || loading || error;

  return (
    <div className={`search-page ${hasResults ? 'has-results' : ''}`}>
      {!hasResults && (
        <div className="hero">
          <h1>Ask the archive</h1>
          <p className="muted">Answers are built only from archived articles, interviews and footage notes, and every sentence is cited.</p>
        </div>
      )}

      <form className="search-bar" onSubmit={(e) => { e.preventDefault(); runSearch(); }}>
        <Search size={18} className="muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question, e.g. What happened during the 2019 protests in Mumbai?"
          autoFocus
        />
        <button
          type="button"
          className={`btn ghost ${showFilters || filterCount ? 'on' : ''}`}
          onClick={() => {
            if (!showFilters) api.facets().then(setFacets).catch(() => {});
            setShowFilters(!showFilters);
          }}
        >
          <SlidersHorizontal size={15} />
          Filters{filterCount ? ` (${filterCount})` : ''}
        </button>
        <button className="btn primary" disabled={loading || query.trim().length < 3}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {showFilters && facets && <Filters facets={facets} value={filters} onChange={changeFilters} />}

      {!hasResults && (
        <div className="examples">
          {shownExamples.map((ex) => (
            <button key={ex} className="chip" onClick={() => { setQuery(ex); runSearch(ex); }}>
              {ex}
            </button>
          ))}
        </div>
      )}

      {error && <div className="alert error">{error}</div>}

      {loading && !result && <div className="card skeleton" />}

      {result && (
        <div className={`results ${loading ? 'stale' : ''}`}>
          <section className="card answer">
            <div className="section-head">
              <h2>Background</h2>
              <span className="muted small">
                {result.sources.length} source{result.sources.length === 1 ? '' : 's'} · {result.took_ms} ms
              </span>
            </div>

            {result.sufficient ? (
              <>
                <p className="answer-text">
                  {result.answer.map((claim, i) => (
                    <span key={i}>
                      {claim.text}{' '}
                      <button
                        className={`cite ${citation?.claim === claim ? 'active' : ''}`}
                        onClick={() => setCitation({ claim, source: sourcesByN[claim.source] })}
                        title={`Verify against source ${claim.source}`}
                      >
                        {claim.source}
                      </button>{' '}
                    </span>
                  ))}
                </p>
                <p className="muted small note">
                  Extracted verbatim from archive documents. Click a number to see the exact passage.
                </p>
              </>
            ) : (
              <div className="not-found">
                <AlertTriangle size={18} />
                <div>
                  <strong>Not enough information in the archive.</strong>
                  <p className="muted">
                    No archived document answers this question with confidence, so no answer was generated.
                    {filterCount > 0 && ' Try removing some filters.'}
                  </p>
                </div>
              </div>
            )}
          </section>

          {result.sources.length > 0 && (
            <section>
              <h2 className="section-title">Sources</h2>
              <div className="source-list">
                {result.sources.map((s) => (
                  <SourceCard
                    key={s.doc_id}
                    source={s}
                    onViewPassage={() => setCitation({ source: s })}
                    onOpen={() => setViewerDoc({ docId: s.doc_id, start: s.start, end: s.end })}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {citation && (
        <PassagePanel
          key={`${citation.source.doc_id}:${citation.claim?.start ?? 'source'}`}
          citation={citation}
          onClose={() => setCitation(null)}
          onOpenDocument={(range) => {
            setCitation(null);
            setViewerDoc(range);
          }}
        />
      )}
      {viewerDoc && <DocumentViewer {...viewerDoc} onClose={() => setViewerDoc(null)} />}
    </div>
  );
}
