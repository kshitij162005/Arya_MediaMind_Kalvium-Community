import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Music,
  CheckCircle2,
  Shield,
  ShieldCheck,
  Calendar,
  Lock,
  Copy,
  ChevronDown,
  X,
  Plus,
  RefreshCw,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';

export default function UploadDocumentsView({ onOpenPdf, showToast }) {
  const [formData, setFormData] = useState({
    title: 'Mumbai Coastal Road Public Hearing Records (Vol. II)',
    author: 'Shri V. K. Deshmukh / Urban Planning S',
    publication: 'Maharashtra Urban Development Autho',
    ingestionDate: '18 Oct 2024 - 14:38:09 UTC',
    docDate: '14 May 2019',
    classification: 'Government Gazette / Official Filing',
    clearance: 'Declassified / Public Record',
    archiveRef: 'ARCH-2024-MUM-0994',
    hashPreview: 'sha256:7f83b2e59a...c8981',
    confirmed: true,
  });

  const [tags, setTags] = useState([
    'Coastal Road',
    '2019 Protests',
    'Environmental Clearance',
    'BMC'
  ]);

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
    showToast(`Removed tag #${tagToRemove}`, 'info');
  };

  const addTag = (e) => {
    e.preventDefault();
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      showToast(`Added tag #${newTagInput.trim()}`, 'success');
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleCopyRef = () => {
    navigator.clipboard?.writeText(formData.archiveRef);
    showToast(`Archive Reference ${formData.archiveRef} copied`, 'success');
  };

  const handleCopyHash = () => {
    navigator.clipboard?.writeText('7f83b2e59a84f301d29381c8981ef409210');
    showToast(`SHA-256 checksum copied to clipboard`, 'success');
  };

  const handleConfirmUpload = (e) => {
    e.preventDefault();
    showToast('Batch #2024-10-18-B confirmed & anchored to cold vault storage!', 'success');
  };

  return (
    <div className="upload-documents-page-root">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <section className="upload-top-header">
        <div className="upload-header-left">
          <div className="pipeline-crumb">
            <span>ADD TO ARCHIVE // INGESTION &amp; FORENSIC PIPELINE</span>
            <span className="crumb-dot-active">
              <span className="node-dot"></span>
              <span>Ingestion Node: Asia-South-1</span>
            </span>
          </div>
          <h1 className="upload-main-title">Forensic Document Ingestion &amp; Vector Indexing</h1>
          <p className="upload-sub-title">
            Securely upload unredacted documents, audio transcripts, field cables, and scanned newsprint for forensic OCR, PII redaction, and vector indexing.
          </p>
        </div>

        <div className="upload-header-right">
          <button 
            className="btn-header-tool"
            onClick={() => showToast('Ingestion Audit Log: All 3 active workers operational', 'info')}
          >
            <FileText size={13} className="text-slate" />
            <span>View Ingestion Log</span>
          </button>
          <button 
            className="btn-header-tool"
            onClick={() => showToast('Batch Processing Configuration (Tesseract 5.3 + Whisper Large-v3)', 'info')}
          >
            <Sliders size={13} className="text-slate" />
            <span>Batch Processing Config</span>
          </button>
        </div>
      </section>

      {/* 2. MASSIVE CLOUD DROPZONE */}
      <section className="cloud-dropzone-section">
        <div className="dropzone-center-wrap">
          <div className="cloud-icon-circle">
            <UploadCloud size={30} className="text-cyan" />
          </div>

          <h2 className="dropzone-headline">Drop documents, scans, or audio transcripts here</h2>
          <p className="dropzone-subtext">
            Supported formats: PDF (Scanned/OCR), DOCX, TXT, TIFF, WAV/FLAC (Audio Transcripts) · Max 2GB per batch encrypted pipeline
          </p>

          <div className="dropzone-actions-row">
            <label className="btn-browse-local">
              <FileText size={14} />
              <span>Browse Local Files</span>
              <input 
                type="file" 
                multiple 
                className="hidden-file-input" 
                onChange={(e) => {
                  if (e.target.files?.length) {
                    showToast(`Selected ${e.target.files.length} file(s) for ingestion pipeline`, 'info');
                  }
                }}
              />
            </label>

            <button 
              className="btn-connect-s3"
              onClick={() => showToast('Connecting to secure S3 / SFTP archival staging drop...', 'info')}
            >
              <HardDrive size={14} />
              <span>Connect Secure S3 / SFTP Drop</span>
            </button>
          </div>

          <div className="security-badges-row">
            <div className="security-badge-item">
              <ShieldCheck size={13} className="text-cyan" />
              <span>Zero-Knowledge Ingestion</span>
            </div>
            <div className="security-badge-item">
              <ShieldCheck size={13} className="text-cyan" />
              <span>SHA-256 Verified Chains</span>
            </div>
            <div className="security-badge-item">
              <ShieldCheck size={13} className="text-cyan" />
              <span>Chain-of-Custody Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ACTIVE INGESTION PIPELINE STATUS STRIP */}
      <section className="pipeline-stepper-strip">
        <div className="stepper-header-row">
          <span className="stepper-title">ACTIVE INGESTION PIPELINE STATUS</span>
          <span className="stepper-stage-indicator">
            <span className="pulse-cyan-dot"></span>
            <span>Processing Stage 2 of 6</span>
          </span>
        </div>

        <div className="stepper-stages-grid">
          {/* Stage 1 */}
          <div className="stage-item completed">
            <div className="stage-top">
              <span className="stage-name">01 UPLOAD</span>
              <span className="stage-pct">100%</span>
            </div>
            <div className="stage-bar"><div className="stage-fill" style={{ width: '100%' }}></div></div>
            <span className="stage-desc">Stream Sealed</span>
          </div>

          {/* Stage 2 */}
          <div className="stage-item active">
            <div className="stage-top">
              <span className="stage-name">
                <RefreshCw size={11} className="spin-icon text-cyan" />
                <span>02 OCR / EXTRACT</span>
              </span>
              <span className="stage-pct text-cyan">60%</span>
            </div>
            <div className="stage-bar"><div className="stage-fill fill-cyan" style={{ width: '60%' }}></div></div>
            <span className="stage-desc">Tesseract + Whisper</span>
          </div>

          {/* Stage 3 */}
          <div className="stage-item queued">
            <div className="stage-top">
              <span className="stage-name">03 CHUNKING</span>
              <span className="stage-pct text-muted">QUEUED</span>
            </div>
            <div className="stage-bar"><div className="stage-fill" style={{ width: '0%' }}></div></div>
            <span className="stage-desc">512-Token Semantic</span>
          </div>

          {/* Stage 4 */}
          <div className="stage-item queued">
            <div className="stage-top">
              <span className="stage-name">04 EMBEDDINGS</span>
              <span className="stage-pct text-muted">QUEUED</span>
            </div>
            <div className="stage-bar"><div className="stage-fill" style={{ width: '0%' }}></div></div>
            <span className="stage-desc">ada-002 Vector Space</span>
          </div>

          {/* Stage 5 */}
          <div className="stage-item queued">
            <div className="stage-top">
              <span className="stage-name">05 CRYPTO SHA</span>
              <span className="stage-pct text-muted">QUEUED</span>
            </div>
            <div className="stage-bar"><div className="stage-fill" style={{ width: '0%' }}></div></div>
            <span className="stage-desc">Merkle Tree Ledger</span>
          </div>

          {/* Stage 6 */}
          <div className="stage-item queued">
            <div className="stage-top">
              <span className="stage-name">06 VERIFIED</span>
              <span className="stage-pct text-muted">WAITING</span>
            </div>
            <div className="stage-bar"><div className="stage-fill" style={{ width: '0%' }}></div></div>
            <span className="stage-desc">Ready for Dossier</span>
          </div>
        </div>
      </section>

      {/* 4. SPLIT 2-COLUMN: BATCH FILES & STREAM (LEFT) + METADATA FORM (RIGHT) */}
      <div className="upload-bottom-grid">
        {/* LEFT COLUMN: ACTIVE BATCH & REALTIME OCR FEED */}
        <div className="upload-left-col">
          {/* Active Batch Container */}
          <div className="active-batch-card">
            <div className="batch-header-row">
              <div className="batch-title-wrap">
                <FileText size={14} className="text-cyan" />
                <span className="batch-name">Batch #2024-10-18-B</span>
              </div>
              <span className="batch-count-pill">3 Files Attached</span>
            </div>

            {/* File 1: PDF */}
            <div className="batch-file-item">
              <div className="file-item-header">
                <div className="file-info-group">
                  <div className="file-type-icon icon-amber">
                    <FileText size={15} />
                  </div>
                  <div className="file-names-group">
                    <div className="file-filename">Gov_Gazette_Notice_2019_Coastal.pdf</div>
                    <div className="file-filesize">42.4 MB · Scanned Document (Dual Column)</div>
                  </div>
                </div>
                <span className="file-pct-tag">58%</span>
              </div>
              <div className="file-progress-track">
                <div className="file-progress-fill" style={{ width: '58%' }}></div>
              </div>
              <div className="file-sub-status">
                <div className="status-left">
                  <RefreshCw size={11} className="spin-icon text-cyan" />
                  <span>Running Forensic OCR (Page 14/28)</span>
                </div>
                <Layers size={13} className="text-muted" />
              </div>
            </div>

            {/* File 2: Audio FLAC */}
            <div className="batch-file-item">
              <div className="file-item-header">
                <div className="file-info-group">
                  <div className="file-type-icon icon-cyan">
                    <Music size={15} />
                  </div>
                  <div className="file-names-group">
                    <div className="file-filename">Field_Interview_Fishermens_Union_Tape3.flac</div>
                    <div className="file-filesize">128 MB · Dual-Channel Field Audio (Marathi/Hindi)</div>
                  </div>
                </div>
                <span className="file-pct-tag text-cyan">92%</span>
              </div>
              <div className="file-progress-track">
                <div className="file-progress-fill fill-cyan" style={{ width: '92%' }}></div>
              </div>
              <div className="file-sub-status">
                <div className="status-left">
                  <Sparkles size={11} className="text-cyan" />
                  <span>Speech-to-Text Transcription (Whisper v3 High-Res)</span>
                </div>
                <Sliders size={13} className="text-muted" />
              </div>
            </div>

            {/* File 3: DOCX Waiting */}
            <div className="batch-file-item item-waiting">
              <div className="file-item-header">
                <div className="file-info-group">
                  <div className="file-type-icon icon-slate">
                    <FileText size={15} />
                  </div>
                  <div className="file-names-group">
                    <div className="file-filename">Internal_Port_Trust_Correspondence_Redacted.d...</div>
                    <div className="file-filesize">4.1 MB · Rich Text Internal Memo</div>
                  </div>
                </div>
                <span className="file-pct-tag text-muted">0%</span>
              </div>
              <div className="file-progress-track">
                <div className="file-progress-fill" style={{ width: '0%' }}></div>
              </div>
              <div className="file-sub-status">
                <div className="status-left">
                  <span>Queued for PII Redaction Scan</span>
                </div>
                <span className="waiting-pill">WAITING</span>
              </div>
            </div>
          </div>

          {/* Real-time OCR Stream 01 Card */}
          <div className="ocr-stream-live-card">
            <div className="ocr-stream-bar">
              <span className="ocr-stream-tag">REALTIME OCR FEED // STREAM 01</span>
              <span className="ocr-frame-tag">Frame: 0048.raw</span>
            </div>
            
            <blockquote className="ocr-live-text">
              “...notwithstanding the coastal zone regulations of 1991, the proposed reclamation of 110 hectares for the vehicular artery shall proceed under exemption sub-clause 4(a)(ii) as deemed emergency transit infrastructure...”
            </blockquote>

            <div className="ocr-live-stats">
              <div className="live-stat-item">
                <ShieldCheck size={13} className="text-cyan" />
                <span>Confidence: <strong>97.4%</strong></span>
              </div>
              <div className="live-stat-item">
                <span>Entities Detected: <strong>4 Names, 2 Agencies</strong></span>
              </div>
            </div>

            {/* 2 Scanned Facsimile Thumbnails */}
            <div className="ocr-live-thumbs-grid">
              <div 
                className="ocr-thumb-card" 
                onClick={() => onOpenPdf(1)}
                title="Inspect Page 14 Facsimile Scan"
              >
                <img 
                  src="/assets/scanned_typed_document_redacted.jpg" 
                  alt="Scanned Legal Document" 
                  className="ocr-thumb-img" 
                />
              </div>

              <div 
                className="ocr-thumb-card" 
                onClick={() => onOpenPdf(2)}
                title="Inspect Ledger Facsimile Scan"
              >
                <img 
                  src="/assets/vintage_open_archival_ledger.jpg" 
                  alt="Open Archival Ledger" 
                  className="ocr-thumb-img" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INGESTION METADATA & PROVENANCE FORM */}
        <div className="upload-right-col">
          <form onSubmit={handleConfirmUpload} className="provenance-form-card">
            <div className="provenance-header-row">
              <div className="provenance-title-group">
                <FileCheck size={16} className="text-cyan" />
                <h2 className="provenance-title">Ingestion Metadata &amp; Provenance</h2>
              </div>
              <div className="schema-pill">
                <span className="amber-dot"></span>
                <span>Mandatory Archive Schema v2.1</span>
              </div>
            </div>

            {/* Document Title */}
            <div className="p-form-group">
              <label className="p-label">Document Title / Masthead Identifier *</label>
              <input 
                type="text" 
                className="p-input" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* 2-Column Row 1: Author & Publication */}
            <div className="p-grid-2">
              <div className="p-form-group">
                <label className="p-label">Lead Author / Deponent</label>
                <input 
                  type="text" 
                  className="p-input" 
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>

              <div className="p-form-group">
                <label className="p-label">Publication / Issuing Body *</label>
                <input 
                  type="text" 
                  className="p-input" 
                  value={formData.publication}
                  onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* 2-Column Row 2: Ingestion Date & Original Doc Date */}
            <div className="p-grid-2">
              <div className="p-form-group">
                <label className="p-label">Ingestion Date (Locked)</label>
                <div className="p-input-with-icon disabled">
                  <Calendar size={13} className="p-icon" />
                  <input 
                    type="text" 
                    className="p-input-embedded" 
                    value={formData.ingestionDate}
                    disabled
                  />
                </div>
              </div>

              <div className="p-form-group">
                <label className="p-label">Original Document Date *</label>
                <input 
                  type="text" 
                  className="p-input" 
                  value={formData.docDate}
                  onChange={(e) => setFormData({ ...formData, docDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* 2-Column Row 3: Classification & Clearance */}
            <div className="p-grid-2">
              <div className="p-form-group">
                <label className="p-label">Content Classification *</label>
                <div className="p-select-wrap">
                  <select 
                    className="p-select"
                    value={formData.classification}
                    onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                  >
                    <option value="Government Gazette / Official Filing">Government Gazette / Official Filing</option>
                    <option value="Print Article / Newspaper">Print Article / Newspaper</option>
                    <option value="Audio Deposition / Transcript">Audio Deposition / Transcript</option>
                    <option value="Judicial Writ / Petition">Judicial Writ / Petition</option>
                  </select>
                  <ChevronDown size={13} className="p-arrow" />
                </div>
              </div>

              <div className="p-form-group">
                <label className="p-label">Clearance &amp; Sensitivity Level</label>
                <div className="p-select-wrap">
                  <select 
                    className="p-select"
                    value={formData.clearance}
                    onChange={(e) => setFormData({ ...formData, clearance: e.target.value })}
                  >
                    <option value="Declassified / Public Record">Declassified / Public Record</option>
                    <option value="Confidential Press Wire">Confidential Press Wire</option>
                    <option value="Restricted Investigative Memo">Restricted Investigative Memo</option>
                  </select>
                  <ChevronDown size={13} className="p-arrow" />
                </div>
              </div>
            </div>

            {/* 2-Column Row 4: Archive Ref ID & Cryptographic Hash */}
            <div className="p-grid-2">
              <div className="p-form-group">
                <label className="p-label font-mono">ARCHIVE REFERENCE ID</label>
                <div className="p-hash-box">
                  <span className="p-hash-val text-cyan">{formData.archiveRef}</span>
                  <button type="button" className="p-copy-btn" onClick={handleCopyRef} title="Copy Reference">
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="p-form-group">
                <label className="p-label font-mono">CRYPTOGRAPHIC HASH PREVIEW</label>
                <div className="p-hash-box">
                  <span className="p-hash-val text-cyan-bright">{formData.hashPreview}</span>
                  <button type="button" className="p-copy-btn" onClick={handleCopyHash} title="Copy SHA-256 Hash">
                    <ShieldCheck size={14} className="text-cyan" />
                  </button>
                </div>
              </div>
            </div>

            {/* Forensic Cross-Reference Tags */}
            <div className="p-form-group">
              <label className="p-label">Forensic Cross-Reference Tags</label>
              <div className="p-tags-container">
                {tags.map((tag, idx) => (
                  <div key={idx} className="p-tag-pill">
                    <span>{tag}</span>
                    <button type="button" className="p-tag-remove" onClick={() => removeTag(tag)}>
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {isAddingTag ? (
                  <div className="p-tag-input-wrap">
                    <input 
                      type="text" 
                      className="p-tag-input"
                      placeholder="Tag name..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addTag(e);
                        if (e.key === 'Escape') setIsAddingTag(false);
                      }}
                    />
                    <button type="button" className="p-tag-add-btn" onClick={addTag}>
                      <Check size={11} />
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="btn-add-tag-trigger"
                    onClick={() => setIsAddingTag(true)}
                  >
                    <Plus size={11} />
                    <span>Add Tag</span>
                  </button>
                )}
              </div>
            </div>

            {/* Verification Checkbox */}
            <label className="p-checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.confirmed} 
                onChange={(e) => setFormData({ ...formData, confirmed: e.target.checked })}
                className="p-checkbox"
              />
              <span className="p-checkbox-text">
                I confirm that these primary source documents conform to MediaMind forensic integrity standards. Unredacted sensitive personal data (national IDs, private bank details) will be routed through the synthetic PII scrubber.
              </span>
            </label>

            {/* Footer Form Actions */}
            <div className="p-form-footer">
              <button 
                type="button" 
                className="btn-cancel-ingestion"
                onClick={() => showToast('Ingestion batch cancelled', 'info')}
              >
                Cancel Ingestion
              </button>

              <div className="p-footer-right">
                <button 
                  type="button" 
                  className="btn-save-draft"
                  onClick={() => showToast('Draft dossier metadata saved locally', 'info')}
                >
                  Save Draft Dossier
                </button>

                <button 
                  type="submit" 
                  className="btn-confirm-archive"
                  disabled={!formData.confirmed}
                >
                  <UploadCloud size={14} />
                  <span>Confirm &amp; Add to Archive</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
