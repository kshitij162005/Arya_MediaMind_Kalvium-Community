import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';

export default function FlagDiscrepancyModal({ citation, isOpen, onClose, onFlagSubmitted }) {
  const [reason, setReason] = useState('semantic_drift');
  const [notes, setNotes] = useState('');

  if (!isOpen || !citation) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onFlagSubmitted) {
      onFlagSubmitted({
        citationId: citation.id,
        reason,
        notes: notes || 'Flagged by lead investigator for manual audit'
      });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window flag-dialog-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="flag-pill">
              <AlertTriangle size={14} className="text-amber" />
              INVESTIGATIVE INTEGRITY AUDIT
            </span>
            <span className="modal-doc-title">Flag Citation Discrepancy — Citation [{citation.id}]</span>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flag-form">
          <div className="flag-notice-banner">
            <ShieldAlert size={16} className="text-amber" />
            <p>
              Flagging halts publishing wire approval for claims derived from <strong>{citation.archiveRef}</strong> until an archival auditor reviews the discrepancy.
            </p>
          </div>

          <div className="form-group mb-4">
            <label>Discrepancy Category</label>
            <select 
              className="form-input" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="semantic_drift">Semantic Drift / Unsupported Extrapolation</option>
              <option value="temporal_mismatch">Temporal Mismatch (Event date differs from synthesis)</option>
              <option value="quote_truncation">Quotation Out of Context or Truncated</option>
              <option value="source_inconsistency">Conflicting Secondary Source Discovered</option>
            </select>
          </div>

          <div className="form-group mb-4">
            <label>Investigator Notes & Auditor Instructions</label>
            <textarea 
              className="form-input" 
              rows={3}
              placeholder="Detail the exact variance between the AI synthesis and the raw facsimile passage..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flag-form-footer">
            <button type="button" className="btn-secondary-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-warning-sm">
              <AlertTriangle size={14} />
              <span>Submit Discrepancy Flag</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
