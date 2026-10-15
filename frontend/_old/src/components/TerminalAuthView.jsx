import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
  Search,
  Lock,
  AtSign,
  CheckCircle2,
  Check,
  Sparkles
} from 'lucide-react';

export default function TerminalAuthView({ onLoginSuccess, showToast }) {
  const [email, setEmail] = useState('elena.rostova@daily-chronicle.org');
  const [password, setPassword] = useState('••••••••••••••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    if (showToast) {
      showToast('Authenticating against Newsroom Audit Ledger Enclave...', 'info');
    }
    setTimeout(() => {
      setIsLoading(false);
      if (showToast) {
        showToast('Credential validated. Initializing Investigative Desk v3.4...', 'success');
      }
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }, 600);
  };

  const handleSsoLogin = () => {
    setIsLoading(true);
    if (showToast) {
      showToast('Delegating authentication to Newsroom Okta / ActiveDirectory SSO...', 'info');
    }
    setTimeout(() => {
      setIsLoading(false);
      if (showToast) {
        showToast('SSO session verified. Anchoring token #CHRON-AUDIT-2025...', 'success');
      }
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }, 600);
  };

  return (
    <div className="terminal-auth-root">
      <div className="terminal-auth-container">
        {/* TOP STATUS BAR ABOVE CARD */}
        <div className="terminal-top-status-bar">
          <div className="status-left">
            <span className="cyan-pulse-dot"></span>
            <span className="status-text-cyan">MEDIAMIND TERMINAL v3.4 / AUTH_REQUIRED</span>
          </div>
          <div className="status-right">
            <span className="status-node-cyan">NODE: COLD_STORE_08_09</span>
          </div>
        </div>

        {/* MAIN TERMINAL AUTH CARD */}
        <div className="terminal-auth-card">
          {/* Card Top Strip */}
          <div className="card-top-strip">
            <div className="strip-left">
              <Shield size={12} className="text-slate" />
              <span className="strip-text-slate">RESTRICTED BUREAU TERMINAL</span>
            </div>
            <div className="strip-right">
              <span className="attrib-badge">
                [ <span className="attrib-check">✓</span> ATTRIB_ACTIVE ]
              </span>
            </div>
          </div>

          {/* Brand Header */}
          <div className="brand-header-row">
            <div className="brand-logo-title">
              <div className="brand-lens-icon">
                <Search size={16} className="text-cyan lens-inner" />
              </div>
              <h1 className="brand-title-text">MEDIA MIND</h1>
            </div>
            <div className="brand-edition-tag">
              FORENSIC_EDITION
            </div>
          </div>

          {/* Tagline & Subtext */}
          <div className="auth-narrative-section">
            <h2 className="auth-tagline-serif">
              “Research the archive. Verify every source.”
            </h2>
            <p className="auth-instruction-subtext">
              The archive outranks the model. Inference is treated as an investigative hypothesis, not authoritative fact. Enter credentialed desk token.
            </p>
          </div>

          {/* Credentials Form */}
          <form className="auth-form-wrap" onSubmit={handleSubmit}>
            {/* Field 1: Work Email */}
            <div className="form-group-item">
              <div className="form-label-row">
                <label className="form-field-label">WORK EMAIL ADDRESS</label>
                <span className="field-meta-req">SEC_TOKEN: REQUIRED</span>
              </div>
              <div className="input-field-wrap">
                <AtSign size={13} className="input-leading-icon" />
                <input
                  type="email"
                  className="auth-input-text font-mono"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@newsroom.org"
                  required
                />
              </div>
            </div>

            {/* Field 2: Credential Phrase / Passkey */}
            <div className="form-group-item">
              <div className="form-label-row">
                <label className="form-field-label">CREDENTIAL PHRASE / PASSKEY</label>
                <button
                  type="button"
                  className="link-forgot-pass"
                  onClick={() => {
                    if (showToast) showToast('Requesting security dispatch for Elena Rostova (Desk 04-B)...', 'info');
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-field-wrap">
                <Key size={13} className="input-leading-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input-text font-mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passkey or hardware key"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide passkey' : 'Show passkey'}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              className="btn-terminal-submit"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Terminal'}</span>
              <ArrowRight size={14} className="submit-arrow-icon" />
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider-line">
            <span className="divider-text">OR CONTINUE WITH NEWSROOM CREDENTIALS</span>
          </div>

          {/* SSO Button */}
          <button
            type="button"
            className="btn-sso-action"
            onClick={handleSsoLogin}
            disabled={isLoading}
          >
            <div className="sso-left">
              <Shield size={13} className="sso-shield-icon" />
              <span className="sso-label-text">
                Newsroom SSO (Okta · Google Workspace · ActiveDirectory)
              </span>
            </div>
            <ArrowRight size={13} className="sso-arrow-icon" />
          </button>

          {/* Security Enclave Notice */}
          <div className="enclave-notice-card">
            <div className="enclave-at-box">
              <Lock size={12} className="enclave-icon" />
            </div>
            <p className="enclave-text-content">
              <strong>TLS 1.3 Strict Enclave:</strong> All investigative queries, primary source reads, and citation verifications are cryptographically anchored to newsroom audit ledger <span className="ledger-hash-highlight">#CHRON-AUDIT-2025</span>.
            </p>
          </div>
        </div>

        {/* BOTTOM METADATA FOOTER */}
        <div className="terminal-auth-footer-row">
          <span className="meta-footer-item">MediaMind v3.4</span>
          <span className="meta-footer-item">Investigative Desk Suite</span>
          <span className="meta-footer-item">Strict Attribution Active</span>
          <span className="meta-footer-item network-cyan">Daily Chronicle Network</span>
        </div>
      </div>
    </div>
  );
}
