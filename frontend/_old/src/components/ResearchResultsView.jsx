import React, { useState } from 'react';
import {
  Search,
  Sliders,
  Shield,
  ShieldCheck,
  Download,
  Copy,
  FileCheck,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Volume2,
  FileText,
  Video,
  AlertCircle,
  Camera,
  Layers,
  ArrowRight,
  X,
  Play,
  RotateCcw
} from 'lucide-react';

export default function ResearchResultsView({ onNavigateToVerification, onOpenPdf, showToast }) {
  const [activeSort, setActiveSort] = useState('Relevance');
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [yearFilter, setYearFilter] = useState('2019');
  const [typeFilter, setTypeFilter] = useState('All');
  const [reporterFilter, setReporterFilter] = useState('All');
  const [pubFilter, setPubFilter] = useState('Daily Chronicle +2');
  const [topicFilter, setTopicFilter] = useState('Urban Development & Protests');

  const handleExportDossier = () => {
    showToast('Exporting Investigative Dossier (MD/PDF) with cryptographic attestation...', 'info');
  };

  const handleCopyCitations = () => {
    const citationsText = `[1] "Mumbai Protests Enter Third Week", The Daily Chronicle, June 18, 2019.
[2] "Interview with Civic Coalition President", Audio Reel #412, June 21, 2019.
[3] "Archive Footage Notes: Mumbai South", Video Archive, June 25, 2019.`;
    navigator.clipboard?.writeText(citationsText);
    showToast('All 8 citations copied to clipboard in standardized wire format', 'success');
  };

  const handlePlayAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    showToast(isPlayingAudio ? 'Audio playback paused' : 'Playing Audio Reel #412 (04:12) — Interview with Civic Coalition President', 'info');
  };

  return (
    <div className="research-results-container">
      {/* 1. TOP QUERY & FILTERS HEADER */}
      <section className="results-query-panel">
        <div className="query-input-row">
          <div className="locked-query-bar">
            <Search size={16} className="text-cyan" />
            <input 
              type="text" 
              className="locked-query-text" 
              value="What happened during the 2019 protests in Mumbai?" 
              readOnly
            />
            <div className="query-locked-badge">
              <span>QUERY LOCKED</span>
              <Sliders size={12} className="text-slate" />
            </div>
          </div>

          <div className="attribution-rigor-box">
            <div className="rigor-label">
              <Shield size={12} className="text-cyan" />
              <span>ATTRIBUTION RIGOR</span>
            </div>
            <div className="rigor-value">Strict Mode (Verified Only)</div>
          </div>
        </div>

        {/* ACTIVE CRITERIA FILTER BAR */}
        <div className="filter-criteria-row">
          <span className="criteria-label">ACTIVE CRITERIA:</span>

          {yearFilter && (
            <div className="filter-chip">
              <span>Year: <strong>{yearFilter}</strong></span>
              <button className="chip-remove" onClick={() => setYearFilter('')} title="Remove Filter">
                <X size={11} />
              </button>
            </div>
          )}

          <div className="filter-select-wrap">
            <span className="filter-select-label">Type:</span>
            <select 
              className="filter-dropdown"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All (Articles, Interviews, Footage)</option>
              <option value="Articles">Print Articles Only</option>
              <option value="Interviews">Audio Interviews</option>
              <option value="Footage">Footage Logs</option>
            </select>
            <ChevronDown size={12} className="dropdown-arrow" />
          </div>

          <div className="filter-select-wrap">
            <span className="filter-select-label">Reporter:</span>
            <select 
              className="filter-dropdown"
              value={reporterFilter}
              onChange={(e) => setReporterFilter(e.target.value)}
            >
              <option value="All">All Reporters</option>
              <option value="Rahul Mehta">Rahul Mehta</option>
              <option value="Ananya Rao">Ananya Rao</option>
            </select>
            <ChevronDown size={12} className="dropdown-arrow" />
          </div>

          <div className="filter-select-wrap">
            <span className="filter-select-label">Publication:</span>
            <select 
              className="filter-dropdown"
              value={pubFilter}
              onChange={(e) => setPubFilter(e.target.value)}
            >
              <option value="Daily Chronicle +2">Daily Chronicle +2</option>
              <option value="Chronicle Only">Daily Chronicle Only</option>
              <option value="High Court">High Court Registry</option>
            </select>
            <ChevronDown size={12} className="dropdown-arrow" />
          </div>
        </div>

        {/* SUB FILTER ROW */}
        <div className="sub-filter-row">
          <div className="filter-select-wrap">
            <span className="filter-select-label">Topic:</span>
            <select 
              className="filter-dropdown"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
            >
              <option value="Urban Development & Protests">Urban Development & Protests</option>
              <option value="Ecological Assessment">Ecological Assessment</option>
              <option value="Transit Disruption">Transit Disruption</option>
            </select>
            <ChevronDown size={12} className="dropdown-arrow" />
          </div>

          <button 
            className="reset-filters-btn"
            onClick={() => {
              setYearFilter('2019');
              setTypeFilter('All');
              setReporterFilter('All');
              setPubFilter('Daily Chronicle +2');
              setTopicFilter('Urban Development & Protests');
              showToast('Filters reset to default investigative criteria', 'info');
            }}
          >
            <span>RESET FILTERS</span>
          </button>
        </div>
      </section>

      {/* 2. DUAL COLUMNS: SUMMARY (LEFT) + SOURCES (RIGHT) */}
      <div className="results-grid">
        {/* LEFT COLUMN: RESEARCH SUMMARY */}
        <div className="summary-column">
          <div className="summary-header-row">
            <div className="summary-title-group">
              <FileText size={16} className="text-cyan" />
              <h2 className="summary-title">Research Summary</h2>
            </div>
            <div className="sources-count-pill">
              <Layers size={13} className="text-cyan" />
              <span>Based on 8 archive sources</span>
            </div>
          </div>

          {/* ACTION BUTTONS TOOLBAR */}
          <div className="summary-action-toolbar">
            <button className="btn-export-dossier" onClick={handleExportDossier}>
              <Download size={14} />
              <span>Export Dossier (MD/PDF)</span>
            </button>

            <button className="btn-secondary-tool" onClick={handleCopyCitations}>
              <Copy size={13} />
              <span>Copy Citations</span>
            </button>

            <button 
              className="btn-secondary-tool"
              onClick={() => onNavigateToVerification(1)}
              title="Open Source Verification Matrix"
            >
              <ShieldCheck size={13} className="text-cyan" />
              <span>Verification Audit</span>
            </button>
          </div>

          {/* REPORT METADATA STRIP */}
          <div className="report-case-strip">
            <span className="case-id">INVESTIGATIVE REPORT // CASE 2019-MUMBAI-04</span>
            <span className="case-mode">STRICT ATTRIBUTION MODE: ENGAGED</span>
          </div>

          {/* SUMMARY SYNTHESIS BODY */}
          <div className="summary-narrative-card">
            <p className="narrative-p">
              The protests began in early June 2019 following the municipal authority's announcement of the proposed coastal highway redevelopment plan{' '}
              <button 
                className="inline-citation-badge"
                onClick={() => onNavigateToVerification(1)}
                title="Inspect Citation [1]: The Daily Chronicle"
              >
                [1]
              </button>
              {' '}. Initial demonstrations were organized by local civic groups and environmental coalitions who contested the zoning clearances granted without public hearings{' '}
              <button 
                className="inline-citation-badge"
                onClick={() => onNavigateToVerification(2)}
                title="Inspect Citation [2]: Civic Coalition Objections"
              >
                [2]
              </button>
              {' '}.
            </p>

            <p className="narrative-p">
              Archive coverage across June and July 2019 indicates that demonstrations expanded substantially over subsequent weeks, culminating in several large gatherings reported across central Mumbai, Azad Maidan, and South Mumbai transit hubs{' '}
              <button 
                className="inline-citation-badge"
                onClick={() => onNavigateToVerification(1)}
                title="Inspect Citation [1]"
              >
                [1]
              </button>{' '}
              <button 
                className="inline-citation-badge"
                onClick={() => onNavigateToVerification(3)}
                title="Inspect Citation [3]"
              >
                [3]
              </button>
              {' '}. Organizers reported that attendance reached several thousand participants during the peak march on June 18{' '}
              <button 
                className="inline-citation-badge"
                onClick={() => onNavigateToVerification(1)}
                title="Inspect Citation [1]"
              >
                [1]
              </button>
              {' '}.
            </p>

            <p className="narrative-p">
              Internal interviews with protest coordinators conducted on June 21 reflect ongoing negotiations with municipal commissioners regarding environmental mitigation clauses{' '}
              <button 
                className="inline-citation-badge"
                onClick={() => onNavigateToVerification(2)}
                title="Inspect Citation [2]"
              >
                [2]
              </button>
              {' '}. However, archive footage notes from late June confirm that transit blockades were instituted after the rejection of civic counter-proposals{' '}
              <button 
                className="inline-citation-badge"
                onClick={() => onNavigateToVerification(3)}
                title="Inspect Citation [3]"
              >
                [3]
              </button>
              {' '}.
            </p>

            {/* EVIDENCE MEDIA GALLERY - 2 VINTAGE HISTORICAL THUMBNAILS */}
            <div className="evidence-media-gallery">
              <div 
                className="media-card" 
                onClick={() => onOpenPdf(1)}
                title="Click to view full archival facsimile"
              >
                <div className="media-img-wrap">
                  <img 
                    src="/assets/azad_maidan_protest_rally.jpg" 
                    alt="Azad Maidan Rally Documentation" 
                    className="media-img"
                  />
                  <div className="media-overlay-badge">PHOTO ARCHIVE</div>
                </div>
                <div className="media-caption">
                  <div className="media-caption-title">Azad Maidan Rally Documentation</div>
                  <div className="media-caption-sub">Chronicle Wire Photo Desk · 18-06-2019</div>
                </div>
              </div>

              <div 
                className="media-card" 
                onClick={() => onOpenPdf(2)}
                title="Click to view full archival facsimile"
              >
                <div className="media-img-wrap">
                  <img 
                    src="/assets/zoning_alignment_map.jpg" 
                    alt="Zoning Alignment Map [Ex. B]" 
                    className="media-img"
                  />
                  <div className="media-overlay-badge">DOCUMENT ARCHIVE</div>
                </div>
                <div className="media-caption">
                  <div className="media-caption-title">Zoning Alignment Map [Ex. B]</div>
                  <div className="media-caption-sub">Urban Development Archive · Doc #108</div>
                </div>
              </div>
            </div>
          </div>

          {/* EVIDENCE COVERAGE & VERIFICATION BREAKDOWN */}
          <div className="evidence-breakdown-card">
            <div className="breakdown-header">
              <div className="breakdown-title">
                <FileCheck size={14} className="text-cyan" />
                <span>EVIDENCE COVERAGE & VERIFICATION BREAKDOWN</span>
              </div>
              <div className="consensus-badge">
                94% Historical Consensus
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-num text-white">8</div>
                <div className="stat-desc">Sources Reviewed</div>
              </div>
              <div className="stat-card">
                <div className="stat-num text-cyan">6</div>
                <div className="stat-desc">Direct Relevant Passages</div>
              </div>
              <div className="stat-card">
                <div className="stat-num text-slate">2</div>
                <div className="stat-desc">Background Records</div>
              </div>
            </div>

            <div className="vector-row">
              <div className="vector-text">
                <div className="vector-label">Archival Attestation Vector</div>
                <div className="vector-sub">6 Corroborated cross-points / 0 Internal contradictions identified</div>
              </div>
              <div className="vector-graph">
                {/* Clean SVG Sparkline */}
                <svg width="120" height="28" viewBox="0 0 120 28" fill="none">
                  <path 
                    d="M2 24 L25 21 L50 18 L75 12 L98 9 L118 4" 
                    stroke="#00e5ff" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                  />
                  <circle cx="118" cy="4" r="3" fill="#00e5ff" />
                </svg>
              </div>
            </div>
          </div>

          {/* NOTICE BANNER - AMBER UNVERIFIED REPO WARNING */}
          <div className="unverified-repo-notice">
            <div className="notice-icon-box">
              <Camera size={16} className="text-amber" />
            </div>
            <div className="notice-content">
              <div className="notice-headline">
                Notice: Some details could not be verified from the available archive.
              </div>
              <p className="notice-para">
                MediaMind refuses to infer municipal arrest totals or private police communications as these records are not present in the current 2019 archive repository. Request an FOI dispatch or ingest supplemental police dispatch reels to expand scope.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ARCHIVE SOURCES (8) */}
        <div className="sources-column">
          <div className="sources-header-row">
            <h2 className="sources-title">
              Archive Sources (8)
            </h2>
            <span className="synchronized-badge">SYNCHRONIZED</span>
          </div>

          {/* SORT INDEX SELECTOR */}
          <div className="sort-index-row">
            <span className="sort-label">Sort Index:</span>
            <div className="sort-pill-group">
              <button 
                className={`sort-pill ${activeSort === 'Relevance' ? 'active' : ''}`}
                onClick={() => setActiveSort('Relevance')}
              >
                Relevance
              </button>
              <button 
                className={`sort-pill ${activeSort === 'Chronology' ? 'active' : ''}`}
                onClick={() => setActiveSort('Chronology')}
              >
                Chronology
              </button>
              <button 
                className={`sort-pill ${activeSort === 'Doc Type' ? 'active' : ''}`}
                onClick={() => setActiveSort('Doc Type')}
              >
                Doc Type
              </button>
            </div>
          </div>

          {/* SOURCE CARD 1 */}
          <div className="archive-source-card">
            <div className="card-top-row">
              <div className="card-title-group">
                <span className="source-citation-tag">[1]</span>
                <h3 className="source-doc-name">Mumbai Protests Enter Third W...</h3>
              </div>
              <span className="match-score-badge text-cyan">98% Match</span>
            </div>

            <div className="source-meta-subline">
              June 18, 2019 · Article · By Rahul Mehta · <span className="pub-name">The Daily Chronicle</span>
            </div>

            <p className="source-quoted-excerpt">
              “The demonstrations continued into their third week, with organizers estimating that several thousand participants gathered across multiple locations in South Mumbai...”
            </p>

            <div className="card-actions-row">
              <button 
                className="view-passage-link"
                onClick={() => onNavigateToVerification(1)}
              >
                <span>View passage</span>
                <ArrowRight size={13} />
              </button>

              <div className="doc-tools-right">
                <button 
                  className="btn-open-pdf-sm"
                  onClick={() => onOpenPdf(1)}
                >
                  <FileText size={12} />
                  <span>Open PDF</span>
                </button>
                <button 
                  className="btn-icon-ghost"
                  onClick={() => {
                    navigator.clipboard?.writeText('perm://archive.mediamind.internal/vault-b/2019/mum/0842');
                    showToast('Permalink copied for Citation [1]', 'success');
                  }}
                  title="Copy Permanent Reference"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* SOURCE CARD 2 */}
          <div className="archive-source-card">
            <div className="card-top-row">
              <div className="card-title-group">
                <span className="source-citation-tag">[2]</span>
                <h3 className="source-doc-name">Interview with Civic Coalition P...</h3>
              </div>
              <span className="match-score-badge text-cyan">91% Match</span>
            </div>

            <div className="source-meta-subline">
              June 21, 2019 · Interview Transcript · By Ananya Rao · <span className="pub-name">Audio Reel #412</span>
            </div>

            <p className="source-quoted-excerpt">
              “We submitted twenty-four specific objections to the coastal zone management authority back in April. They proceeded anyway without acknowledging community deputations...”
            </p>

            <div className="card-actions-row">
              <button 
                className="view-passage-link"
                onClick={() => onNavigateToVerification(2)}
              >
                <span>View passage</span>
                <ArrowRight size={13} />
              </button>

              <div className="doc-tools-right">
                <button 
                  className={`btn-audio-clip ${isPlayingAudio ? 'is-playing' : ''}`}
                  onClick={handlePlayAudio}
                >
                  <Play size={11} className="play-icon" />
                  <span>{isPlayingAudio ? 'Pause Clip (01:24)' : 'Play Audio Clip (04:12)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SOURCE CARD 3 */}
          <div className="archive-source-card">
            <div className="card-top-row">
              <div className="card-title-group">
                <span className="source-citation-tag">[3]</span>
                <h3 className="source-doc-name">Archive Footage Notes: Mumbai...</h3>
              </div>
              <span className="match-score-badge text-cyan">84% Match</span>
            </div>

            <div className="source-meta-subline">
              June 25, 2019 · Footage Notes · Field Desk Unit 4 · <span className="pub-name">Video Archive</span>
            </div>

            <p className="source-quoted-excerpt">
              “Camera 2 logs show gathering at Azad Maidan dispersal point at 16:45. Police barricades deployed along Mahapalika Marg with gradual perimeter diversions...”
            </p>

            <div className="card-actions-row">
              <button 
                className="view-passage-link"
                onClick={() => onNavigateToVerification(3)}
              >
                <span>View passage</span>
                <ArrowRight size={13} />
              </button>

              <div className="doc-tools-right">
                <button 
                  className="btn-view-log-sm"
                  onClick={() => onNavigateToVerification(3)}
                >
                  <Video size={12} />
                  <span>View Log Entry</span>
                </button>
              </div>
            </div>
          </div>

          {/* ACCORDION EXPANDER FOR ADDITIONAL SOURCES */}
          <div className="accordion-sources-card">
            <button 
              className="accordion-trigger"
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            >
              <div className="accordion-label-wrap">
                <ChevronDown size={14} className={`chevron-indicator ${isAccordionOpen ? 'open' : ''}`} />
                <span>Show 5 Additional Background Sources (Government Gazettes, Press Bulletins)</span>
              </div>
              <span className="count-pill">+5</span>
            </button>

            {isAccordionOpen && (
              <div className="accordion-body-list">
                {/* Source 4 */}
                <div className="sub-source-item" onClick={() => onNavigateToVerification(4)}>
                  <div className="sub-top">
                    <span className="source-citation-tag">[4]</span>
                    <span className="sub-title">Daily Police Commissionerate SitRep Log #170</span>
                    <span className="sub-match">82%</span>
                  </div>
                  <div className="sub-meta">June 23, 2019 · Official Police Record · Zero detentions reported</div>
                </div>

                {/* Source 5 */}
                <div className="sub-source-item" onClick={() => onNavigateToVerification(5)}>
                  <div className="sub-top">
                    <span className="source-citation-tag">[5]</span>
                    <span className="sub-title">Port Trust Marine Ingress Traffic Ledger</span>
                    <span className="sub-match">79%</span>
                  </div>
                  <div className="sub-meta">June 15, 2019 · Mumbai Port Authority Operations Log</div>
                </div>

                {/* Source 6 */}
                <div className="sub-source-item" onClick={() => onNavigateToVerification(6)}>
                  <div className="sub-top">
                    <span className="source-citation-tag">[6]</span>
                    <span className="sub-title">Department of Environment & Forests Sanction Note</span>
                    <span className="sub-match">76%</span>
                  </div>
                  <div className="sub-meta">May 28, 2019 · State Environmental Appraisal Committee</div>
                </div>

                {/* Source 7 */}
                <div className="sub-source-item" onClick={() => onNavigateToVerification(7)}>
                  <div className="sub-top">
                    <span className="source-citation-tag">[7]</span>
                    <span className="sub-title">Western Railway Commuter Disruption Bulletin</span>
                    <span className="sub-match">73%</span>
                  </div>
                  <div className="sub-meta">June 17, 2019 · Churchgate Transit Logistics Advisory</div>
                </div>

                {/* Source 8 */}
                <div className="sub-source-item" onClick={() => onNavigateToVerification(8)}>
                  <div className="sub-top">
                    <span className="source-citation-tag">[8]</span>
                    <span className="sub-title">Fisherfolk Cooperative Collective Joint Memorandum</span>
                    <span className="sub-match">71%</span>
                  </div>
                  <div className="sub-meta">June 14, 2019 · Worli Koliwada Representation Dossier</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
