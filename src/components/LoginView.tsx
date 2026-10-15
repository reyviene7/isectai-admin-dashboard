import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';
import type { UserAccount } from '../lib/types';
import { api } from '../lib/api';

interface LoginViewProps {
  onLogin: (user: UserAccount) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, theme, onToggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState(false);

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
      const res = await api.login(email, password);
      if (res.success && res.user) {
        onLogin(res.user);
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch {
      setErrorMessage('Unable to connect to authorization server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMessage(null);
  };

  return (
    <div className="login-screen-wrapper">
      {/* Top Navbar */}
      <header className="login-top-bar">
        {/* Elevated Glassmorphic Brand Capsule */}
        <div className="login-brand-capsule">
          <div className="brand-logo-mark">
            <span>iS</span>
          </div>
          <div className="brand-copy">
            <div className="brand-name-row">
              <span className="brand-primary-name">iSect</span>
              <span className="brand-gradient-tag">AI</span>
            </div>
            <span className="brand-sub-badge">
              <span className="brand-live-dot" />
              <span>Platform OS</span>
            </span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode (#17181D)' : 'Switch to Light Mode'}
          id="login-theme-toggle"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </header>

      {/* Main Login Card Container */}
      <main className="login-card-container">
        <div className="login-card-box">
          {/* Header (No redundant logo-glow) */}
          <div className="login-header-section">
            <h1 className="login-title">Sign in to your account</h1>
            <p className="login-subtitle">
              Enter your credentials to access your administrative workspace
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="login-error-banner" role="alert">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Forgot Password Notice */}
          {forgotNotice && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-soft)',
                border: '1px solid var(--primary-border)',
                color: 'var(--primary)',
                fontSize: '0.78rem',
                lineHeight: 1.4
              }}
            >
              Password resets are managed by your Platform Administrator. Contact <strong>admin@isectai.internal</strong> for credential recovery.
            </div>
          )}

          {/* Clean Login Form */}
          <form onSubmit={handleFormLogin} className="login-form">
            {/* Work Email */}
            <div className="form-field-group">
              <label htmlFor="login-email-input">Work Email</label>
              <div className="input-with-icon">
                <Mail size={16} className="field-icon" />
                <input
                  id="login-email-input"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="login-password-input">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotNotice(!forgotNotice)}
                  className="link-subtle"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                    fontWeight: 600
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div className="input-with-icon">
                <Lock size={16} className="field-icon" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '2px 0'
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', width: 15, height: 15, cursor: 'pointer' }}
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-login-submit"
              disabled={isLoading}
              id="login-submit-btn"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Discrete Demo Credentials Helper (Clean micro-chips, not bulky buttons) */}
          <div className="demo-credentials-helper">
            <span className="demo-helper-label">Fill test credentials:</span>
            <div className="demo-chips-row">
              <button
                type="button"
                className="demo-chip"
                onClick={() => autofillAccount('admin@isectai.internal')}
                title="Autofill Platform Admin credentials"
              >
                <ShieldCheck size={11} color="var(--primary)" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                className="demo-chip"
                onClick={() => autofillAccount('staff@apexdental.com')}
                title="Autofill Clinic Staff credentials"
              >
                <Check size={11} color="var(--medical-color)" />
                <span>Clinic Staff</span>
              </button>

              <button
                type="button"
                className="demo-chip"
                onClick={() => autofillAccount('staff@voltflow.com')}
                title="Autofill Dispatcher credentials"
              >
                <Check size={11} color="var(--service-color)" />
                <span>Field Dispatcher</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Security Footer */}
      <footer className="login-footer">
        <span>Protected by iSectAI Multi-Tenant Security & End-to-End Encryption</span>
      </footer>
    </div>
  );
};
