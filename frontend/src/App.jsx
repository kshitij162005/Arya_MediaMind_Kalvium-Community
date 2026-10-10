import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Search,
  Bell,
  Sliders,
  Layers,
  LayoutDashboard,
  FileText,
  CheckCircle2,
  FolderArchive,
  Upload,
  History,
  Bookmark,
  Settings,
  MoreVertical,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  Copy,
  Check,
  Target,
  Sparkles,
  MapPin,
  Building,
  Flag,
  FileSearch,
  CheckSquare,
  Share2,
  Database
} from 'lucide-react';

import { CITATIONS_DATA } from './mockData';
import OriginalScannedModal from './components/OriginalScannedModal';
import NewSearchModal from './components/NewSearchModal';
import UploadModal from './components/UploadModal';
import FlagDiscrepancyModal from './components/FlagDiscrepancyModal';
import Toast from './components/Toast';
import ResearchResultsView from './components/ResearchResultsView';
import ResearchDashboardView from './components/ResearchDashboardView';
import UploadDocumentsView from './components/UploadDocumentsView';
import SearchHistoryView from './components/SearchHistoryView';
import SavedResearchView from './components/SavedResearchView';
import TerminalAuthView from './components/TerminalAuthView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeNav, setActiveNav] = useState('saved');
  const [activeCitationId, setActiveCitationId] = useState(1);
  const [density, setDensity] = useState('High'); // 'High' | 'Comfortable'
  const [isDualPane, setIsDualPane] = useState(true);
  
  // Modals state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  
  // Verified / Pinned citations state
  const [pinnedCitations, setPinnedCitations] = useState({ 1: true });
  
  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const citation = CITATIONS_DATA[activeCitationId] || CITATIONS_DATA[1];
  const totalCitations = Object.keys(CITATIONS_DATA).length;

  const handlePrevCitation = () => {
    setActiveCitationId((prev) => (prev > 1 ? prev - 1 : totalCitations));
  };

  const handleNextCitation = () => {
    setActiveCitationId((prev) => (prev < totalCitations ? prev + 1 : 1));
  };

  const handlePinCitation = () => {
    setPinnedCitations(prev => ({ ...prev, [activeCitationId]: true }));
    showToast(`Citation [${activeCitationId}] verified & pinned to story draft!`, 'success');
  };

  const handleCopyPermastring = () => {
    navigator.clipboard?.writeText(citation.permastring || `ARCH-REF-${citation.archiveRef}`);
    showToast(`Permastring copied: ${citation.archiveRef}`, 'success');
  };

  const handleCopyCitationFormatted = () => {
    const formatted = `"${citation.title}," ${citation.publication}, ${citation.date}, ${citation.location}. Archive Ref: ${citation.archiveRef}.`;
    navigator.clipboard?.writeText(formatted);
    showToast(`AP / Chicago formatted citation copied to clipboard`, 'success');
  };

  const handleExportExcerpt = () => {
    showToast(`Exported source excerpt for ${citation.archiveRef}`, 'info');
  };

  // Keyboard shortcut listener for Command+K / Ctrl+K and Command+N / Ctrl+N
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`mediamind-app-root ${density === 'High' ? 'density-high' : 'density-comfortable'}`}>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Scanned Facsimile Modal */}
      {isPdfModalOpen && (
        <OriginalScannedModal
          citation={citation}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}

      {/* Natural Language Search Modal */}
      {isSearchModalOpen && (
        <NewSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onExecuteSearch={(query) => {
            showToast(`Searching archive for: "${query.slice(0, 45)}..."`, 'info');
          }}
        />
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={(title) => {
            showToast(`Uploaded & indexed "${title}"`, 'success');
          }}
        />
      )}

      {/* Flag Discrepancy Modal */}
      {isFlagModalOpen && (
        <FlagDiscrepancyModal
          citation={citation}
          isOpen={isFlagModalOpen}
          onClose={() => setIsFlagModalOpen(false)}
          onFlagSubmitted={(data) => {
            showToast(`Flag logged for Citation [${data.citationId}]. Audit requested.`, 'warning');
          }}
        />
      )}

      {/* TERMINAL AUTH VIEW OR APP BODY LAYOUT */}
      {!isAuthenticated ? (
        <TerminalAuthView
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            showToast('Authenticated via TLS 1.3 Strict Enclave. Welcome Elena Rostova.', 'success');
          }}
          showToast={showToast}
        />
      ) : (
        <div className="mm-app-layout">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="mm-sidebar">
          {/* Brand Header at top of sidebar */}
          <div className="sidebar-brand-header">
            <div className="mm-logo-mark">
              <span className="mm-logo-symbol">MM</span>
            </div>
            <div className="mm-brand-text">
              <div className="mm-brand-title">MediaMind</div>
              <div className="mm-brand-sub">INVESTIGATIVE DESK v3.4</div>
            </div>
          </div>

          {/* Action Button */}
          <div className="sidebar-action-wrap">
            <button 
              className="btn-new-search"
              onClick={() => setIsSearchModalOpen(true)}
            >
              <span className="btn-left">
                <span>Editorial Intelligence</span>
              </span>
              <kbd className="sidebar-kbd">^N</kbd>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav-list">
            <button 
              className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveNav('dashboard')}
            >
              <LayoutDashboard size={15} />
              <span>Research Dashboard</span>
            </button>

            <button 
              className={`nav-item ${activeNav === 'results' ? 'active' : ''}`}
              onClick={() => setActiveNav('results')}
            >
              <FileText size={15} />
              <span>Research Results</span>
            </button>

            <button 
              className={`nav-item ${activeNav === 'verification' ? 'active' : ''}`}
              onClick={() => setActiveNav('verification')}
            >
              <CheckSquare size={15} className="active-icon" />
              <span>Source Verification</span>
            </button>

            <button 
              className={`nav-item ${activeNav === 'archive' ? 'active' : ''}`}
              onClick={() => setActiveNav('archive')}
            >
              <FolderArchive size={15} />
              <span>Archive Repository</span>
            </button>

            <button 
              className={`nav-item ${activeNav === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveNav('upload')}
            >
              <Upload size={15} />
              <span>Upload Documents</span>
            </button>

            <button 
              className={`nav-item ${activeNav === 'history' ? 'active' : ''}`}
              onClick={() => setActiveNav('history')}
            >
              <History size={15} />
              <span>Search History</span>
            </button>

            <button 
              className={`nav-item ${activeNav === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveNav('saved')}
            >
              <Bookmark size={15} />
              <span>Saved Research</span>
            </button>

            <button 
              className={`nav-item ${activeNav === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveNav('settings')}
            >
              <Settings size={15} />
              <span>Settings</span>
            </button>
          </nav>

          {/* Sidebar Bottom Sync & User Profile */}
          <div className="sidebar-footer">
            <div className="archive-sync-card">
              <div className="sync-status-row">
                <span className="live-dot-wrap">
                  <span className="live-dot"></span>
                  <span className="sync-title">Archive Sync: Live</span>
                </span>
                <span className="sync-percentage">100%</span>
              </div>
              <div className="sync-subtext">2.4M records indexed</div>
              <div className="sync-progress-bar">
                <div className="sync-progress-fill" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="user-profile-row">
              <div className="user-avatar-circle">
                <span>MM</span>
              </div>
              <div className="user-details">
                <div className="user-name">Elena Rostova</div>
                <div className="user-publication">The Daily Chronicle</div>
              </div>
              <button 
                className="user-menu-btn" 
                title="Lock Terminal Enclave"
                onClick={() => {
                  setIsAuthenticated(false);
                  showToast('Terminal session locked. Returning to authorization enclave.', 'info');
                }}
              >
                <MoreVertical size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE COLUMN */}
        <div className="mm-main-column">
          {/* TOPBAR */}
          <header className="mm-topbar">
            {/* Global Stats & Attribution Pill */}
            <div className="mm-topbar-left">
              <div className="stat-index-badge">
                <Database size={13} className="text-slate" />
                <span>Index: 1989-2024 · 2,418,920 records indexed</span>
              </div>

              <div className="strict-attribution-pill">
                <Shield size={13} className="text-cyan" />
                <span>Strict Attribution: <strong>ACTIVE</strong></span>
              </div>
            </div>

            {/* Natural Language Search Bar & Action Controls */}
            <div className="mm-topbar-right">
              <div 
                className="mm-search-trigger"
                onClick={() => setIsSearchModalOpen(true)}
                role="button"
                tabIndex={0}
              >
                <Search size={14} className="text-slate" />
                <span className="search-placeholder">Search natural language or query syntax...</span>
                <kbd className="kbd-shortcut">⌘K</kbd>
              </div>

              <button 
                className="topbar-icon-btn relative-bell" 
                title="Archival Alerts (1 Pending Audit)"
                onClick={() => showToast('1 Archival Notification: Node Asia-South-1 daily delta index completed.', 'info')}
              >
                <Bell size={16} />
                <span className="notification-amber-dot"></span>
              </button>

              <div 
                className="user-avatar-hex" 
                title="Elena Rostova — Click to Lock Terminal"
                onClick={() => {
                  setIsAuthenticated(false);
                  showToast('Terminal session locked. Returning to authorization enclave.', 'info');
                }}
              >
                <span className="avatar-initials">MM</span>
              </div>
            </div>
          </header>

          {/* WORKSPACE CONTENT AREA */}
          <main className="mm-workspace">
            {activeNav === 'upload' ? (
              <UploadDocumentsView
                onOpenPdf={(citationId) => {
                  setActiveCitationId(citationId);
                  setIsPdfModalOpen(true);
                }}
                showToast={showToast}
              />
            ) : activeNav === 'dashboard' ? (
              <ResearchDashboardView
                onNavigateToResults={(query) => {
                  setActiveNav('results');
                }}
                onOpenPdf={(citationId) => {
                  setActiveCitationId(citationId);
                  setIsPdfModalOpen(true);
                }}
                showToast={showToast}
              />
            ) : activeNav === 'results' ? (
              <ResearchResultsView
                onNavigateToVerification={(citationId) => {
                  setActiveCitationId(citationId);
                  setActiveNav('verification');
                }}
                onOpenPdf={(citationId) => {
                  setActiveCitationId(citationId);
                  setIsPdfModalOpen(true);
                }}
                showToast={showToast}
              />
            ) : activeNav === 'history' ? (
              <SearchHistoryView
                onNavigateToResults={(query) => {
                  setActiveNav('results');
                }}
                onOpenPdf={(citationId) => {
                  setActiveCitationId(citationId);
                  setIsPdfModalOpen(true);
                }}
                showToast={showToast}
              />
            ) : activeNav === 'saved' ? (
              <SavedResearchView
                onNavigateToResults={(query) => {
                  setActiveNav('results');
                }}
                onOpenPdf={(citationId) => {
                  setActiveCitationId(citationId);
                  setIsPdfModalOpen(true);
                }}
                showToast={showToast}
              />
            ) : (
              <>
                {/* Breadcrumb & Ledger Toolbar */}
                <div className="workspace-toolbar">
            <div className="breadcrumb-path">
              <span className="dossier-tag">INVESTIGATION DOSSIER</span>
              <span className="path-slash">/</span>
              <span className="dossier-sub">MUM-2019-COASTAL-DEV</span>
              <span className="path-slash">/</span>
              <span className="dossier-matrix">C-01 VERIFICATION MATRIX</span>
            </div>

            <div className="toolbar-controls-right">
              <div className="ledger-sync-indicator">
                <span className="sync-pulse-dot"></span>
                <span>Dual-Pane Synchronized Ledger</span>
              </div>

              <div 
                className="density-toggle-btn"
                onClick={() => setDensity(prev => prev === 'High' ? 'Comfortable' : 'High')}
                title="Toggle UI Density"
                role="button"
                tabIndex={0}
              >
                <Sliders size={13} className="text-slate" />
                <span>Density: <strong>{density}</strong></span>
              </div>
            </div>
          </div>

          {/* DUAL PANES CONTAINER */}
          <div className={`panes-grid ${isDualPane ? 'dual-pane' : 'single-pane'}`}>
            {/* PANE 1: SYNTHETIC INTELLIGENCE CANVAS */}
            <section className="pane-column synthetic-canvas-pane">
              {/* Pane Header */}
              <div className="pane-header-strip">
                <div className="pane-title-wrap">
                  <div className="neural-icon-box">
                    <Sparkles size={14} className="text-cyan" />
                  </div>
                  <h2 className="pane-title-text">SYNTHETIC INTELLIGENCE CANVAS</h2>
                </div>
                <div className="model-spec-badge">
                  Model: DeepForensic-v4 (Hypothesis Only)
                </div>
              </div>

              {/* Canvas Scrollable Content */}
              <div className="pane-content-scroll">
                {/* Inquiry Hypothesis Banner Card */}
                <div className="hypothesis-meta-card">
                  <div className="hypothesis-top-row">
                    <span className="hypothesis-tag">INQUIRY HYPOTHESIS #14</span>
                    <span className="hypothesis-timestamp">Run 08:42:19 UTC</span>
                  </div>
                  <h1 className="hypothesis-headline">
                    Chronology & Escalation Metrics of 2019 South Mumbai Coastal Reclamation Rallies
                  </h1>
                  <p className="hypothesis-subtext">
                    Cross-referenced against 1,420 regional publications, official port authority transit manifests, and judicial interim directives.
                  </p>
                </div>

                {/* Synthesis Draft Section */}
                <div className="synthesis-body-section">
                  <div className="synthesis-status-row">
                    <span className="synthesis-draft-label">GENERATED SYNTHESIS (DRAFT)</span>
                    <span className="footnotes-count-badge">8 Anchored Footnotes</span>
                  </div>

                  {/* Paragraph 1 */}
                  <p className="synthesis-para">
                    Initial unrest surfaced in late May following the municipal corporation's environmental clearance ratification. By mid-June, localized demonstrations had evolved into continuous civil assemblies concentrated adjacent to transport hubs and administrative headquarters.
                  </p>

                  {/* ACTIVE INSPECTION TARGET CARD */}
                  <div className={`active-inspection-box ${activeCitationId === 1 || activeCitationId === 2 ? 'is-focused' : ''}`}>
                    <div className="inspection-target-header">
                      <div className="target-pill">
                        <Target size={13} className="text-cyan" />
                        <span>ACTIVE INSPECTION TARGET</span>
                      </div>
                      <div className="lead-validated-label">
                        <Check size={12} className="text-emerald" />
                        <span>Validated by Lead Investigator</span>
                      </div>
                    </div>

                    <p className="inspection-target-para">
                      Archival evidence confirms that civil mobilization persisted unabated well into mid-June, with independent observers documenting widespread assemblies numbering in the thousands that disrupted commercial corridors across South Mumbai{' '}
                      <button 
                        className={`inline-citation-badge ${activeCitationId === 1 ? 'selected' : ''}`}
                        onClick={() => setActiveCitationId(1)}
                        title="Inspect Citation [1]: The Daily Chronicle"
                      >
                        [1]
                      </button>
                      {' '}while civic municipal entities maintained their construction timelines without public concession{' '}
                      <button 
                        className={`inline-citation-badge ${activeCitationId === 2 ? 'selected' : ''}`}
                        onClick={() => setActiveCitationId(2)}
                        title="Inspect Citation [2]: Municipal Corporation Bulletin"
                      >
                        [2]
                      </button>
                      .
                    </p>
                  </div>

                  {/* Paragraph 3 */}
                  <p className="synthesis-para">
                    Judicial interventions filed in the subsequent session noted that arterial junctions surrounding Churchgate experienced phased detours{' '}
                    <button 
                      className={`inline-citation-badge ${activeCitationId === 3 ? 'selected' : ''}`}
                      onClick={() => setActiveCitationId(3)}
                      title="Inspect Citation [3]: Bombay High Court Interim Petition"
                    >
                      [3]
                    </button>
                    , though law enforcement communiques emphasized that no formal physical detentions were initiated during this specific demonstration cycle{' '}
                    <button 
                      className={`inline-citation-badge ${activeCitationId === 4 ? 'selected' : ''}`}
                      onClick={() => setActiveCitationId(4)}
                      title="Inspect Citation [4]: Daily Police SitRep"
                    >
                      [4]
                    </button>
                    .
                  </p>
                </div>

                {/* Strict Attribution Enforcement Banner */}
                <div className="strict-attribution-banner">
                  <div className="banner-left">
                    <ShieldCheck size={16} className="text-amber" />
                    <span>Strict Attribution Protocol enforces that no unverified synthesis appears in publishing wire drafts.</span>
                  </div>
                  <div className="rule-active-tag">
                    RULE ACTIVE
                  </div>
                </div>
              </div>
            </section>

            {/* PANE 2: SOURCE VERIFICATION INSPECTOR */}
            {isDualPane && (
              <section className="pane-column verification-inspector-pane">
                {/* Pane Header */}
                <div className="pane-header-strip inspector-header-strip">
                  <div className="pane-title-wrap">
                    <span className="inspector-pulse-dot"></span>
                    <h2 className="pane-title-text">Source Verification Inspector</h2>
                    <span className="evidence-vault-pill">EVIDENCE VAULT</span>
                  </div>
                  <div className="inspector-window-controls">
                    <button 
                      className="btn-icon-subtle" 
                      title="Open Scanned Facsimile Viewer"
                      onClick={() => setIsPdfModalOpen(true)}
                    >
                      <Maximize2 size={14} />
                    </button>
                    <button 
                      className="btn-icon-subtle" 
                      title="Close Inspector Pane"
                      onClick={() => setIsDualPane(false)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Subheader / Pagination Row */}
                <div className="inspector-subnav-row">
                  <div className="inspector-crumb">
                    <span>Research</span>
                    <span className="crumb-arrow">&gt;</span>
                    <span>Mumbai Protests</span>
                    <span className="crumb-arrow">&gt;</span>
                    <span className="active-citation-crumb">Citation [{citation.id}]</span>
                  </div>

                  <div className="citation-pagination-controls">
                    <button 
                      className="pagination-btn"
                      onClick={handlePrevCitation}
                      title="View Previous Citation"
                    >
                      <ChevronLeft size={14} />
                      <span>Prev [{citation.id === 1 ? totalCitations : citation.id - 1}]</span>
                    </button>

                    <div className="current-citation-pill">
                      Citation [{citation.id}] of {totalCitations}
                    </div>

                    <button 
                      className="pagination-btn"
                      onClick={handleNextCitation}
                      title="View Next Citation"
                    >
                      <span>Next [{citation.id === totalCitations ? 1 : citation.id + 1}]</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Inspector Scrollable Body */}
                <div className="pane-content-scroll inspector-body-scroll">
                  {/* Primary Verified Document Card */}
                  <div className="verified-document-card">
                    <div className="doc-card-top">
                      <div className="primary-verified-badge">
                        <Check size={12} className="text-black" />
                        <span>{citation.status}</span>
                      </div>
                      <h3 className="doc-card-title">{citation.title}</h3>
                      <div className="doc-ingestion-meta">
                        {citation.scannedIngestion}
                      </div>
                    </div>

                    {/* Metadata 2-Column Grid */}
                    <div className="doc-metadata-grid">
                      <div className="meta-col">
                        <div className="meta-row">
                          <span className="meta-k">Author:</span>
                          <span className="meta-v">{citation.author}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-k">Date:</span>
                          <span className="meta-v">{citation.date}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-k">Archive Ref:</span>
                          <span className="meta-v font-mono text-cyan-light">{citation.archiveRef}</span>
                        </div>
                      </div>

                      <div className="meta-col">
                        <div className="meta-row">
                          <span className="meta-k">Publication:</span>
                          <span className="meta-v">{citation.publication}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-k">Location:</span>
                          <span className="meta-v">{citation.location}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-k">Integrity:</span>
                          <span className="meta-v font-mono text-emerald">{citation.integrity}</span>
                        </div>
                      </div>
                    </div>

                    {/* Document Quick Actions Row */}
                    <div className="doc-action-bar">
                      <div className="doc-actions-left">
                        <button 
                          className="doc-pill-action"
                          onClick={() => setIsPdfModalOpen(true)}
                        >
                          <FileText size={13} className="text-cyan" />
                          <span>Open Original Scanned PDF</span>
                        </button>

                        <button 
                          className="doc-pill-action"
                          onClick={() => {
                            showToast(`Downloading OCR transcript for ${citation.archiveRef}...`, 'info');
                          }}
                        >
                          <Download size={13} />
                          <span>Download OCR Transcript</span>
                        </button>

                        <button 
                          className="doc-pill-action"
                          onClick={handleCopyPermastring}
                        >
                          <Copy size={13} />
                          <span>Copy Permastring</span>
                        </button>
                      </div>

                      <div className="crypto-seal-label">
                        <ShieldCheck size={14} className="text-cyan" />
                        <span>Cryptographic Seal Intact</span>
                      </div>
                    </div>
                  </div>

                  {/* ARCHIVAL OCR STREAM SECTION */}
                  <div className="archival-ocr-stream-section">
                    <div className="ocr-stream-header">
                      <div className="ocr-stream-title">
                        <FileSearch size={14} className="text-slate" />
                        <span>{citation.sectionHeader}</span>
                      </div>
                      <div className="ocr-stream-resolution">
                        <span>{citation.scanResolution}</span>
                        <span className="sep">·</span>
                        <span>{citation.zoom}</span>
                      </div>
                    </div>

                    <div className="ocr-stream-content-box">
                      <div className="ocr-meta-line">
                        <span className="ocr-tag">{citation.ocrStreamMeta}</span>
                        <span className="ocr-encoding">{citation.encoding}</span>
                      </div>

                      {/* Surrounding Context Before */}
                      <p className="ocr-text-dim">
                        {citation.preMatchText}
                      </p>

                      {/* EXACT CORROBORATING EVIDENCE PASSAGE */}
                      <div className="corroborating-evidence-box">
                        <div className="corroborating-box-top">
                          <div className="corroborating-flag">
                            <span className="flag-chevron">»</span>
                            <span className="flag-title">EXACT CORROBORATING EVIDENCE PASSAGE</span>
                          </div>
                          <div className="relevance-score-badge">
                            {citation.relevance}
                          </div>
                        </div>

                        <blockquote className="evidence-quote">
                          {citation.exactPassage}
                        </blockquote>
                      </div>

                      {/* Surrounding Context After */}
                      <p className="ocr-text-dim">
                        {citation.postMatchText}
                      </p>
                    </div>
                  </div>

                  {/* ATTRIBUTION JUSTIFICATION CARD */}
                  <div className="attribution-justification-card">
                    <div className="justification-header">
                      <div className="justification-title">
                        <Shield size={14} className="text-cyan" />
                        <span>ATTRIBUTION JUSTIFICATION</span>
                      </div>
                      <div className="passage-confidence-label">
                        <CheckCircle2 size={13} className="text-cyan" />
                        <span>Passage Confidence: {citation.confidence}</span>
                      </div>
                    </div>

                    <p 
                      className="justification-body"
                      dangerouslySetInnerHTML={{ __html: citation.justificationHtml }}
                    />

                    {/* Attribution Tag Chips */}
                    <div className="justification-tags-row">
                      {citation.tags.map((tag, idx) => (
                        <div key={idx} className="justification-chip">
                          <CheckSquare size={12} className="text-cyan" />
                          <span>{tag.label}: <strong>{tag.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FOOTER ACTIONS */}
                  <div className="inspector-footer-action-area">
                    <div className="primary-actions-row">
                      <button 
                        className={`btn-verify-pin ${pinnedCitations[citation.id] ? 'is-pinned' : ''}`}
                        onClick={handlePinCitation}
                      >
                        <Check size={16} />
                        <span>{pinnedCitations[citation.id] ? 'Pinned to Story Draft' : 'Verify & Pin to Story Draft'}</span>
                      </button>

                      <button 
                        className="btn-flag-discrepancy"
                        onClick={() => setIsFlagModalOpen(true)}
                      >
                        <Flag size={14} />
                        <span>Flag Citation Discrepancy</span>
                      </button>
                    </div>

                    <div className="secondary-links-row">
                      <button 
                        className="btn-link-action"
                        onClick={handleCopyCitationFormatted}
                      >
                        <FileText size={13} />
                        <span>Copy Formatted Citation (AP / Chicago)</span>
                      </button>

                      <button 
                        className="btn-link-action"
                        onClick={handleExportExcerpt}
                      >
                        <Share2 size={13} />
                        <span>Export Source Excerpt</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </>
      )}
          </main>
        </div>
      </div>
      )}
    </div>
  );
}
