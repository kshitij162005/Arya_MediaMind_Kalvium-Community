import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AlertTriangle, Check, Copy, Globe, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { api, formatDate } from '../api';
import Filters from './Filters';
import { EMPTY_FILTERS, activeFilterCount } from '../filters';
import SourceCard from './SourceCard';
import PassagePanel from './PassagePanel';
import DocumentViewer from './DocumentViewer';
import UploadModal from './UploadModal';
import HomeOverview from './HomeOverview';
import ListenButton from './ListenButton';
import { useSpeech } from '../speech';

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

function greeting(name) {
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return `${part}, ${name.split(' ')[0]}`;
}

/** Plain-text answer with [n] markers and a numbered source list, for pasting into a draft. */
function answerAsText(result) {
  const cited = result.sources.filter((s) => s.cited);
  const body = result.answer.map((c) => `${c.text} [${c.source}]`).join(' ');
  const refs = cited.map((s) =>
    `[${s.n}] ${[s.title, s.author, s.publication, s.content_type === 'web' ? null : s.date && formatDate(s.date), s.url]
      .filter(Boolean).join(', ')}`);
  return `${body}\n\nSources:\n${refs.join('\n')}`;
}

function CopyButton({ result }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(answerAsText(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked; nothing useful to show */
    }
  };
  return (
    <button className="btn ghost small" onClick={copy} title="Copy the answer with its source list">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied' : 'Copy with citations'}
    </button>
  );
}

const answerSpeechId = (kind, result) => `${kind}:${result.query}:${result.took_ms}`;

