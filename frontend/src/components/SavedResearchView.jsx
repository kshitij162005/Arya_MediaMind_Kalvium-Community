import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  ShieldCheck,
  BookOpen,
  Users,
  FileArchive,
  FileText,
  Newspaper,
  Radio,
  MapPin,
  ExternalLink,
  Share2,
  MoreVertical,
  Activity,
  HardDrive,
  Cloud,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronDown,
  FolderGit2,
  FolderOpen
} from 'lucide-react';
import { SAVED_DOSSIERS_DATA, SAVED_RESEARCH_METRICS } from '../mockData';

export default function SavedResearchView({ onNavigateToResults, onOpenPdf, showToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesk, setSelectedDesk] = useState('All Desks');
  const [sortBy, setSortBy] = useState('Recently Updated');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const desksList = [
    { label: 'All Desks', count: 8 },
    { label: 'Investigative', count: 3 },
    { label: 'Political', count: 1 },
    { label: 'Environmental', count: 2 },
    { label: 'Foreign Desk', count: 2 }
  ];

  const filteredDossiers = useMemo(() => {
    return SAVED_DOSSIERS_DATA.filter((dossier) => {
      // Filter by desk
      if (selectedDesk !== 'All Desks' && dossier.desk !== selectedDesk) {
        return false;
      }
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = dossier.title.toLowerCase().includes(query);
        const matchesCode = dossier.dossierCode.toLowerCase().includes(query);
        const matchesQuote = dossier.inquiryQuote.toLowerCase().includes(query);
        const matchesTags = dossier.tags.some(t => t.toLowerCase().includes(query));
        return matchesTitle || matchesCode || matchesQuote || matchesTags;
      }
      return true;
    });
  }, [selectedDesk, searchQuery]);

  const handleOpenDossier = (dossier) => {
    if (showToast) {
      showToast(`Loading dossier workspace: ${dossier.dossierCode}`, 'info');
    }
    if (onOpenPdf && dossier.citationId) {
      onOpenPdf(dossier.citationId);
    }
  };

  const handleBatchExport = () => {
    if (showToast) {
      showToast('Compiling 8 active dossiers into encrypted newsroom bundle (.tar.gz)...', 'success');
    }
  };

  const handleSyncCloud = () => {
    if (showToast) {
      showToast('Syncing 5.4 GB evidentiary scans to Newsroom Cold Vault...', 'info');
    }
  };

  return (
    <div className="saved-research-page-root">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <section className="saved-research-header">
        <div className="saved-research-breadcrumb">
          <span className="crumb-text">WORKSPACE // ARCHIVAL REPOSITORY</span>
          <span className="crumb-dot">•</span>
          <span className="badge-active-dossiers">
            <span className="live-pulse-dot"></span>
            <span>8 Active Dossiers</span>
          </span>
          <span className="crumb-secured">Secured via Ledger v4.19</span>
        </div>

        <div className="saved-research-title-row">
          <div className="title-left">
            <h1 className="saved-research-main-title">
              Saved Research // <span className="title-highlight-italic">INVESTIGATION DOSSIERS</span>
            </h1>
            <p className="saved-research-subtitle">
              Curated research dossiers, pinned source evidence, and verified synthetic briefs assembled for ongoing investigative stories.
            </p>
          </div>

          <div className="header-actions-right">
            <button 
              className="btn-header-secondary"
              onClick={() => showToast('Opening desk categorization filters...', 'info')}
            >
              <SlidersHorizontal size={13} />
              <span>Filter by Desk</span>
            </button>
            <button 
              className="btn-header-secondary"
              onClick={handleBatchExport}
            >
              <Download size={13} />
              <span>Batch Export Dossiers</span>
            </button>
            <button 
              className="btn-header-primary-cyan"
              onClick={() => showToast('Launching Investigation Dossier creation wizard...', 'info')}
            >
              <Plus size={14} />
              <span>New Research Dossier</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS OVERVIEW CARDS */}
      <section className="saved-research-metrics-grid">
        {/* Card 1: Source Integrity */}
        <div className="saved-metric-card">
          <div className="metric-header-row">
            <span className="metric-label">SOURCE INTEGRITY</span>
            <div className="metric-icon-badge cyan-badge">
              <ShieldCheck size={14} className="text-cyan" />
            </div>
          </div>
          <div className="metric-value-text">{SAVED_RESEARCH_METRICS.sourceIntegrity}</div>
        </div>

        {/* Card 2: Pinned Evidence */}
        <div className="saved-metric-card">
          <div className="metric-header-row">
            <span className="metric-label">PINNED EVIDENCE</span>
            <div className="metric-icon-badge amber-badge">
              <BookOpen size={14} className="text-amber" />
            </div>
          </div>
          <div className="metric-value-text">{SAVED_RESEARCH_METRICS.pinnedEvidenceCount}</div>
          <div className="metric-subtext amber-text">{SAVED_RESEARCH_METRICS.pinnedEvidenceSub}</div>
        </div>

        {/* Card 3: Peer Audit Trail */}
        <div className="saved-metric-card">
          <div className="metric-header-row">
            <span className="metric-label">PEER AUDIT TRAIL</span>
            <div className="metric-icon-badge purple-badge">
              <Users size={14} className="text-purple" />
            </div>
          </div>
          <div className="metric-value-text">{SAVED_RESEARCH_METRICS.peerAuditCount}</div>
          <div className="metric-subtext slate-text">{SAVED_RESEARCH_METRICS.peerAuditSub}</div>
        </div>

        {/* Card 4: FOI & Subpoena Status */}
        <div className="saved-metric-card">
          <div className="metric-header-row">
            <span className="metric-label">FOI &amp; SUBPOENA STATUS</span>
            <div className="metric-icon-badge gold-badge">
              <FileArchive size={14} className="text-gold" />
            </div>
          </div>
          <div className="metric-value-text">{SAVED_RESEARCH_METRICS.foiSubpoenaCount}</div>
          <div className="metric-subtext amber-text">{SAVED_RESEARCH_METRICS.foiSubpoenaSub}</div>
        </div>
      </section>

      {/* 3. SEARCH & DESK FILTER BAR */}
      <section className="saved-research-filter-toolbar">
        <div className="filter-search-box">
          <Search size={13} className="search-icon-dim" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search saved dossiers, tags, ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className="filter-kbd">⌘F</kbd>
        </div>

        <div className="desk-tabs-list">
          {desksList.map((desk) => {
            const isActive = selectedDesk === desk.label;
            return (
              <button
                key={desk.label}
                className={`desk-tab-pill ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedDesk(desk.label)}
              >
                <span>{desk.label}</span>
                <span className="tab-count-tag">({desk.count})</span>
              </button>
            );
          })}
        </div>

        <div className="sort-dropdown-wrap">
          <span className="sort-label">SORT:</span>
          <button 
            className="sort-trigger-btn"
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
          >
            <span>{sortBy}</span>
            <ChevronDown size={11} />
          </button>
          {isSortDropdownOpen && (
            <div className="sort-menu-dropdown">
              {['Recently Updated', 'Evidence Count', 'Grounding Score', 'Oldest First'].map((s) => (
                <button
                  key={s}
                  className={`sort-option ${sortBy === s ? 'active' : ''}`}
                  onClick={() => {
                    setSortBy(s);
                    setIsSortDropdownOpen(false);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. DOSSIER CARDS GRID */}
      <section className="saved-dossiers-cards-grid">
        {filteredDossiers.map((dossier) => (
          <div key={dossier.id} className="dossier-card">
            {/* Top Badge Strip */}
            <div className="dossier-card-top-strip">
              <span className={`status-pill-badge pill-${dossier.statusType}`}>
                <span className="status-dot"></span>
                <span>{dossier.statusBadge}</span>
              </span>
              <span className="dossier-code-label">{dossier.dossierCode}</span>
            </div>

            {/* Title */}
            <h2 className="dossier-card-title">{dossier.title}</h2>

            {/* Inquiry Quote Box */}
            <div className="dossier-quote-box">
              <span className="quote-mark">“</span>
              <span className="quote-text">{dossier.inquiryQuote.replace(/^[“"]|[”"]$/g, '')}</span>
              <span className="quote-mark">”</span>
            </div>

            {/* Summary */}
            <p className="dossier-summary-paragraph">{dossier.summary}</p>

            {/* Metrics Row */}
            <div className="dossier-stats-row">
              {dossier.stats.map((st, i) => (
                <span 
                  key={i} 
                  className={`dossier-stat-item ${st.type === 'cyan' ? 'stat-cyan' : st.type === 'cyan-badge' ? 'stat-cyan-badge' : st.type === 'amber' ? 'stat-amber' : ''}`}
                >
                  {st.label}
                </span>
              ))}
            </div>

            {/* Pinned Evidence Section */}
            <div className="dossier-evidence-section">
              <div className="evidence-section-title">PINNED PRIMARY EVIDENCE</div>
              <div className="evidence-badges-wrap">
                {dossier.pinnedEvidence.map((ev, eIdx) => (
                  <span key={eIdx} className="evidence-badge-item">
                    {ev.icon === 'file' && <FileText size={10} className="ev-icon" />}
                    {ev.icon === 'newspaper' && <Newspaper size={10} className="ev-icon" />}
                    {ev.icon === 'tape' && <Radio size={10} className="ev-icon text-cyan" />}
                    {ev.icon === 'map' && <MapPin size={10} className="ev-icon" />}
                    <span>{ev.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags Row */}
            <div className="dossier-tags-row">
              {dossier.tags.map((tag, tIdx) => (
                <span key={tIdx} className="dossier-tag-pill">{tag}</span>
              ))}
            </div>

            {/* Card Footer */}
            <div className="dossier-card-footer">
              <div className="footer-meta-left">
                <span className="meta-timestamp">{dossier.meta}</span>
                <span className="meta-desk-badge">{dossier.deskLabel}</span>
              </div>

              <div className="footer-actions-right">
                {dossier.primaryActionType === 'solid-cyan' && (
                  <button 
                    className="btn-card-action-solid-cyan"
                    onClick={() => handleOpenDossier(dossier)}
                  >
                    <FolderOpen size={12} />
                    <span>Open Dossier</span>
                  </button>
                )}
                {dossier.primaryActionType === 'outline-dark' && (
                  <button 
                    className="btn-card-action-dark"
                    onClick={() => handleOpenDossier(dossier)}
                  >
                    <FolderOpen size={12} />
                    <span>Open Dossier</span>
                  </button>
                )}
                {dossier.primaryActionType === 'dark' && !dossier.secondaryAction && (
                  <button 
                    className="btn-card-action-dark"
                    onClick={() => handleOpenDossier(dossier)}
                  >
                    <FolderOpen size={12} />
                    <span>Open Dossier</span>
                  </button>
                )}
                {dossier.secondaryAction && (
                  <>
                    <button 
                      className="btn-card-action-dark"
                      onClick={() => handleOpenDossier(dossier)}
                    >
                      <span>Archive View</span>
                    </button>
                    <button 
                      className="btn-card-action-cyan-outline"
                      onClick={() => showToast('Navigating to published investigative feature...', 'info')}
                    >
                      <ExternalLink size={11} />
                      <span>Story Link</span>
                    </button>
                  </>
                )}

                {dossier.exportAction && (
                  <button 
                    className="btn-card-action-dark"
                    onClick={() => showToast(`Exported brief for ${dossier.dossierCode}`, 'info')}
                  >
                    <span>Export</span>
                  </button>
                )}

                {!dossier.secondaryAction && !dossier.exportAction && (
                  <>
                    <button 
                      className="btn-card-icon-dark"
                      title="Download Docket Manifest"
                      onClick={() => showToast(`Downloading ${dossier.dossierCode} manifest...`, 'info')}
                    >
                      <Download size={12} />
                    </button>
                    <button 
                      className="btn-card-icon-dark"
                      title="Share Dossier"
                      onClick={() => showToast(`Permastring copied for ${dossier.dossierCode}`, 'success')}
                    >
                      <Share2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Card 6: Initiate New Dossier Action Card */}
        <div className="initiate-dossier-card">
          <div className="initiate-card-inner">
            <div className="initiate-icon-box">
              <FolderGit2 size={24} className="text-cyan" />
            </div>

            <h3 className="initiate-title">Initiate New Dossier</h3>
            <p className="initiate-desc">
              Synthesize queries, aggregate primary evidence records, and set up automated monitoring on unsealed archives.
            </p>

            <div className="initiate-btn-group">
              <button 
                className="btn-launch-wizard"
                onClick={() => showToast('Launching Query Synthesis Wizard...', 'info')}
              >
                Launch Query Wizard
              </button>
              <button 
                className="btn-import-sec"
                onClick={() => showToast('Opening SEC / EDGAR & FOI batch importer...', 'info')}
              >
                Import SEC / FOI Batch
              </button>
            </div>

            <div className="initiate-monitoring-strip">
              <div className="monitoring-header">
                <span className="monitoring-live-dot"></span>
                <span>AUTOMATED MONITORING</span>
              </div>
              <p className="monitoring-subtext">
                {SAVED_RESEARCH_METRICS.crawlerStatus}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DOSSIER CORROBORATION HEATMAP & CITATION DISTRIBUTION */}
      <section className="heatmap-distribution-container">
        <div className="heatmap-header-row">
          <div className="heatmap-title-left">
            <Activity size={13} className="text-cyan inline-icon" />
            <span className="heatmap-title-text">DOSSIER CORROBORATION HEATMAP &amp; CITATION DISTRIBUTION</span>
          </div>
          <span className="heatmap-calc-meta">Calculated across 8 dossiers · 1989-2024 records</span>
        </div>

        {/* Dynamic Curved SVG Waveform with glowing nodes */}
        <div className="heatmap-wave-wrapper">
          <svg className="heatmap-svg-chart" viewBox="0 0 1000 70" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cyanWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gradient Fill under wave */}
            <path
              d="M 0 45 Q 120 44, 230 40 T 440 28 T 670 42 T 870 24 T 1000 28 L 1000 70 L 0 70 Z"
              fill="url(#cyanWaveGrad)"
            />

            {/* Glowing Spline Stroke */}
            <path
              d="M 0 45 Q 120 44, 230 40 T 440 28 T 670 42 T 870 24 T 1000 28"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2.2"
              className="spline-glow-path"
            />

            {/* Data Points */}
            <circle cx="230" cy="40" r="3.5" fill="#00e5ff" className="wave-node-dot" />
            <circle cx="440" cy="28" r="3.5" fill="#00e5ff" className="wave-node-dot" />
            <circle cx="670" cy="42" r="3.5" fill="#00e5ff" className="wave-node-dot" />
            <circle cx="870" cy="24" r="3.5" fill="#00e5ff" className="wave-node-dot" />
          </svg>
        </div>

        {/* Timeline markers */}
        <div className="heatmap-timeline-row">
          <span className="timeline-marker"><strong>1989-1999:</strong> 12 Scanned Gazettes</span>
          <span className="timeline-marker"><strong>2000-2010:</strong> 44 Judicial Stay Orders</span>
          <span className="timeline-marker"><strong>2011-2018:</strong> 63 Environmental Audits</span>
          <span className="timeline-marker"><strong>2019-2024:</strong> 118 Cross-Verified Cables</span>
        </div>
      </section>

      {/* 6. BOTTOM STATUS & COLD STORAGE FOOTER */}
      <footer className="saved-research-footer-bar">
        <div className="footer-storage-info">
          <HardDrive size={15} className="text-cyan storage-icon" />
          <div className="storage-text-lines">
            <div className="storage-main-line">{SAVED_RESEARCH_METRICS.storageFootprint}</div>
            <div className="storage-sub-line">{SAVED_RESEARCH_METRICS.backupInfo}</div>
          </div>
        </div>

        <div className="footer-storage-actions">
          <button 
            className="btn-manage-storage"
            onClick={() => showToast('Cold Vault Node: Asia-South-1 storage health 100%', 'info')}
          >
            Manage Cold Storage
          </button>
          <button 
            className="btn-sync-cloud"
            onClick={handleSyncCloud}
          >
            <Cloud size={14} />
            <span>Sync to Newsroom Cloud</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
