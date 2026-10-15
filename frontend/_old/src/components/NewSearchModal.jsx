import React, { useState } from 'react';
import { Search, X, Filter, Calendar, BookOpen, User, Tag, Sparkles, ArrowRight } from 'lucide-react';

export default function NewSearchModal({ isOpen, onClose, onExecuteSearch }) {
  const [query, setQuery] = useState('What happened during the 2019 protests in Mumbai?');
  const [dateFilter, setDateFilter] = useState('2019');
  const [contentType, setContentType] = useState('All Sources');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onExecuteSearch) {
      onExecuteSearch(query, { dateFilter, contentType });
    }
    onClose();
  };

  const sampleQueries = [
    "Chronology & Escalation Metrics of 2019 South Mumbai Coastal Reclamation Rallies",
    "What judicial petitions were filed regarding Churchgate arterial traffic detours?",
    "Port authority barge transit manifests during June 2019 protests",
    "Did law enforcement report custodial detentions during coastal reclamation rallies?"
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window search-dialog-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="scanned-pill">
              <Sparkles size={14} className="text-cyan" />
              NATURAL LANGUAGE ARCHIVE QUERY
            </span>
            <span className="modal-doc-title">Deep Archive Neural Search</span>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="search-modal-form">
          <div className="search-input-wrapper-lg">
            <Search size={18} className="search-input-icon text-cyan" />
            <input 
              type="text" 
              className="search-input-field-lg" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask an investigative question or query archival syntax..."
              autoFocus
            />
            <button type="submit" className="search-submit-btn">
              <span>Query Archive</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Filter options row */}
          <div className="search-filters-bar">
            <div className="filter-pill-item">
              <Calendar size={13} className="text-slate" />
              <span>Year Range:</span>
              <select 
                className="filter-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="All">All Years (1989-2024)</option>
                <option value="2019">2019 Focus Period</option>
                <option value="2010-2020">2010 – 2020 Decade</option>
              </select>
            </div>

            <div className="filter-pill-item">
              <BookOpen size={13} className="text-slate" />
              <span>Type:</span>
              <select 
                className="filter-select"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              >
                <option value="All Sources">All Archives (Press, Judicial, Police)</option>
                <option value="Print Press">Print Press Editions</option>
                <option value="Judicial Records">Judicial Writs & Directives</option>
                <option value="Official Police Logs">Official Police SitReps</option>
              </select>
            </div>

            <div className="filter-tag-hint">
              <span>2.4M records indexed</span>
            </div>
          </div>

          {/* Quick inquiries list */}
          <div className="suggested-queries-section">
            <div className="suggested-heading">SUGGESTED INVESTIGATIVE QUERIES</div>
            <div className="suggested-list">
              {sampleQueries.map((q, idx) => (
                <button 
                  type="button" 
                  key={idx} 
                  className="suggested-item-btn"
                  onClick={() => {
                    setQuery(q);
                  }}
                >
                  <Search size={12} className="text-cyan-dim" />
                  <span className="suggested-text">{q}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
