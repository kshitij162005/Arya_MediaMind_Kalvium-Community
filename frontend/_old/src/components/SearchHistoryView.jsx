import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Clock,
  RotateCcw,
  Shield,
  Bookmark,
  Calendar,
  User,
  ChevronDown,
  Share2,
  FolderArchive,
  AlertTriangle,
  Scale,
  Users,
  Copy,
  FileEdit,
  Folder,
  Code2,
  ExternalLink,
  X
} from 'lucide-react';
import { SEARCH_HISTORY_ITEMS } from '../mockData';

export default function SearchHistoryView({ onNavigateToResults, onOpenPdf, showToast }) {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedRange, setSelectedRange] = useState('7days'); // '7days' | '30days' | '2024' | 'custom'
  const [selectedUser, setSelectedUser] = useState('Elena Rostova (You)');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [strictModeOnly, setStrictModeOnly] = useState(true);
  const [isStrictDropdownOpen, setIsStrictDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('saved'); // 'all' | 'saved' | 'unsaved'
  const [currentPage, setCurrentPage] = useState(1);
  const [savedItemMap, setSavedItemMap] = useState(() => {
    const initial = {};
    SEARCH_HISTORY_ITEMS.forEach(item => {
      initial[item.id] = item.isSaved;
    });
    return initial;
  });

  // Toggle bookmark save status
  const handleToggleSave = (itemId, headline, e) => {
    e.stopPropagation();
    setSavedItemMap(prev => {
      const nextState = !prev[itemId];
      if (showToast) {
        showToast(
          nextState 
            ? `Query saved to private dossier: ${headline.slice(0, 35)}...` 
            : `Removed query from saved research: ${headline.slice(0, 35)}...`,
          nextState ? 'success' : 'info'
        );
      }
      return { ...prev, [itemId]: nextState };
    });
  };

  // Re-run query
  const handleRerunQuery = (item, e) => {
    e.stopPropagation();
    if (showToast) {
      showToast(`Re-executing query ${item.queryId} against cold vault index...`, 'info');
    }
    if (onNavigateToResults) {
      setTimeout(() => {
        onNavigateToResults(item.headline);
      }, 400);
    }
  };

  // Open Dossier
  const handleOpenDossier = (item, e) => {
    e.stopPropagation();
    if (showToast) {
      showToast(`Opened Investigation Dossier for ${item.queryId}`, 'info');
    }
    if (onOpenPdf && item.citationId) {
      onOpenPdf(item.citationId);
    }
  };

  // Share / Export Query
  const handleShareQuery = (item, e) => {
    e.stopPropagation();
    const permalink = `https://mediamind.newsroom.internal/audit/inquiry/${item.id}`;
    navigator.clipboard?.writeText(permalink);
    if (showToast) {
      showToast(`Inquiry audit permalink copied: ${item.queryId}`, 'success');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Query ID', 'Headline', 'Timestamp', 'User', 'Scope', 'Sources', 'Strictness'];
    const rows = SEARCH_HISTORY_ITEMS.map(i => [
      `"${i.queryId}"`,
      `"${i.headline.replace(/"/g, '""')}"`,
      `"${i.timestamp}"`,
      `"${i.user}"`,
      `"${i.scope}"`,
      `"${i.groundedSourcesCount}"`,
      `"${i.isStrict ? 'Strict' : 'Standard'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mediamind_query_manifest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) {
      showToast('Exported Query Manifest (CSV) successfully', 'success');
    }
  };

  // Clear Session History
  const handleClearSession = () => {
    if (showToast) {
      showToast('Local session audit buffer cleared. Master cold vault retains 365-day immutable ledger.', 'info');
    }
  };

  // Filter items based on active controls
  const filteredItems = useMemo(() => {
    return SEARCH_HISTORY_ITEMS.filter(item => {
      // Keyword search
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesText = 
          item.headline.toLowerCase().includes(query) ||
          item.synopsis.toLowerCase().includes(query) ||
          item.queryId.toLowerCase().includes(query) ||
          item.scope.toLowerCase().includes(query) ||
          (item.topic && item.topic.toLowerCase().includes(query));
        if (!matchesText) return false;
      }
      return true;
    });
  }, [searchFilter]);

  return (
    <div className="search-history-page-root">
      {/* 1. PAGE HEADER */}
      <section className="search-history-header">
        {/* Title line */}
        <div className="search-history-heading-wrap">
          <h1 className="search-history-title">
            Search History <span className="search-history-slash">//</span> <span className="search-history-sub">INVESTIGATIVE QUERY AUDIT LOG</span>
          </h1>
          <span className="audit-retention-badge">
            <Shield size={11} className="text-cyan" />
            <span>AUDIT RETENTION: 365 DAYS</span>
          </span>
        </div>

        {/* Action Links directly below title */}
        <div className="search-history-actions-row">
          <button className="btn-history-link" onClick={handleExportCSV}>
            <Download size={12} className="link-icon" />
            <span>Export Query Manifest (CSV)</span>
          </button>
          <button className="btn-history-link" onClick={handleClearSession}>
            <RotateCcw size={12} className="link-icon" />
            <span>Clear Recent Session History</span>
          </button>
        </div>

        {/* Subtitle Description */}
        <p className="search-history-description">
          Comprehensive audit trail of all natural-language queries, forensic syntheses, and source retrieval runs executed across your newsroom workspace. Every output is immutably timestamped and linked to raw custody dockets.
        </p>
      </section>

      {/* 2. STATS OVERVIEW CARDS (4 CARDS) */}
      <section className="search-history-stats-grid">
        {/* Card 1: Logged Executions */}
        <div className="stat-card">
          <div className="stat-card-label">LOGGED EXECUTIONS</div>
          <div className="stat-card-bottom">
            <span className="stat-card-value text-white">142 Inquiries</span>
            <div className="stat-card-icon-box">
              <Search size={14} className="text-slate" />
            </div>
          </div>
        </div>

        {/* Card 2: Average Grounded Sources */}
        <div className="stat-card">
          <div className="stat-card-label">AVERAGE GROUNDED SOURCES</div>
          <div className="stat-card-bottom">
            <span className="stat-card-value text-cyan">12.4 Records</span>
            <div className="stat-card-icon-box">
              <Copy size={14} className="text-cyan-bright" />
            </div>
          </div>
        </div>

        {/* Card 3: Attribution Strictness */}
        <div className="stat-card">
          <div className="stat-card-label">ATTRIBUTION STRICTNESS</div>
          <div className="stat-card-bottom">
            <span className="stat-card-value text-amber">99.1% High</span>
            <div className="stat-card-icon-box">
              <FileEdit size={14} className="text-amber" />
            </div>
          </div>
        </div>

        {/* Card 4: Vault Custody Sync */}
        <div className="stat-card">
          <div className="stat-card-label">VAULT CUSTODY SYNC</div>
          <div className="stat-card-bottom">
            <span className="stat-card-value text-white">2,418,920 Docs</span>
            <div className="stat-card-ring-box">
              <svg width="26" height="26" viewBox="0 0 36 36" className="circular-chart">
                <path
                  className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#162234"
                  strokeWidth="3.2"
                />
                <path
                  className="circle-stroke"
                  strokeDasharray="80, 100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FILTER / SEARCH CONTROLS CONTAINER */}
      <section className="search-filter-container">
        {/* Top Search Input Line */}
        <div className="filter-input-row">
          <Search size={13} className="filter-search-icon" />
          <input
            type="text"
            className="filter-text-input"
            placeholder="Filter queries by keyword, topic, or source docket (e.g. 'Mumbai', 'docket:2019', 'tag:wire')..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchFilter('');
            }}
          />
          {searchFilter ? (
            <button 
              className="btn-esc-clear active-clear"
              onClick={() => setSearchFilter('')}
              title="Clear search filter"
            >
              <X size={11} /> Clear
            </button>
          ) : (
            <span className="btn-esc-clear">ESC to clear</span>
          )}
        </div>

        {/* Bottom Filter Controls Line */}
        <div className="filter-options-row">
          {/* Range Picker */}
          <div className="filter-range-group">
            <span className="filter-label">
              <Calendar size={11} className="inline-icon" /> Range:
            </span>
            <button
              className={`range-pill ${selectedRange === '7days' ? 'active' : ''}`}
              onClick={() => setSelectedRange('7days')}
            >
              Last 7 Days
            </button>
            <button
              className={`range-pill ${selectedRange === '30days' ? 'active' : ''}`}
              onClick={() => setSelectedRange('30days')}
            >
              Last 30 Days
            </button>
            <button
              className={`range-pill ${selectedRange === '2024' ? 'active' : ''}`}
              onClick={() => setSelectedRange('2024')}
            >
              Year 2024
            </button>
            <button
              className={`range-pill ${selectedRange === 'custom' ? 'active' : ''}`}
              onClick={() => setSelectedRange('custom')}
            >
              Custom...
            </button>
          </div>

          {/* User Selector Dropdown */}
          <div className="dropdown-wrapper">
            <button
              className="filter-dropdown-btn"
              onClick={() => {
                setIsUserDropdownOpen(!isUserDropdownOpen);
                setIsStrictDropdownOpen(false);
              }}
            >
              <User size={11} className="text-cyan" />
              <span>{selectedUser}</span>
              <ChevronDown size={10} className="chevron-icon" />
            </button>
            {isUserDropdownOpen && (
              <div className="filter-dropdown-menu">
                <button
                  className={`dropdown-option ${selectedUser === 'Elena Rostova (You)' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedUser('Elena Rostova (You)');
                    setIsUserDropdownOpen(false);
                  }}
                >
                  Elena Rostova (You)
                </button>
                <button
                  className={`dropdown-option ${selectedUser === 'K. Sundaram (Shared)' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedUser('K. Sundaram (Shared)');
                    setIsUserDropdownOpen(false);
                  }}
                >
                  K. Sundaram (Shared)
                </button>
                <button
                  className={`dropdown-option ${selectedUser === 'All Users' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedUser('All Users');
                    setIsUserDropdownOpen(false);
                  }}
                >
                  All Users
                </button>
              </div>
            )}
          </div>

          {/* Strict Mode Selector Dropdown */}
          <div className="dropdown-wrapper">
            <button
              className="filter-dropdown-btn"
              onClick={() => {
                setIsStrictDropdownOpen(!isStrictDropdownOpen);
                setIsUserDropdownOpen(false);
              }}
            >
              <Shield size={11} className="text-cyan" />
              <span>{strictModeOnly ? 'Strict Mode Only' : 'All Attribution Modes'}</span>
              <ChevronDown size={10} className="chevron-icon" />
            </button>
            {isStrictDropdownOpen && (
              <div className="filter-dropdown-menu">
                <button
                  className={`dropdown-option ${strictModeOnly ? 'active' : ''}`}
                  onClick={() => {
                    setStrictModeOnly(true);
                    setIsStrictDropdownOpen(false);
                  }}
                >
                  Strict Mode Only
                </button>
                <button
                  className={`dropdown-option ${!strictModeOnly ? 'active' : ''}`}
                  onClick={() => {
                    setStrictModeOnly(false);
                    setIsStrictDropdownOpen(false);
                  }}
                >
                  All Attribution Modes
                </button>
              </div>
            )}
          </div>

          {/* Status Radio Pills */}
          <div className="filter-status-group">
            <span className="filter-label">Status:</span>
            <button
              className={`status-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button
              className={`status-pill ${statusFilter === 'saved' ? 'active' : ''}`}
              onClick={() => setStatusFilter('saved')}
            >
              <Bookmark size={11} className="text-amber inline-icon" /> Saved Only
            </button>
            <button
              className={`status-pill ${statusFilter === 'unsaved' ? 'active' : ''}`}
              onClick={() => setStatusFilter('unsaved')}
            >
              Unsaved
            </button>
          </div>
        </div>
      </section>

      {/* Filter Matches Counter */}
      <div className="active-matches-counter">
        <span>Active filter matches: <strong>{filteredItems.length} / 142</strong></span>
      </div>

      {/* 4. AUDIT LOG TABLE */}
      <div className="audit-table-wrapper">
        {/* Table Header Row */}
        <div className="audit-table-header">
          <div className="col-inquiry">INQUIRY QUERY &amp; FORENSIC SYNTHESIS SYNOPSIS</div>
          <div className="col-timestamp">EXECUTED TIMESTAMP</div>
          <div className="col-scope">SCOPE &amp; PRIMARY MEDIA</div>
          <div className="col-sources">GROUNDED SOURCES</div>
          <div className="col-actions">ACTIONS</div>
        </div>

        {/* Table Body List */}
        <div className="audit-table-body">
          {filteredItems.map((item) => {
            const isSaved = savedItemMap[item.id];

            return (
              <div 
                key={item.id} 
                className="audit-row"
                onClick={() => {
                  if (onNavigateToResults) onNavigateToResults(item.headline);
                }}
              >
                {/* Column 1: Query & Synopsis */}
                <div className="col-inquiry inquiry-content-cell">
                  {/* Badges strip */}
                  <div className="inquiry-badges-row">
                    <span className="query-id-tag">{item.queryId}</span>

                    {/* Specific Badges based on item type */}
                    {item.id === 'Q-2024-8841' && (
                      <>
                        <span className="badge-strict-match">
                          <Shield size={10} className="badge-icon" />
                          <span>STRICT 98% MATCH</span>
                        </span>
                        {isSaved && (
                          <span className="badge-dossier-saved">
                            <Bookmark size={10} className="badge-icon" />
                            <span>Saved to Dossier #C-01</span>
                          </span>
                        )}
                      </>
                    )}

                    {item.id === 'Q-2024-8839' && (
                      <>
                        <span className="badge-confidential">
                          <Shield size={10} className="badge-icon" />
                          <span>CONFIDENTIAL DECLASS</span>
                        </span>
                        {isSaved && (
                          <span className="badge-saved-simple">
                            <Bookmark size={10} className="badge-icon" />
                            <span>Saved</span>
                          </span>
                        )}
                      </>
                    )}

                    {item.id === 'Q-2024-8812' && (
                      <>
                        <span className="badge-shared">
                          <Users size={10} className="badge-icon" />
                          <span>SHARED INQUIRY</span>
                        </span>
                        {isSaved && (
                          <span className="badge-saved-simple">
                            <Bookmark size={10} className="badge-icon" />
                            <span>Saved</span>
                          </span>
                        )}
                      </>
                    )}

                    {item.id === 'Q-2024-8798' && (
                      <>
                        <span className="badge-forensics">
                          <AlertTriangle size={10} className="badge-icon" />
                          <span>FINANCIAL FORENSICS</span>
                        </span>
                        {!isSaved ? (
                          <span className="badge-unsaved-simple">
                            <span>Unsaved</span>
                          </span>
                        ) : (
                          <span className="badge-saved-simple">
                            <Bookmark size={10} className="badge-icon" />
                            <span>Saved</span>
                          </span>
                        )}
                      </>
                    )}

                    {item.id === 'Q-2024-8760' && (
                      <>
                        <span className="badge-legal">
                          <Scale size={10} className="badge-icon" />
                          <span>LEGAL &amp; GAZETTE</span>
                        </span>
                        {isSaved && (
                          <span className="badge-saved-simple">
                            <Bookmark size={10} className="badge-icon" />
                            <span>Saved</span>
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Headline */}
                  <h3 className="inquiry-headline">{item.headline}</h3>

                  {/* Synopsis text (Italicized) */}
                  <p className="inquiry-synopsis">{item.synopsis}</p>
                </div>

                {/* Column 2: Executed Timestamp */}
                <div className="col-timestamp timestamp-cell">
                  <div className="timestamp-time-row">
                    <Clock size={11} className="time-clock-icon" />
                    <span>{item.timestamp}</span>
                  </div>
                  <div className="timestamp-user-row">
                    <span className="user-status-dot"></span>
                    <span className="user-name-text">{item.user}</span>
                  </div>
                  <div className="terminal-id-text">
                    Terminal ID: {item.terminalId}
                  </div>
                </div>

                {/* Column 3: Scope & Primary Media */}
                <div className="col-scope scope-cell">
                  <div className="scope-title-text">{item.scope}</div>
                  <div className="scope-media-text">{item.primaryMedia}</div>
                  <div className="scope-indexed-time">Indexed: {item.indexedTime}</div>
                </div>

                {/* Column 4: Grounded Sources */}
                <div className="col-sources sources-cell">
                  <div className="sources-top-row">
                    <span className="sources-count-label">{item.groundedSourcesCount} Sources Grounded</span>
                    {item.matchBadge && (
                      <span className={`source-pill-badge badge-${item.matchBadge.type}`}>
                        {item.matchBadge.text}
                      </span>
                    )}
                  </div>
                  <div className="sources-sub-breakdown">
                    {item.subCategories.map((sub, sIdx) => (
                      <div 
                        key={sIdx} 
                        className={`sub-cat-line ${sub.color === 'cyan' ? 'text-cyan-bright' : 'text-slate'}`}
                      >
                        {sub.count}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 5: Action Buttons */}
                <div className="col-actions actions-cell" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="row-action-btn"
                    title="Rerun Archival Synthesis"
                    onClick={(e) => handleRerunQuery(item, e)}
                  >
                    <RotateCcw size={12} />
                  </button>
                  
                  {item.id === 'Q-2024-8798' ? (
                    <button 
                      className="row-action-btn"
                      title={isSaved ? "Remove Bookmark" : "Save Query"}
                      onClick={(e) => handleToggleSave(item.id, item.headline, e)}
                    >
                      <Bookmark size={12} className={isSaved ? "text-amber" : ""} />
                    </button>
                  ) : (
                    <button 
                      className="row-action-btn"
                      title="Open Investigation Dossier"
                      onClick={(e) => handleOpenDossier(item, e)}
                    >
                      <FolderArchive size={12} />
                    </button>
                  )}

                  {item.id === 'Q-2024-8798' ? (
                    <button 
                      className="row-action-btn"
                      title="Inspect Raw Docket Payloads"
                      onClick={(e) => handleShareQuery(item, e)}
                    >
                      <Code2 size={12} />
                    </button>
                  ) : (
                    <button 
                      className="row-action-btn"
                      title="Export / Share Permastring"
                      onClick={(e) => handleShareQuery(item, e)}
                    >
                      <ExternalLink size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. BOTTOM PAGINATION FOOTER */}
      <footer className="search-history-footer">
        <div className="footer-left-info">
          <span className="footer-live-dot"></span>
          <span className="footer-showing-text">
            Showing <strong>1-5</strong> of <strong>142</strong> logged queries
          </span>
          <span className="footer-separator">|</span>
          <span className="footer-retention-text">
            Retention Period: 365 Days rolling window
          </span>
        </div>

        <div className="footer-pagination-controls">
          <button 
            className="pagination-btn-arrow" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button 
            className={`pagination-number-box ${currentPage === 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <button 
            className={`pagination-number-box ${currentPage === 2 ? 'active' : ''}`}
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>
          <button 
            className={`pagination-number-box ${currentPage === 3 ? 'active' : ''}`}
            onClick={() => setCurrentPage(3)}
          >
            3
          </button>
          <span className="pagination-ellipsis">...</span>
          <button 
            className="pagination-number-box"
            onClick={() => setCurrentPage(29)}
          >
            29
          </button>
          <button 
            className="pagination-btn-arrow"
            onClick={() => setCurrentPage(p => Math.min(29, p + 1))}
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
