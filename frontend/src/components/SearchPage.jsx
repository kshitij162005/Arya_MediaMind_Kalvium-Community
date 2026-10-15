import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Search, SlidersHorizontal, AlertTriangle, Globe } from 'lucide-react';
import { api } from '../api';
import Filters from './Filters';
import { EMPTY_FILTERS, activeFilterCount } from '../filters';
import SourceCard from './SourceCard';
import PassagePanel from './PassagePanel';
import DocumentViewer from './DocumentViewer';
import UploadModal from './UploadModal';

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

function AnswerText({ result, citation, onCite }) {
  const sourcesByN = Object.fromEntries(result.sources.map((s) => [s.n, s]));
  return (
    <p className="answer-text">
      {result.answer.map((claim, i) => (
        <span key={i}>
          {claim.text}{' '}
          <button
            className={`cite ${citation?.claim === claim ? 'active' : ''}`}
            onClick={() => onCite({ claim, source: sourcesByN[claim.source] })}
            title={`Verify against source ${claim.source}`}
          >
            {claim.source}
          </button>{' '}
        </span>
      ))}
    </p>
  );
}

function SourceList({ title, sources, onCite, onOpen, onSave }) {
  if (!sources.length) return null;
  return (
    <section>
      <h2 className="section-title">{title}</h2>
      <div className="source-list">
        {sources.map((s) => (
          <SourceCard
            key={s.doc_id}
            source={s}
            onViewPassage={() => onCite({ source: s })}
            onOpen={() => onOpen({ docId: s.doc_id, start: s.start, end: s.end })}
            onSave={() => onSave?.(s)}
          />
        ))}
      </div>
    </section>
  );
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
  const [web, setWeb] = useState(null); // { loading, result?, error? } for the opt-in web fallback
  const [savingSource, setSavingSource] = useState(null); // web source being saved to the archive
  const [notice, setNotice] = useState('');
  const lastQuery = useRef('');
  const requestId = useRef(0);

  const [examples, setExamples] = useState([]);

  useEffect(() => {
    api.facets().then(setFacets).catch(() => {});
  }, []);

  const loadExamples = () =>
    api.documents({ sort: 'recent', limit: 20 })
      .then((docs) => setExamples(suggestionsFrom(docs)))
      .catch(() => {});

  // Refresh on every return to the tab so new uploads show up straight away.
  useEffect(() => {
    if (active) loadExamples();
  }, [active]);

  const onWebSourceSaved = (doc) => {
    const url = savingSource.url;
    setSavingSource(null);
    setNotice(`“${doc.title}” was added to the archive (${doc.chunk_count} searchable passage${doc.chunk_count === 1 ? '' : 's'}).`);
    setWeb((w) => w?.result && {
      ...w,
      result: { ...w.result, sources: w.result.sources.map((s) => (s.url === url ? { ...s, in_archive: true } : s)) },
    });
    loadExamples();
  };

  const shownExamples = examples.length ? examples : FALLBACK_EXAMPLES;

  const runSearch = async (q = query, f = filters) => {
    const text = q.trim();
    if (text.length < 3) return;
    lastQuery.current = text;
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    setCitation(null);
    setWeb(null);
    setNotice('');
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

  const searchWeb = async () => {
    const id = requestId.current;
    setWeb({ loading: true });
    try {
      const res = await api.searchWeb(lastQuery.current);
      if (id === requestId.current) setWeb({ result: res });
    } catch (err) {
      if (id === requestId.current) setWeb({ error: err.message });
    }
  };

  const changeFilters = (next) => {
    setFilters(next);
    if (lastQuery.current) runSearch(lastQuery.current, next);
  };

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
                <AnswerText result={result} citation={citation} onCite={setCitation} />
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
                  {!web && (
                    <button className="btn small web-btn" onClick={searchWeb}>
                      <Globe size={14} /> Search the web instead
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          <SourceList title="Sources" sources={result.sources} onCite={setCitation} onOpen={setViewerDoc} />

          {web?.loading && <div className="card skeleton" />}
          {web?.error && <div className="alert error">Web search failed: {web.error}</div>}
          {web?.result && (
            <>
              <section className="card answer web-answer">
                <div className="section-head">
                  <h2><Globe size={16} /> From the web</h2>
                  <span className="muted small">
                    {web.result.pages_read} page{web.result.pages_read === 1 ? '' : 's'} read · {web.result.took_ms} ms
                  </span>
                </div>
                <p className="web-warning small">
                  Not from the archive and not verified by the newsroom. Check each source before using it.
                </p>
                {web.result.sufficient ? (
                  <AnswerText result={web.result} citation={citation} onCite={setCitation} />
                ) : (
                  <p className="muted">The web search didn't turn up anything that answers this question.</p>
                )}
                {web.result.failed_providers.length > 0 && (
                  <p className="muted small note">
                    Unavailable right now: {web.result.failed_providers.join(', ')}.
                  </p>
                )}
              </section>
              {notice && <div className="alert success" onClick={() => setNotice('')}>{notice}</div>}
              <SourceList
                title="Web sources"
                sources={web.result.sources}
                onCite={setCitation}
                onOpen={setViewerDoc}
                onSave={setSavingSource}
              />
            </>
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
      {savingSource && (
        <UploadModal
          heading="Save web page to archive"
          initial={savingSource.save}
          onClose={() => setSavingSource(null)}
          onUploaded={onWebSourceSaved}
        />
      )}
    </div>
  );
}
