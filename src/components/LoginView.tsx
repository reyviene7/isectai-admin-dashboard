import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sun,
  Moon,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Activity,
  Zap,
  Cpu
} from 'lucide-react';
import type { UserAccount } from '../lib/types';
import { api } from '../lib/api';
import { ActionLoadingOverlay } from './ActionLoadingOverlay';
import { LegalModal } from './LegalModal';
import type { LegalTab } from './LegalModal';

interface LoginViewProps {
  onLogin: (user: UserAccount, rememberMe?: boolean) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

interface SpotlightItem {
  id: string;
  category: string;
  categoryIcon: 'medical' | 'dispatch' | 'security';
  metricHighlight: string;
  quote: string;
  author: string;
  handle: string;
  role: string;
  organization: string;
  initials: string;
  avatarColor: string;
}

const SPOTLIGHTS: SpotlightItem[] = [
  {
    id: 'spotlight-1',
    category: 'CLINICAL VOICE RECEPTION',
    categoryIcon: 'medical',
    metricHighlight: '94% Autonomous Triage',
    quote: 'iSectAI autonomous reception handles 94% of our after-hours clinical triage without missing a single patient. Our front-desk burnout has disappeared completely.',
    author: 'Dr. Julian Vance, DDS',
    handle: 'dr.vance',
    role: 'Chief Dental Surgeon',
    organization: 'Apex Dental Care',
    initials: 'JV',
    avatarColor: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)'
  },
  {
    id: 'spotlight-2',
    category: 'FIELD DISPATCH TELEMETRY',
    categoryIcon: 'dispatch',
    metricHighlight: '8 min Avg Response',
    quote: 'Emergency dispatch turnaround dropped from 45 minutes to 8 minutes. The voice AI captures technical job specs with zero transcription errors.',
    author: 'Marcus Brody',
    handle: 'marcus.brody',
    role: 'Operations Director',
    organization: 'VoltFlow Electrical Services',
    initials: 'MB',
    avatarColor: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
  },
  {
    id: 'spotlight-3',
    category: 'MULTI-TENANT COMPLIANCE',
    categoryIcon: 'security',
    metricHighlight: 'PostgreSQL RLS Active',
    quote: 'PostgreSQL Row-Level Security guarantees strict cryptographic tenant separation across all database nodes with zero cross-organization data bleed.',
    author: 'Elena Rostova',
    handle: 'elena.sec',
    role: 'Principal Security Architect',
    organization: 'iSectAI Core Infrastructure',
    initials: 'ER',
    avatarColor: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)'
  }
];

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  theme,
  onToggleTheme
}) => {
  // Initialize Remember Me from localStorage (default to true if not set)
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('isectai_remember_me');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  // Pre-fill email if Remember Me was previously active
  const [email, setEmail] = useState<string>(() => {
    try {
      const storedRemember = localStorage.getItem('isectai_remember_me');
      if (storedRemember === 'false') return '';
      return localStorage.getItem('isectai_remembered_email') || '';
    } catch {
      return '';
    }
  });

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab | null>(null);
  const [activeSpotlightIdx, setActiveSpotlightIdx] = useState(0);

  // Auto cycle spotlight every 7 seconds (resets on manual switch for seamless viewing)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpotlightIdx((prev) => (prev + 1) % SPOTLIGHTS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [activeSpotlightIdx]);

  // Lock 0 padding and hidden overflow on body during login view
  useEffect(() => {
    const originalPadding = document.body.style.padding;
    const originalOverflow = document.body.style.overflow;
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.padding = originalPadding;
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    try {
      localStorage.setItem('isectai_remember_me', checked ? 'true' : 'false');
      if (!checked) {
        localStorage.removeItem('isectai_remembered_email');
      } else if (email.trim()) {
        localStorage.setItem('isectai_remembered_email', email.trim());
      }
    } catch (err) {
      console.warn('Storage error on remember me toggle:', err);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (rememberMe) {
      try {
        if (val.trim()) {
          localStorage.setItem('isectai_remembered_email', val.trim());
        } else {
          localStorage.removeItem('isectai_remembered_email');
        }
      } catch (err) {
        console.warn('Storage error on email change:', err);
      }
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your work email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setForgotNotice(false);

    try {
      const [res] = await Promise.all([
        api.login(email, password),
        new Promise((resolve) => setTimeout(resolve, 600))
      ]);
      if (res.success && res.user) {
        try {
          if (rememberMe) {
            localStorage.setItem('isectai_remember_me', 'true');
            localStorage.setItem('isectai_remembered_email', email.trim());
          } else {
            localStorage.setItem('isectai_remember_me', 'false');
            localStorage.removeItem('isectai_remembered_email');
          }
        } catch (storageErr) {
          console.warn('Storage error on login save:', storageErr);
        }
        onLogin(res.user, rememberMe);
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch {
      setErrorMessage('Unable to connect to authorization server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="isect-login-viewport">
      {isLoading && (
        <ActionLoadingOverlay
          title="Signing you in… please wait."
          subtitle="Authenticating credentials & establishing secure session..."
        />
      )}
      {/* Top Header Bar */}
      <header className="isect-login-nav">
        {/* Proprietary iSect Brand */}
        <div className="isect-brand-wrapper">
          <div className="isect-brand-text-block">
            <span className="font-display text-[1.375rem] leading-none font-bold tracking-[-0.02em] text-ink">
              <span className="text-mark">i</span>Sect
            </span>
            <span className="isect-os-tag">AI</span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="isect-nav-actions">
          {/* Live System Operational Indicator */}
          <div className="isect-telemetry-badge" title="All database nodes & voice channels operational">
            <span className="telemetry-beacon" />
            <span className="telemetry-text">Systems Operational</span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            className="isect-theme-btn"
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode (#17181D)' : 'Switch to Light Mode'}
            id="isect-login-theme-toggle"
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </header>

      {/* Main Split Grid */}
      <main className="isect-login-grid">
        {/* Left Form Workspace */}
        <div className="isect-form-pane">
          <div className="isect-form-card">
            {/* Form Header */}
            <div className="isect-card-header">
              <div className="isect-badge-tag">
                <Sparkles size={11} color="#10b981" />
                <span>ENTERPRISE GATEWAY</span>
              </div>
              <h1 className="isect-title">Welcome to <span className="isect-title-brand"><span className="text-mark">i</span>Sect</span></h1>
              <p className="isect-subtitle">
                Autonomous Reception & Multi-Tenant Operations Console
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="isect-alert-banner" role="alert">
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Admin Notice */}
            {forgotNotice && (
              <div className="isect-info-banner">
                Password resets are managed by your Platform Administrator. Contact{' '}
                <strong>admin@isectai.internal</strong> for credential recovery.
              </div>
            )}

            {/* Pure Email & Password Login Form */}
            <form onSubmit={handleFormLogin} className="isect-input-form">
              {/* Work Email */}
              <div className="isect-field-group">
                <label htmlFor="user-email-input">Email</label>
                <div className="isect-field-shell">
                  <Mail size={15} className="isect-input-icon" />
                  <input
                    id="user-email-input"
                    type="email"
                    placeholder="name@organization.com"
                    value={email}
                    onChange={handleEmailChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="isect-field-group">
                <label htmlFor="user-password-input">Password</label>
                <div className="isect-field-shell">
                  <Lock size={15} className="isect-input-icon" />
                  <input
                    id="user-password-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="isect-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="isect-remember-row">
                <label className="isect-checkbox-label" htmlFor="isect-remember-me-checkbox">
                  <input
                    id="isect-remember-me-checkbox"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="isect-link-subtle"
                  onClick={() => setForgotNotice(!forgotNotice)}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="isect-submit-btn"
                disabled={isLoading}
                id="isect-submit-button"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Console</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Terms of Service & Privacy Policy Disclaimer */}
            <div className="isect-footer-block">
              <p className="isect-security-note">
                By continuing, you agree to iSectAI’s{' '}
                <button
                  type="button"
                  className="isect-signup-link"
                  onClick={() => setLegalModalTab('terms')}
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  className="isect-signup-link"
                  onClick={() => setLegalModalTab('privacy')}
                >
                  Privacy Policy
                </button>
                , and to receive periodic emails with updates.
              </p>
            </div>
          </div>
        </div>

        {/* Right Platform Spotlight & Live Telemetry (Desktop Only) */}
        <div className="isect-spotlight-pane">
          <div className="isect-spotlight-card">
            {/* Sliding Track Viewport */}
            <div className="isect-spotlight-slider">
              <div
                className="isect-spotlight-track"
                style={{ transform: `translateX(-${activeSpotlightIdx * 100}%)` }}
              >
                {SPOTLIGHTS.map((spotlight, idx) => (
                  <div
                    key={spotlight.id}
                    className={`isect-spotlight-slide ${idx === activeSpotlightIdx ? 'is-active' : ''}`}
                    aria-hidden={idx !== activeSpotlightIdx}
                  >
                    {/* Spotlight Card Header */}
                    <div className="isect-spotlight-top">
                      <div className="isect-spotlight-category">
                        {spotlight.categoryIcon === 'medical' && <Activity size={13} color="var(--medical-color)" />}
                        {spotlight.categoryIcon === 'dispatch' && <Zap size={13} color="var(--service-color)" />}
                        {spotlight.categoryIcon === 'security' && <Cpu size={13} color="var(--primary)" />}
                        <span>{spotlight.category}</span>
                      </div>
                      <div className="isect-metric-pill">
                        <span>{spotlight.metricHighlight}</span>
                      </div>
                    </div>

                    {/* Illuminated Quote */}
                    <div className="isect-quote-body">
                      <div className="isect-quote-mark" aria-hidden="true">
                        “
                      </div>
                      <blockquote className="isect-quote-text">
                        {spotlight.quote}
                      </blockquote>
                    </div>

                    {/* Verified Author Card */}
                    <div className="isect-author-card">
                      <div
                        className="isect-author-avatar"
                        style={{ background: spotlight.avatarColor }}
                      >
                        <span>{spotlight.initials}</span>
                      </div>
                      <div className="isect-author-info">
                        <div className="isect-author-name-row">
                          <span className="isect-author-name">{spotlight.author}</span>
                          <span className="isect-verified-tag">✓ Verified Practitioner</span>
                        </div>
                        <span className="isect-author-role">
                          {spotlight.role} · <strong>{spotlight.organization}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Infrastructure Telemetry Ribbon */}
            <div className="isect-telemetry-ribbon">
              <div className="telemetry-item">
                <span className="telemetry-dot dot-green" />
                <span>Postgres RLS: Active</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-dot dot-blue" />
                <span>AI Voice Engine: 240ms</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-dot dot-purple" />
                <span>100% Tenant Isolation</span>
              </div>
            </div>

            {/* Interactive Spotlight Switcher Controls */}
            <div className="isect-spotlight-controls">
              <div className="isect-spotlight-pills">
                {SPOTLIGHTS.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`isect-pill-indicator ${idx === activeSpotlightIdx ? 'active' : ''}`}
                    onClick={() => setActiveSpotlightIdx(idx)}
                    title={`View ${s.category}`}
                    aria-label={`View highlight ${idx + 1}`}
                  >
                    <span className="isect-pill-fill" />
                  </button>
                ))}
              </div>
              <span className="isect-spotlight-counter">
                0{activeSpotlightIdx + 1} / 0{SPOTLIGHTS.length}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Our Own Terms of Service & Privacy Policy Modal */}
      {legalModalTab && (
        <LegalModal
          initialTab={legalModalTab}
          onClose={() => setLegalModalTab(null)}
        />
      )}
    </div>
  );
};
