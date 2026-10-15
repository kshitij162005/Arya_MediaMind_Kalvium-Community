import React, { useState } from 'react';
import { UploadCloud, X, FileText, CheckCircle2, ShieldCheck, Database } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    date: '2019-06-20',
    publication: 'The Daily Chronicle',
    contentType: 'Article',
    fileRef: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onUploadSuccess) onUploadSuccess(formData.title || 'Ingested Document');
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window upload-dialog-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="scanned-pill">
              <Database size={14} className="text-cyan" />
              ARCHIVE INGESTION NODE
            </span>
            <span className="modal-doc-title">Upload & Index Archival Record</span>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {isSuccess ? (
          <div className="upload-success-state">
            <CheckCircle2 size={48} className="text-cyan" />
            <h3>Document Ingested & Cryptographically Indexed</h3>
            <p>OCR stream extraction completed. Vector embeddings generated and anchored to cold vault storage.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="dropzone-box">
              <UploadCloud size={32} className="text-cyan mb-2" />
              <div className="dropzone-label">Drag & drop scanned PDF, TIFF, audio transcript or doc</div>
              <div className="dropzone-sub">Supported formats: PDF, TXT, DOCX, WAV (OCR & ASR enabled up to 600 DPI)</div>
              <input 
                type="file" 
                className="dropzone-input" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormData(prev => ({ 
                      ...prev, 
                      fileRef: e.target.files[0].name,
                      title: prev.title || e.target.files[0].name.replace(/\.[^/.]+$/, "")
                    }));
                  }
                }} 
              />
              {formData.fileRef && (
                <div className="selected-file-badge">
                  <FileText size={14} className="text-cyan" />
                  <span>{formData.fileRef}</span>
                </div>
              )}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Document Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Coastal Freeway Environmental Audit 2019"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Author / Deponent</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Rahul Mehta / Municipal Secretary"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Publication Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Source / Publication</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. The Daily Chronicle (Print Edition)"
                  value={formData.publication}
                  onChange={(e) => setFormData({...formData, publication: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Content Type</label>
                <select 
                  className="form-input"
                  value={formData.contentType}
                  onChange={(e) => setFormData({...formData, contentType: e.target.value})}
                >
                  <option value="Article">Archival Article / Newsprint</option>
                  <option value="Transcript">Interview Transcript</option>
                  <option value="FootageNotes">Archival Footage Notes</option>
                  <option value="JudicialOrder">Judicial Order / Legal Writ</option>
                  <option value="GovernmentGazette">Government Gazette / Notification</option>
                </select>
              </div>

              <div className="form-group">
                <label>Storage Vault Node</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value="Asia-South-1 (Cold Vault B · Encrypted)" 
                  disabled
                />
              </div>
            </div>

            <div className="upload-form-footer">
              <div className="crypto-status">
                <ShieldCheck size={14} className="text-cyan" />
                <span>Strict Ingestion: SHA256 integrity check enforced</span>
              </div>
              <div className="actions">
                <button type="button" className="btn-secondary-sm" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary-sm" disabled={isUploading}>
                  {isUploading ? 'Ingesting & Indexing...' : 'Index Into Archive'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
