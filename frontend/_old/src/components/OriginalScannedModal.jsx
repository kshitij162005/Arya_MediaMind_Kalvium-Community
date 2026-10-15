import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, ExternalLink, ShieldCheck, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export default function OriginalScannedModal({ citation, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!citation) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window pdf-facsimile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="scanned-pill">
              <ShieldCheck size={14} className="text-cyan" />
              ARCHIVAL VAULT FACSIMILE
            </span>
            <span className="modal-doc-title">{citation.title} — Original Press Clipping</span>
            <span className="modal-hash-tag">{citation.archiveRef}</span>
          </div>

          <div className="modal-actions-group">
            <div className="zoom-controls">
              <button 
                className="btn-icon-subtle" 
                onClick={() => setZoomLevel(prev => Math.max(70, prev - 15))}
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <span className="zoom-label">{zoomLevel}%</span>
              <button 
                className="btn-icon-subtle" 
                onClick={() => setZoomLevel(prev => Math.min(160, prev + 15))}
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
            </div>

            <button 
              className="btn-icon-subtle" 
              onClick={() => alert(`Downloading high-resolution facsimile: ${citation.archiveRef}.pdf`)}
              title="Download PDF"
            >
              <Download size={15} />
            </button>

            <button className="btn-icon-close" onClick={onClose} title="Close Facsimile View">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="modal-body-scrollable">
          <div 
            className="vintage-paper-container" 
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            {/* Paper Header / Newspaper Masthead */}
            <div className="newspaper-masthead">
              <div className="masthead-meta-top">
                <span>CIRCULATION: 480,000</span>
                <span>REGISTERED NO. MH/MR/SOUTH-2019</span>
                <span>EDITION: GREATER MUMBAI METRO</span>
              </div>
              <h1 className="masthead-title">The Daily Chronicle</h1>
              <div className="masthead-meta-bottom">
                <span>VOL. XLIV NO. 169</span>
                <span>MUMBAI, TUESDAY, {citation.date.toUpperCase()}</span>
                <span>PRICE: ₹ 4.50 (16 PAGES)</span>
              </div>
            </div>

            {/* Newspaper Content Columns */}
            <div className="newspaper-grid">
              {/* Column 1 */}
              <div className="newspaper-col">
                <h3 className="col-subhead">CIVIC INFRASTRUCTURE</h3>
                <p className="news-lead">
                  Municipal commissioner reviews pre-monsoon preparedness across key culverts and seawalls in 
                  South Ward districts.
                </p>
                <p className="news-body">
                  Special engineering squads were tasked with inspecting offshore concrete armoring. Authorities 
                  pledged around-the-clock telemetry stations along the Marine Drive curvature to ensure zero tidal breach.
                </p>
                <div className="news-break-divider"></div>
                <h4 className="col-minor-head">PORT TRAFFIC RESTRICTED</h4>
                <p className="news-body">
                  Harbour authorities noted auxiliary tug operations would be held in reserve through late July to 
                  assist container vessels during severe storm advisories.
                </p>
              </div>

              {/* Column 2 - Main Story with Highlighted Evidence Excerpt */}
              <div className="newspaper-col main-lead-col">
                <h2 className="main-story-headline">{citation.title.toUpperCase()}</h2>
                <div className="byline">BY {citation.author.toUpperCase()} | STAFF REPORTER</div>
                <div className="dateline">MUMBAI, JUNE 17 —</div>

                <p className="news-body">
                  {citation.preMatchText}
                </p>

                {/* The Corroborating Highlight Box on the authentic scan */}
                <div className="newsprint-highlight-box">
                  <div className="highlight-anchor-flag">
                    <span className="flag-label">CORROBORATING PASSAGE [CIT-{citation.id}]</span>
                    <span className="flag-score">CONFIDENCE 99.2%</span>
                  </div>
                  <p className="newsprint-highlight-text">
                    {citation.exactPassage.replace(/“|”/g, '')}
                  </p>
                </div>

                <p className="news-body">
                  {citation.postMatchText}
                </p>
                <p className="news-body">
                  Environmental litigation representatives informed reporters that emergency applications were scheduled 
                  for hearing before the Division Bench later this week.
                </p>
              </div>

              {/* Column 3 */}
              <div className="newspaper-col">
                <h3 className="col-subhead">WEATHER OUTLOOK</h3>
                <p className="news-body">
                  Southwest monsoon surge anticipated to intensify over coastal Konkan within forty-eight hours. 
                  Fishermen advised against venturing into deep seas beyond 15 nautical miles.
                </p>
                <div className="news-ad-box">
                  <div className="ad-title">OFFICIAL GAZETTE NOTICE</div>
                  <p className="ad-text">
                    Notice of public scrutiny hearing regarding coastal spatial boundaries and transit corridors. 
                    Submissions accepted until June 30, 2019.
                  </p>
                  <div className="ad-ref">MUMBAI METROPOLITAN COMM.</div>
                </div>
              </div>
            </div>

            {/* Facsimile Footnote Stamp */}
            <div className="facsimile-footer-stamp">
              <div className="stamp-left">
                <span>DIGITAL ARCHIVE FACSIMILE · CERTIFIED ACCURATE</span>
                <span>ORIGINAL HELD IN VAULT B · SEC-0842</span>
              </div>
              <div className="stamp-right">
                <span className="digital-signature-text">SHA256: 9e88b...e102f [VERIFIED ARCHIVE NODE]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="modal-footer-left">
            <span className="crypto-badge">
              <ShieldCheck size={14} className="text-cyan" />
              Cryptographic Seal Authenticated by MediaMind Central Node
            </span>
          </div>
          <div className="modal-footer-right">
            <button className="btn-secondary-sm" onClick={onClose}>Close Viewer</button>
            <button 
              className="btn-primary-sm"
              onClick={() => alert(`Citations ledger pinned from facsimile ${citation.archiveRef}`)}
            >
              Confirm Match & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