function AnswerText({ result, citation, onCite, speechId }) {
  const sourcesByN = Object.fromEntries(result.sources.map((s) => [s.n, s]));
  const speech = useSpeech();
  const reading = speech.id === speechId ? speech.index : -1;
  return (
    <p className="answer-text">
      {result.answer.map((claim, i) => (
        <span key={i} className={i === reading ? 'speaking' : undefined}>
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

function SourceList({ title, sources, settings, onCite, onOpen, onSave }) {
  const shown = settings.showRelated ? sources : sources.filter((s) => s.cited);
  if (!shown.length) return null;
  return (
    <section>
      <div className="section-head">
        <h2>{title}</h2>
        {!settings.showRelated && shown.length < sources.length && (
          <span className="muted small">{sources.length - shown.length} related hidden</span>
        )}
      </div>
      <div className="source-list">
        {shown.map((s) => (
          <SourceCard
            key={s.doc_id}
            source={s}
            showScore={settings.showScores}
            onViewPassage={() => onCite({ source: s })}
            onOpen={() => onOpen({ docId: s.doc_id, start: s.start, end: s.end })}
            onSave={() => onSave?.(s)}
            listen={<ListenButton variant="link" id={`source:${s.doc_id}:${s.start}`} parts={[s.title, s.snippet]} />}
          />
        ))}
      </div>
    </section>
  );
}

export default function SearchPage({ ref, active, user, settings }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [facets, setFacets] = useState(null);
  const [overview, setOverview] = useState(null);
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
  const inputRef = useRef(null);

  useEffect(() => {
    api.facets().then(setFacets).catch(() => {});
  }, []);

  const loadOverview = () => api.overview().then(setOverview).catch(() => {});

  // Refresh on every return to the tab so new uploads and searches show up straight away.
  useEffect(() => {
    if (active) loadOverview();
  }, [active]);

  // "/" focuses the search box from anywhere on the page.
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  const onWebSourceSaved = (doc) => {
    const url = savingSource.url;
    setSavingSource(null);
    setNotice(`“${doc.title}” was added to the archive (${doc.chunk_count} searchable passage${doc.chunk_count === 1 ? '' : 's'}).`);
    setWeb((w) => w?.result && {
      ...w,
      result: { ...w.result, sources: w.result.sources.map((s) => (s.url === url ? { ...s, in_archive: true } : s)) },
    });
    loadOverview();
  };

  const examples = overview ? suggestionsFrom(overview.recent_documents) : [];
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

  const ask = (q, f = filters) => {
    setQuery(q);
    runSearch(q, f);
  };

  // Back to the home view.
  const reset = () => {
    requestId.current++;
    lastQuery.current = '';
    setQuery('');
    setResult(null);
    setError('');
    setLoading(false);
    setWeb(null);
    setNotice('');
    loadOverview();
    inputRef.current?.focus();
  };

  // Lets other pages (History) run a query here.
  useImperativeHandle(ref, () => ({ run: (q) => ask(q) }));

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

  const browseTopic = (topic) => {
    const next = { ...EMPTY_FILTERS, topics: [topic] };
    setFilters(next);
    ask(`Tell me about ${topic}`, next);
  };

  const filterCount = activeFilterCount(filters);
  const hasResults = result || loading || error;

  return (
    <div className={`search-page ${hasResults ? 'has-results' : ''}`}>
      {!hasResults && (
        <div className="hero">
          <span className="kicker"><Sparkles size={14} /> {greeting(user.name)}</span>
          <h1>Ask the archive</h1>
          <p className="muted">Answers are built only from archived articles, interviews and footage notes, and every sentence is cited.</p>
        </div>
      )}

      <form className="search-bar" onSubmit={(e) => { e.preventDefault(); runSearch(); }}>
        <Search size={18} className="muted" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question, e.g. What happened during the 2019 protests in Mumbai?"
          aria-label="Search the archive"
          autoFocus
        />
        {query || hasResults ? (
          <button type="button" className="icon-btn" onClick={reset} title="Clear and go back" aria-label="Clear search">
            <X size={16} />
          </button>
        ) : (
          <kbd className="kbd" title="Press / to search">/</kbd>
        )}
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
        <>
          <div className="examples">
            <span className="muted small">Try</span>
            {shownExamples.map((ex) => (
              <button key={ex} className="chip" onClick={() => ask(ex)}>{ex}</button>
            ))}
          </div>
          {settings.showOverview && overview && (
            <HomeOverview
              overview={overview}
              onSearch={(q) => ask(q)}
              onTopic={browseTopic}
              onOpenDoc={(docId) => setViewerDoc({ docId })}
            />
          )}
        </>
      )}

      {error && <div className="alert error">{error}</div>}

      {loading && !result && <div className="card skeleton" />}

      {result && (
        <div className={`results ${loading ? 'stale' : ''}`}>
          <section className="card answer">
            <div className="section-head">
              <h2>Background</h2>
              <div className="row">
                <span className="muted small">
                  {result.sources.length} source{result.sources.length === 1 ? '' : 's'} · {result.took_ms} ms
                </span>
                {result.sufficient && (
                  <>
                    <ListenButton id={answerSpeechId('archive', result)} parts={result.answer.map((c) => c.text)} />
                    <CopyButton result={result} />
                  </>
                )}
              </div>
            </div>

            {result.sufficient ? (
              <>
                <AnswerText result={result} citation={citation} onCite={setCitation} speechId={answerSpeechId('archive', result)} />
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
                  {settings.webFallback && !web && (
                    <button className="btn small web-btn" onClick={searchWeb}>
                      <Globe size={14} /> Search the web instead
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          <SourceList title="Sources" sources={result.sources} settings={settings} onCite={setCitation} onOpen={setViewerDoc} />

          {web?.loading && (
            <div className="card web-loading">
              <Globe size={16} className="spin-slow" />
              <span className="muted">Searching Wikipedia and the web and reading pages… this can take 10–15 seconds.</span>
            </div>
          )}
          {web?.error && <div className="alert error">Web search failed: {web.error}</div>}
          {web?.result && (
            <>
              <section className="card answer web-answer">
                <div className="section-head">
                  <h2><Globe size={16} /> From the web</h2>
                  <div className="row">
                    <span className="muted small">
                      {web.result.pages_read} page{web.result.pages_read === 1 ? '' : 's'} read · {web.result.took_ms} ms
                    </span>
                    {web.result.sufficient && (
                      <>
                        <ListenButton id={answerSpeechId('web', web.result)} parts={web.result.answer.map((c) => c.text)} />
                        <CopyButton result={web.result} />
                      </>
                    )}
                  </div>
                </div>
                <p className="web-warning small">
                  Not from the archive and not verified by the newsroom. Check each source before using it.
                </p>
                {web.result.sufficient ? (
                  <AnswerText result={web.result} citation={citation} onCite={setCitation} speechId={answerSpeechId('web', web.result)} />
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
                settings={settings}
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
