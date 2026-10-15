import { FileText, Film, Hash, Layers, Mic, Newspaper, Search, CalendarRange } from 'lucide-react';
import { CONTENT_TYPE_LABELS, timeAgo, typeCount } from '../api';

const TYPE_ICONS = { article: Newspaper, interview: Mic, footage_notes: Film, document: FileText };
// Accent strength per content type, so the breakdown bar follows the chosen accent colour.
const TYPE_SHADES = { article: 100, interview: 70, footage_notes: 45, document: 25 };

function Stat({ icon: Icon, label, value, sub, children }) {
  return (
    <div className="card stat">
      <span className="stat-label"><Icon size={14} /> {label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="muted small">{sub}</span>}
      {children}
    </div>
  );
}

export default function HomeOverview({ overview, onSearch, onTopic, onOpenDoc }) {
  const o = overview;
  const types = Object.keys(CONTENT_TYPE_LABELS).filter((t) => o.by_type[t]);
  const years = o.year_min ? (o.year_min === o.year_max ? `${o.year_min}` : `${o.year_min}–${o.year_max}`) : '—';
  const answeredPct = o.searches ? Math.round((o.answered / o.searches) * 100) : null;

  return (
    <div className="overview">
      <div className="stats">
        <Stat icon={Layers} label="Documents" value={o.documents.toLocaleString()}>
          {o.documents > 0 && (
            <>
              <div className="type-bar" aria-hidden="true">
                {types.map((t) => (
                  <span
                    key={t}
                    style={{ flex: o.by_type[t], '--shade': `${TYPE_SHADES[t]}%` }}
                    title={`${CONTENT_TYPE_LABELS[t]}: ${o.by_type[t]}`}
                  />
                ))}
              </div>
              <span className="muted small">
                {types.map((t) => typeCount(t, o.by_type[t])).join(' · ')}
              </span>
            </>
          )}
        </Stat>
        <Stat icon={Hash} label="Searchable passages" value={o.passages.toLocaleString()} sub="Indexed for semantic search" />
        <Stat icon={CalendarRange} label="Years covered" value={years} sub={`${o.topics.length} topic${o.topics.length === 1 ? '' : 's'}`} />
        <Stat
          icon={Search}
          label="Your searches"
          value={o.searches.toLocaleString()}
          sub={answeredPct === null ? 'Ask your first question above' : `${answeredPct}% answered from the archive`}
        />
      </div>

      <div className="home-grid">
        <section className="card list-card">
          <div className="section-head">
            <h2>Recently added</h2>
            <span className="muted small">Newest first</span>
          </div>
          {o.recent_documents.length === 0 && <p className="muted small">No documents yet. Upload one from the Archive tab.</p>}
          <ul className="doc-list">
            {o.recent_documents.slice(0, 5).map((d) => {
              const Icon = TYPE_ICONS[d.content_type] ?? FileText;
              return (
                <li key={d.id}>
                  <button className="doc-row" onClick={() => onOpenDoc(d.id)}>
                    <span className="doc-icon"><Icon size={16} /></span>
                    <span className="doc-row-body">
                      <span className="doc-row-title">{d.title}</span>
                      <span className="muted small">
                        {[CONTENT_TYPE_LABELS[d.content_type], d.publication].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    <span className="muted small nowrap">{timeAgo(d.created_at)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="home-side">
          <section className="card list-card">
            <div className="section-head">
              <h2>Recent searches</h2>
            </div>
            {o.recent_searches.length === 0 && <p className="muted small">Your searches will appear here.</p>}
            <ul className="search-list">
              {o.recent_searches.map((s) => (
                <li key={s.id}>
                  <button className="search-row" onClick={() => onSearch(s.query)}>
                    <span className={`dot ${s.sufficient ? 'ok' : 'miss'}`} title={s.sufficient ? 'Answered' : 'Not found'} />
                    <span className="search-row-query">{s.query}</span>
                    <span className="muted small nowrap">{timeAgo(s.created_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {o.topics.length > 0 && (
            <section className="card list-card">
              <div className="section-head">
                <h2>Browse by topic</h2>
              </div>
              <div className="chips">
                {o.topics.map((t) => (
                  <button key={t.topic} className="chip topic-chip" onClick={() => onTopic(t.topic)}>
                    {t.topic} <span className="chip-count">{t.count}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
