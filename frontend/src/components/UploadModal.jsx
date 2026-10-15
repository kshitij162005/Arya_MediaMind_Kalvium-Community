import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { api, CONTENT_TYPE_LABELS } from '../api';

const EMPTY = { title: '', content_type: 'article', author: '', publication: '', date: '', topic: '', url: '', text: '' };

/** `initial` prefills the form (e.g. a web page being saved); everything stays editable. */
export default function UploadModal({ onClose, onUploaded, initial, heading = 'Upload to archive' }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }));
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState(initial?.text ? 'text' : 'file');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const pickFile = (f) => {
    setFile(f);
    if (f && !form.title) setForm({ ...form, title: f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ') });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'file' && !file) return setError('Choose a file to upload.');
    if (mode === 'text' && form.text.trim().length < 20) return setError('Paste the document text (at least a sentence).');

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => k !== 'text' && data.append(k, v));
    if (mode === 'file') data.append('file', file);
    else data.append('text', form.text);

    setBusy(true);
    try {
      onUploaded(await api.upload(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-wrap" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="panel-head">
          <h2>{heading}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="segmented">
          <button type="button" className={mode === 'file' ? 'on' : ''} onClick={() => setMode('file')}>File</button>
          <button type="button" className={mode === 'text' ? 'on' : ''} onClick={() => setMode('text')}>Paste text</button>
        </div>

        {mode === 'file' ? (
          <label
            className={`dropzone ${file ? 'has-file' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files[0]); }}
          >
            <input type="file" accept=".pdf,.docx,.txt,.md" hidden onChange={(e) => pickFile(e.target.files[0])} />
            <Upload size={20} />
            <span>{file ? file.name : 'Drop a file here or click to browse'}</span>
            <span className="muted small">PDF, DOCX, TXT or MD</span>
          </label>
        ) : (
          <label className="field">
            <span>Document text</span>
            <textarea rows={initial?.text ? 12 : 6} value={form.text} onChange={set('text')} placeholder="Paste an article, transcript or footage notes…" />
          </label>
        )}

        <div className="form-grid">
          <label className="field span-2">
            <span>Title *</span>
            <input value={form.title} onChange={set('title')} required />
          </label>
          <label className="field">
            <span>Content type *</span>
            <select value={form.content_type} onChange={set('content_type')}>
              {Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={form.date} onChange={set('date')} />
          </label>
          <label className="field">
            <span>Author</span>
            <input value={form.author} onChange={set('author')} />
          </label>
          <label className="field">
            <span>Publication / source</span>
            <input value={form.publication} onChange={set('publication')} />
          </label>
          <label className="field">
            <span>Topic</span>
            <input value={form.topic} onChange={set('topic')} placeholder="e.g. Mumbai Coastal Road Protests" />
          </label>
          <label className="field">
            <span>URL / reference</span>
            <input value={form.url} onChange={set('url')} placeholder="https://…" />
          </label>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Indexing…' : 'Upload & index'}</button>
        </div>
      </form>
    </div>
  );
}
