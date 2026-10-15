import { CONTENT_TYPE_LABELS } from '../api';
import { EMPTY_FILTERS, activeFilterCount } from '../filters';

function SelectFilter({ label, options, value, onChange }) {
  return (
    <label className="field compact">
      <span>{label}</span>
      <select value={value[0] ?? ''} onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}>
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export default function Filters({ facets, value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const years = [];
  if (facets.year_max) for (let y = facets.year_max; y >= facets.year_min; y--) years.push(y);

  const toggleType = (t) =>
    set({
      content_types: value.content_types.includes(t)
        ? value.content_types.filter((x) => x !== t)
        : [...value.content_types, t],
    });

  return (
    <div className="card filters">
      <div className="filter-row">
        <span className="filter-label">Type</span>
        <div className="chips">
          {facets.content_types.map((t) => (
            <button
              key={t}
              className={`chip ${value.content_types.includes(t) ? 'on' : ''}`}
              onClick={() => toggleType(t)}
            >
              {CONTENT_TYPE_LABELS[t] ?? t}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-grid">
        <label className="field compact">
          <span>From year</span>
          <select value={value.year_from ?? ''} onChange={(e) => set({ year_from: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Any</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label className="field compact">
          <span>To year</span>
          <select value={value.year_to ?? ''} onChange={(e) => set({ year_to: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Any</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <SelectFilter label="Topic" options={facets.topics} value={value.topics} onChange={(v) => set({ topics: v })} />
        <SelectFilter label="Author" options={facets.authors} value={value.authors} onChange={(v) => set({ authors: v })} />
        <SelectFilter label="Publication" options={facets.publications} value={value.publications} onChange={(v) => set({ publications: v })} />
      </div>

      {activeFilterCount(value) > 0 && (
        <button className="link small" onClick={() => onChange(EMPTY_FILTERS)}>Clear all filters</button>
      )}
    </div>
  );
}
