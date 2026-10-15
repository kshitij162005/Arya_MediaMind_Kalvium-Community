import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { initials } from '../api';
import { ACCENTS, DEFAULT_SETTINGS } from '../settings';
import { speechSupported, useVoices } from '../speech';
import ListenButton from './ListenButton';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

// Voices matching the browser language first, then the rest, each alphabetically.
function sortVoices(voices) {
  const lang = (navigator.language || 'en').slice(0, 2);
  return [...voices].sort((a, b) =>
    (b.lang.startsWith(lang) - a.lang.startsWith(lang)) || a.name.localeCompare(b.name));
}

function Segmented({ value, options, onChange }) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button key={o.value} type="button" className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.icon && <o.icon size={14} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`switch ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

function Row({ title, hint, children }) {
  return (
    <div className="setting-row">
      <div>
        <div className="setting-title">{title}</div>
        {hint && <div className="muted small">{hint}</div>}
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}

export default function SettingsPage({ settings, onChange, user, onLogout }) {
  const set = (key) => (value) => onChange({ ...settings, [key]: value });
  const voices = sortVoices(useVoices());
  const isDefault = Object.entries(DEFAULT_SETTINGS).every(([k, v]) => settings[k] === v);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p className="muted">Personalise how MediaMind looks and behaves. Changes apply instantly on this device.</p>
        </div>
        <button className="btn ghost" disabled={isDefault} onClick={() => onChange({ ...DEFAULT_SETTINGS })}>
          Reset to defaults
        </button>
      </div>

      <div className="settings-layout">
        <div className="settings-main">
          <section className="card settings-section">
            <h2>Appearance</h2>
            <Row title="Theme" hint="System follows your operating system.">
              <Segmented
                value={settings.theme}
                onChange={set('theme')}
                options={[
                  { value: 'system', label: 'System', icon: Monitor },
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                ]}
              />
            </Row>
            <Row title="Accent colour" hint="Used for buttons, links and citations.">
              <div className="swatches">
                {Object.entries(ACCENTS).map(([key, a]) => (
                  <button
                    key={key}
                    className={`swatch ${settings.accent === key ? 'on' : ''}`}
                    style={{ '--swatch': a.value }}
                    onClick={() => set('accent')(key)}
                    title={a.label}
                    aria-label={a.label}
                    aria-pressed={settings.accent === key}
                  >
                    {settings.accent === key && <Check size={13} />}
                  </button>
                ))}
              </div>
            </Row>
            <Row title="Density" hint="Compact fits more results on screen.">
              <Segmented
                value={settings.density}
                onChange={set('density')}
                options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]}
              />
            </Row>
            <Row title="Text size">
              <Segmented
                value={settings.fontSize}
                onChange={set('fontSize')}
                options={[
                  { value: 'small', label: 'Small' },
                  { value: 'default', label: 'Default' },
                  { value: 'large', label: 'Large' },
                ]}
              />
            </Row>
            <Row title="Answer typeface" hint="Serif reads like print; sans matches the interface.">
              <Segmented
                value={settings.answerFont}
                onChange={set('answerFont')}
                options={[{ value: 'serif', label: 'Serif' }, { value: 'sans', label: 'Sans' }]}
              />
            </Row>
          </section>

          <section className="card settings-section">
            <h2>Search</h2>
            <Row title="Home dashboard" hint="Archive stats, recent documents and searches under the search bar.">
              <Toggle label="Home dashboard" checked={settings.showOverview} onChange={set('showOverview')} />
            </Row>
            <Row title="Show related sources" hint="List documents that matched but weren't quoted in the answer.">
              <Toggle label="Show related sources" checked={settings.showRelated} onChange={set('showRelated')} />
            </Row>
            <Row title="Show match scores" hint="The % match on each source card.">
              <Toggle label="Show match scores" checked={settings.showScores} onChange={set('showScores')} />
            </Row>
            <Row title="Offer web search" hint="When the archive has no answer, offer to search Wikipedia and the web.">
              <Toggle label="Offer web search" checked={settings.webFallback} onChange={set('webFallback')} />
            </Row>
          </section>

          <section className="card settings-section">
            <h2>Read aloud</h2>
            {speechSupported ? (
              <>
                <Row title="Voice" hint="Uses voices installed on this device. Free, unlimited and offline.">
                  <select className="voice-select" value={settings.voice} onChange={(e) => set('voice')(e.target.value)}>
                    <option value="">System default</option>
                    {voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
                    ))}
                  </select>
                </Row>
                <Row title="Speed">
                  <Segmented
                    value={settings.speechRate}
                    onChange={set('speechRate')}
                    options={SPEEDS.map((r) => ({ value: r, label: `${r}×` }))}
                  />
                </Row>
                <Row title="Try it" hint="Listen buttons appear on answers, sources, passages and documents.">
                  <ListenButton
                    id="settings-test"
                    label="Test voice"
                    parts={['This is how MediaMind reads answers, passages and documents aloud.']}
                  />
                </Row>
              </>
            ) : (
              <p className="muted small">This browser doesn't support read-aloud. Try Chrome, Edge or Safari.</p>
            )}
          </section>

          <section className="card settings-section">
            <h2>Account</h2>
            <div className="account">
              <span className="avatar lg">{initials(user.name)}</span>
              <div>
                <div className="setting-title">{user.name}</div>
                <div className="muted small">{user.email}</div>
              </div>
              <span className="badge push role-badge">{user.role}</span>
            </div>
            <Row title="Sign out" hint="End your session on this device.">
              <button className="btn ghost" onClick={onLogout}>Sign out</button>
            </Row>
          </section>
        </div>

        <aside className="card preview">
          <span className="muted small">Preview</span>
          <h3>Background</h3>
          <p className="answer-text">
            The protests began in June 2019 near Azad Maidan.{' '}
            <span className="cite">1</span>{' '}
            Fishing cooperatives said the reclamation would destroy their catch.{' '}
            <span className="cite">2</span>
          </p>
          <div className="preview-actions">
            <button className="btn primary small" tabIndex={-1}>Search</button>
            <span className="chip on">Interview</span>
            <span className="link small">View passage</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
