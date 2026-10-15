import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bookmark,
  ExternalLink,
  Lock,
  Mic,
  FileText,
  FileCheck,
  Globe,
  Database,
  ArrowRight,
  TrendingUp,
  Download,
  Check,
  Camera,
  Layers,
  HelpCircle,
  Pin
} from 'lucide-react';

export default function ResearchDashboardView({ onNavigateToResults, onOpenPdf, showToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [activeFilters, setActiveFilters] = useState({
    allArchives: true,
    transcripts: false,
    classified: false,
    highConfidence: false
  });
  const [bookmarkedItems, setBookmarkedItems] = useState({ 1: true, 2: false, 3: false });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim() || 'What happened during the 2019 protests in Mumbai?';
    showToast(`Launching investigative synthesis for: "${query}"`, 'info');
    onNavigateToResults(query);
  };

  const handleSuggestedClick = (query) => {
    setSearchQuery(query);
    showToast(`Investigating: "${query}"`, 'info');
    onNavigateToResults(query);
  };

  const toggleBookmark = (id) => {
    setBookmarkedItems(prev => {
      const next = { ...prev, [id]: !prev[id] };
      showToast(next[id] ? `Case inquiry #${id} pinned to Saved Research` : `Removed case inquiry #${id}`, 'info');
      return next;
    });
  };

  return (
    <div className="research-dashboard-container">
      {/* 1. HERO QUERY SYNTHESIZER SECTION */}
      <section className="dashboard-hero-section">
        <div className="terminal-node-tag">
          <span>TERMINAL NODE 09 // FORENSIC QUERY DESK</span>
          <span className="node-sep">/</span>
          <span className="vault-connected-badge">
            <span className="pulse-dot"></span>
            <span>Cold Store Vault Connected</span>
          </span>
        </div>

        <h1 className="hero-serif-title">What are you researching?</h1>
        <p className="hero-sub-para">
          Search 34 years of verified newsroom archives, leaked cables, interview transcripts, and footage logs with strict citation grounding.
        </p>

        {/* Central Search Box Form */}
        <form onSubmit={handleSearchSubmit} className="hero-query-form">
          <div className="hero-query-input-wrap">
            <Sparkles size={18} className="hero-query-icon text-cyan" />
            <input 
              type="text" 
              className="hero-query-input" 
              placeholder="Ask a question about the archive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="query-synthesizer-tag">QUERY_SYNTHESIZER</div>
            <button type="submit" className="hero-submit-btn">
              <span>Research</span>
              <kbd className="hero-kbd">↵ Enter</kbd>
            </button>
          </div>

          {/* Bypass Filter Pills */}
          <div className="bypass-filters-bar">
            <span className="bypass-label">BYPASS FILTER:</span>
            
            <button 
              type="button"
              className={`bypass-pill ${activeFilters.allArchives ? 'active' : ''}`}
              onClick={() => setActiveFilters(prev => ({ ...prev, allArchives: !prev.allArchives }))}
            >
              <Check size={12} />
              <span>All Archives 1989-2024</span>
            </button>

            <button 
              type="button"
              className={`bypass-pill ${activeFilters.transcripts ? 'active' : ''}`}
              onClick={() => setActiveFilters(prev => ({ ...prev, transcripts: !prev.transcripts }))}
            >
              <Mic size={12} />
              <span>Transcripts only</span>
            </button>

            <button 
              type="button"
              className={`bypass-pill ${activeFilters.classified ? 'active' : ''}`}
              onClick={() => setActiveFilters(prev => ({ ...prev, classified: !prev.classified }))}
            >
              <Lock size={12} className="text-amber" />
              <span>Classified / Restricted only</span>
            </button>

            <button 
              type="button"
              className={`bypass-pill ${activeFilters.highConfidence ? 'active' : ''}`}
              onClick={() => setActiveFilters(prev => ({ ...prev, highConfidence: !prev.highConfidence }))}
            >
              <ShieldCheck size={12} className="text-cyan" />
              <span>High Confidence Evidence only</span>
            </button>
          </div>

          {/* Suggested Inquiries */}
          <div className="suggested-inquiries-wrap">
            <span className="suggested-label">Suggested inquiries:</span>
            <div className="suggested-queries-grid">
              <button 
                type="button" 
                className="suggested-chip"
                onClick={() => handleSuggestedClick("What happened during the 2019 protests in Mumbai?")}
              >
                "What happened during the 2019 protests in Mumbai?"
              </button>
              <button 
                type="button" 
                className="suggested-chip"
                onClick={() => handleSuggestedClick("How did India-China relations change between 2015 and 2020?")}
              >
                "How did India-China relations change between 2015 and 2020?"
              </button>
              <button 
                type="button" 
                className="suggested-chip"
                onClick={() => handleSuggestedClick("Find interviews with climate activists published before 2018.")}
              >
                "Find interviews with climate activists published before 2018."
              </button>
              <button 
                type="button" 
                className="suggested-chip"
                onClick={() => handleSuggestedClick("Review financial audits for Metro Infrastructure Project (2016-2019)")}
              >
                "Review financial audits for Metro Infrastructure Project (2016-2019)"
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 2. DUAL COLUMN WORKSPACE: RECENT RESEARCH + ARCHIVE INTEGRITY */}
      <div className="dashboard-content-grid">
        {/* LEFT COLUMN: RECENT RESEARCH & PHYSICAL ASSETS */}
        <div className="dashboard-left-col">
          {/* Section Header with Tabs */}
          <div className="recent-research-header">
            <div className="recent-title-group">
              <h2 className="recent-heading">Recent Research</h2>
              <span className="active-cases-badge">14 ACTIVE</span>
            </div>

            <div className="recent-tabs-group">
              <button 
                className={`recent-tab ${activeTab === 'All' ? 'active' : ''}`}
                onClick={() => setActiveTab('All')}
              >
                All
              </button>
              <button 
                className={`recent-tab ${activeTab === 'My Inquiries' ? 'active' : ''}`}
                onClick={() => setActiveTab('My Inquiries')}
              >
                My Inquiries
              </button>
              <button 
                className={`recent-tab ${activeTab === 'Desk Shared' ? 'active' : ''}`}
                onClick={() => setActiveTab('Desk Shared')}
              >
                Desk Shared
              </button>
              <button 
                className={`recent-tab ${activeTab === 'Flagged' ? 'active' : ''}`}
                onClick={() => setActiveTab('Flagged')}
              >
                <span className="amber-dot"></span>
                <span>Flagged for Verification</span>
              </button>
            </div>
          </div>

          {/* RECENT CASE CARD 1: MUMBAI PROTESTS */}
          <div className="recent-case-card">
            <div className="case-top-meta">
              <div className="case-time-sources">
                <Clock size={12} className="text-slate" />
                <span>Today, 10:42 AM · 8 sources cited · 6 primary documents</span>
              </div>
              <div className="case-verified-badge">
                <ShieldCheck size={12} className="text-cyan" />
                <span>VERIFIED GROUNDING - 96% MATCH</span>
              </div>
            </div>

            <div className="case-title-row">
              <h3 
                className="case-headline"
                onClick={() => onNavigateToResults("What happened during the 2019 protests in Mumbai?")}
              >
                What happened during the 2019 protests in Mumbai?
              </h3>
              <div className="case-icon-actions">
                <button 
                  className={`icon-action-btn ${bookmarkedItems[1] ? 'is-bookmarked' : ''}`}
                  onClick={() => toggleBookmark(1)}
                  title="Bookmark Inquiry"
                >
                  <Bookmark size={14} />
                </button>
                <button 
                  className="icon-action-btn"
                  onClick={() => onNavigateToResults("What happened during the 2019 protests in Mumbai?")}
                  title="Open Full Research Dossier"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>

            <p className="case-synthesis-snippet">
              “Protests commenced June 2019 following municipal redevelopment notices. Archive cross-examination confirms 14 major demonstrations across South Mumbai and Bandra. Discrepancies between initial police logs{' '}
              <span className="inline-case-cite">[SEC-402 §12.3]</span>{' '}
              and unredacted bureau field cables indicate restricted assembly sanctions were issued 48 hours prior to public notice.”
            </p>

            <div className="case-footer-row">
              <div className="case-tags">
                <span className="case-tag">#Mumbai</span>
                <span className="case-tag">#UrbanPolicy</span>
                <span className="case-tag">#Protests</span>
                <span className="case-tag">#2019</span>
              </div>
              <div className="case-investigator">
                Lead Investigator: <strong>E. Rostova</strong>
              </div>
            </div>
          </div>

          {/* RECENT CASE CARD 2: INDIA-CHINA BORDER */}
          <div className="recent-case-card">
            <div className="case-top-meta">
              <div className="case-time-sources">
                <Clock size={12} className="text-slate" />
                <span>Yesterday, 4:18 PM · 21 sources cited · <span className="text-amber">12 confidential memos</span></span>
              </div>
              <div className="case-verified-badge">
                <ShieldCheck size={12} className="text-cyan" />
                <span>VERIFIED GROUNDING - 18 PASSAGES MATCHED</span>
              </div>
            </div>

            <div className="case-title-row">
              <h3 
                className="case-headline"
                onClick={() => onNavigateToResults("India-China border diplomatic cables & summit notes (2015–2020)")}
              >
                India-China border diplomatic cables & summit notes (2015–2020)
              </h3>
              <div className="case-icon-actions">
                <button 
                  className={`icon-action-btn ${bookmarkedItems[2] ? 'is-bookmarked' : ''}`}
                  onClick={() => toggleBookmark(2)}
                  title="Bookmark Inquiry"
                >
                  <Bookmark size={14} />
                </button>
                <button 
                  className="icon-action-btn"
                  onClick={() => onNavigateToResults("India-China border diplomatic cables & summit notes (2015–2020)")}
                  title="Open Full Research Dossier"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>

            <p className="case-synthesis-snippet">
              “Bilateral agreements reached in Ufa and Wuhan showed shifting military buffer zone protocols prior to the June 2020 standoff. Internal ministerial telegrams{' '}
              <span className="inline-case-cite-amber">[CAB-881/DECLAS]</span>{' '}
              detail contentious patrols in Sector 4 that departed from standard liaison meeting logs established during the 2017 Doklam de-escalation framework.”
            </p>

            <div className="case-footer-row">
              <div className="case-tags">
                <span className="case-tag">#Diplomacy</span>
                <span className="case-tag">#BorderProtocols</span>
                <span className="case-tag">#Archive</span>
                <span className="case-tag">#Bilateral</span>
              </div>
              <div className="case-investigator">
                Desk: <strong>Foreign Intelligence Desk</strong>
              </div>
            </div>
          </div>

          {/* RECENT CASE CARD 3: CLIMATE ACTIVISTS */}
          <div className="recent-case-card">
            <div className="case-top-meta">
              <div className="case-time-sources">
                <Clock size={12} className="text-slate" />
                <span>15 Sep 2024 · 14 audio transcripts cited · 4 coastal survey scans</span>
              </div>
              <div className="case-verified-badge">
                <Mic size={12} className="text-cyan" />
                <span>AUDIO TRANSCRIPTS - OCR VERIFIED</span>
              </div>
            </div>

            <div className="case-title-row">
              <h3 
                className="case-headline"
                onClick={() => onNavigateToResults("Interviews with climate activists and coastal ecologists before 2018")}
              >
                Interviews with climate activists and coastal ecologists before 2018
              </h3>
              <div className="case-icon-actions">
                <button 
                  className={`icon-action-btn ${bookmarkedItems[3] ? 'is-bookmarked' : ''}`}
                  onClick={() => toggleBookmark(3)}
                  title="Bookmark Inquiry"
                >
                  <Bookmark size={14} />
                </button>
                <button 
                  className="icon-action-btn"
                  onClick={() => onNavigateToResults("Interviews with climate activists and coastal ecologists before 2018")}
                  title="Open Full Research Dossier"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>

            <p className="case-synthesis-snippet">
              “Archive includes 6 unbroadcast taped interviews detailing informal fishing community displacements around coastal development corridors. Ecologist testimony directly links unpermitted reclamation to salt-marsh degradation{' '}
              <span className="inline-case-cite">[AUDIO-REEL #4, 14:22]</span>{' '}
              , substantiated by satellite baseline imagery from European Space Agency archives (2014-2017).”
            </p>

            <div className="case-footer-row">
              <div className="case-tags">
                <span className="case-tag">#Ecology</span>
                <span className="case-tag">#Interviews</span>
                <span className="case-tag">#Climate</span>
                <span className="case-tag">#CoastalCorridor</span>
              </div>
              <div className="case-investigator">
                Archivist: <strong>K. Sundaram</strong>
              </div>
            </div>
          </div>

          {/* PRIMARY PHYSICAL ASSETS UNDER AUDIT */}
          <div className="physical-assets-section">
            <div className="physical-header">
              <div className="physical-title">
                <Camera size={14} className="text-cyan" />
                <span>Primary Physical Assets Under Audit</span>
              </div>
              <span className="drawer-ref">Evidence Vault Drawer 3</span>
            </div>

            <div className="physical-cards-grid">
              <div 
                className="physical-card"
                onClick={() => onOpenPdf(1)}
                title="Inspect South Asia Wire Teletype Roll (Microfilm)"
              >
                <div className="physical-thumb-wrap">
                  <img 
                    src="/assets/microfilm_teletype_roll.jpg" 
                    alt="South Asia Wire Teletype Roll" 
                    className="physical-img"
                  />
                  <div className="physical-badge">REEL-1994-B</div>
                </div>
                <div className="physical-info">
                  <div className="physical-name">South Asia Wire Teletype Roll</div>
                  <div className="physical-meta">1994 · Physical Microfilm</div>
                </div>
              </div>

              <div 
                className="physical-card"
                onClick={() => onOpenPdf(2)}
                title="Inspect Redacted Port Trust Commission Memo"
              >
                <div className="physical-thumb-wrap">
                  <img 
                    src="/assets/redacted_port_commission_memo.jpg" 
                    alt="Redacted Port Trust Commission" 
                    className="physical-img"
                  />
                  <div className="physical-badge badge-amber">RESTRICTED</div>
                </div>
                <div className="physical-info">
                  <div className="physical-name">Redacted Port Trust Commission</div>
                  <div className="physical-meta">2001 · Declassified Memo</div>
                </div>
              </div>

              <div 
                className="physical-card"
                onClick={() => onOpenPdf(3)}
                title="Inspect Nagpur Fishery Syndicate Reel-to-Reel Tape"
              >
                <div className="physical-thumb-wrap">
                  <img 
                    src="/assets/reel_to_reel_tape_machine.jpg" 
                    alt="Nagpur Fishery Syndicate Tapes" 
                    className="physical-img"
                  />
                  <div className="physical-badge badge-cyan">AUDIO-MASTER</div>
                </div>
                <div className="physical-info">
                  <div className="physical-name">Nagpur Fishery Syndicate Tapes</div>
                  <div className="physical-meta">2016 · 1/4 Inch Reel-to-Reel</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ARCHIVE INTEGRITY & STATS */}
        <div className="dashboard-right-col">
          {/* Header */}
          <div className="archive-integrity-header">
            <div className="integrity-title-group">
              <FileCheck size={16} className="text-cyan" />
              <h2 className="integrity-title">Archive Integrity</h2>
            </div>
            <div className="realtime-status-pill">
              <span className="pulse-cyan-dot"></span>
              <span>REALTIME</span>
            </div>
          </div>

          {/* CORE EDITORIAL MANDATE CARD */}
          <div className="editorial-mandate-card">
            <div className="mandate-top-tag">
              <Shield size={12} className="text-amber" />
              <span>CORE EDITORIAL MANDATE</span>
            </div>
            <h3 className="mandate-headline">The Archive Outranks the Model</h3>
            <blockquote className="mandate-quote">
              “The AI should never be more authoritative than the archive. Every sentence is cross-referenced against original physical or digital records before presentation.”
            </blockquote>
            <div className="mandate-footer">
              <span className="hash-check-status">Hash Check: SHA-256 Validated</span>
              <a 
                href="#protocol" 
                className="protocol-link" 
                onClick={(e) => {
                  e.preventDefault();
                  showToast('MediaMind Editorial Protocol v4.1 (Mandatory Investigative Compliance)', 'info');
                }}
              >
                Protocol v4.1
              </a>
            </div>
          </div>

          {/* 4 STATS METRIC TILES */}
          <div className="metrics-2x2-grid">
            <div className="metric-tile">
              <div className="metric-tile-header">
                <span className="metric-k">INDEXED DOCUMENTS</span>
                <FileText size={13} className="text-muted" />
              </div>
              <div className="metric-v">2.4M</div>
              <div className="metric-sub">Newsprint, wire dispatches, confidential cables, and uncut audio.</div>
            </div>

            <div className="metric-tile">
              <div className="metric-tile-header">
                <span className="metric-k">CONTENT TYPES</span>
                <Layers size={13} className="text-muted" />
              </div>
              <div className="metric-v">18</div>
              <div className="metric-sub">Field notes, audio reels, sworn depositions, and PDF dossiers.</div>
            </div>

            <div className="metric-tile">
              <div className="metric-tile-header">
                <span className="metric-k">TEMPORAL SPAN</span>
                <Clock size={13} className="text-muted" />
              </div>
              <div className="metric-v">34 Yrs</div>
              <div className="metric-sub">Continuous historic timeline spanning from 1989 through 2024.</div>
            </div>

            <div className="metric-tile">
              <div className="metric-tile-header">
                <span className="metric-k">VECTOR COVERAGE</span>
                <Globe size={13} className="text-cyan" />
              </div>
              <div className="metric-v text-cyan">98.4%</div>
              <div className="metric-sub">Vector embeddings + Full-Text OCR with strict token hashing.</div>
            </div>
          </div>

          {/* ARCHIVE INGESTION VELOCITY CHART CARD */}
          <div className="velocity-chart-card">
            <div className="velocity-header">
              <span className="velocity-label">ARCHIVE INGESTION VELOCITY (LAST 12 MONTHS)</span>
              <span className="velocity-rate">+18.2k docs/wk</span>
            </div>

            {/* Ingestion Curve SVG */}
            <div className="velocity-svg-wrap">
              <svg width="100%" height="54" viewBox="0 0 380 54" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0 48 Q50 44 95 38 T190 28 T285 14 T380 8 L380 54 L0 54 Z" 
                  fill="url(#velocityGrad)" 
                />
                <path 
                  d="M0 48 Q50 44 95 38 T190 28 T285 14 T380 8" 
                  stroke="#00e5ff" 
                  strokeWidth="2" 
                  fill="none" 
                />
                <circle cx="380" cy="8" r="3.5" fill="#00e5ff" />
              </svg>
            </div>

            <div className="velocity-x-axis">
              <span>OCT 2023</span>
              <span>MAY 2024</span>
              <span>SEP 2024 (CURRENT)</span>
            </div>
          </div>

          {/* PINNED PRIMARY SOURCES */}
          <div className="pinned-sources-card">
            <div className="pinned-header">
              <div className="pinned-title">
                <Pin size={13} className="text-amber" />
                <span>Pinned Primary Sources</span>
              </div>
              <span className="pinned-count">3 items</span>
            </div>

            <div className="pinned-items-list">
              <div 
                className="pinned-item"
                onClick={() => onOpenPdf(1)}
              >
                <div className="pinned-item-icon text-rose">
                  <FileText size={15} />
                </div>
                <div className="pinned-item-info">
                  <div className="pinned-item-name">Mumbai Redevelopment Commission - Re...</div>
                  <div className="pinned-item-meta">PDF · 42MB · Scanned & OCR Anchored</div>
                </div>
                <button className="pinned-action-btn" title="Download">
                  <Download size={13} />
                </button>
              </div>

              <div 
                className="pinned-item"
                onClick={() => onOpenPdf(2)}
              >
                <div className="pinned-item-icon text-cyan">
                  <Database size={15} />
                </div>
                <div className="pinned-item-info">
                  <div className="pinned-item-name">South Asia Bureau Diplomatic Wire Dispat...</div>
                  <div className="pinned-item-meta">Dataset · 4,120 Cables · Verified Hash</div>
                </div>
                <button className="pinned-action-btn" title="Download">
                  <Download size={13} />
                </button>
              </div>

              <div 
                className="pinned-item"
                onClick={() => {
                  showToast('Opening Editorial Standards & Citation Attribution Protocol...', 'info');
                }}
              >
                <div className="pinned-item-icon text-cyan-bright">
                  <ShieldCheck size={15} />
                </div>
                <div className="pinned-item-info">
                  <div className="pinned-item-name">Editorial Standards & Citation Attribution P...</div>
                  <div className="pinned-item-meta">Internal Guideline · Mandatory Read</div>
                </div>
                <button className="pinned-action-btn" title="View">
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* AUDIT STREAM ZERO HALLUCINATION FOOTER */}
          <div className="audit-stream-footer">
            <div className="audit-left">
              <ShieldCheck size={14} className="text-cyan" />
              <span>Audit Stream: Active - Zero Hallucination Mode</span>
            </div>
            <span className="enforced-badge">ENFORCED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
