import React, { useState } from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Wrench,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  AlertCircle
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        onLogin(res.user);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMessage('Unexpected server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPassword: string = 'password123') => {
    setIsLoading(true);
    setErrorMessage(null);
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      const res = await api.login(demoEmail, demoPassword);
      if (res.success && res.user) {
        onLogin(res.user);
      } else {
        setErrorMessage(res.error || 'Quick login failed.');
      }
    } catch {
      setErrorMessage('Unexpected server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      {/* Top Navbar with Theme Toggle */}
      <div className="login-top-bar">
        <div className="login-brand-pill">
          <div className="brand-icon" style={{ width: 32, height: 32, fontSize: '0.95rem' }}>
            iS
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
            iSectAI
          </span>
          <span className="badge-clean badge-medical" style={{ fontSize: '0.65rem' }}>
            Enterprise Auth
          </span>
        </div>

        <button
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode (#17181D)' : 'Switch to Light Mode'}
          id="login-theme-toggle"
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>
      </div>

      {/* Main Login Center Card */}
      <div className="login-card-container">
        <div className="login-card-box">
          {/* Header */}
          <div className="login-header-section">
            <div className="login-logo-glow">
              <Sparkles size={26} color="#3b82f6" />
            </div>
            <h1 className="login-title">Sign in to iSectAI</h1>
            <p className="login-subtitle">
              Unified AI automation platform for specialty medical clinics & field trade dispatches
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="login-error-banner">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick 1-Click Role Switcher Demo Cards */}
          <div className="quick-roles-container">
            <div className="quick-roles-header">
              <span>Quick Demo Sign-In (Click role to test)</span>
            </div>

            <div className="quick-roles-grid">
              {/* Admin Button */}
              <button
                type="button"
                className="quick-role-card role-admin"
                onClick={() => handleQuickLogin('admin@isectai.internal')}
                id="quick-login-admin"
              >
                <div className="role-icon-box role-icon-admin">
                  <ShieldCheck size={18} />
                </div>
                <div className="role-meta">
                  <div className="role-title-row">
                    <strong>Sarah Chen</strong>
                    <span className="badge-clean badge-primary">Platform Admin</span>
                  </div>
                  <span className="role-desc">Full access • Add Staff • DB Config • All Businesses</span>
                </div>
                <ArrowRight size={14} className="role-arrow" />
              </button>

              {/* Clinic Staff Button */}
              <button
                type="button"
                className="quick-role-card role-staff-clinic"
                onClick={() => handleQuickLogin('staff@apexdental.com')}
                id="quick-login-clinic-staff"
              >
                <div className="role-icon-box role-icon-clinic">
                  <Stethoscope size={18} />
                </div>
                <div className="role-meta">
                  <div className="role-title-row">
                    <strong>Elena Ramos</strong>
                    <span className="badge-clean badge-medical">Clinic Staff</span>
                  </div>
                  <span className="role-desc">Apex Dental • Appointments & Patient Itinerary</span>
                </div>
                <ArrowRight size={14} className="role-arrow" />
              </button>

              {/* Field Service Staff Button */}
              <button
                type="button"
                className="quick-role-card role-staff-service"
                onClick={() => handleQuickLogin('staff@voltflow.com')}
                id="quick-login-service-staff"
              >
                <div className="role-icon-box role-icon-service">
                  <Wrench size={18} />
                </div>
                <div className="role-meta">
                  <div className="role-title-row">
                    <strong>Marcus Vance</strong>
                    <span className="badge-clean badge-service">Field Dispatcher</span>
                  </div>
                  <span className="role-desc">VoltFlow HVAC • Work Orders & Trade Dispatches</span>
                </div>
                <ArrowRight size={14} className="role-arrow" />
              </button>
            </div>
          </div>

          <div className="login-divider">
            <span>Or sign in with custom credentials</span>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleFormLogin} className="login-form">
            <div className="form-field-group">
              <label>Work Email</label>
              <div className="input-with-icon">
                <Mail size={16} className="field-icon" />
                <input
                  type="email"
                  placeholder="admin@isectai.internal or staff@apexdental.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="login-email-input"
                />
              </div>
            </div>

            <div className="form-field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Password</label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Default: password123
                </span>
              </div>
              <div className="input-with-icon">
                <Lock size={16} className="field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="login-password-input"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-login-submit"
              disabled={isLoading}
              id="login-submit-btn"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* RBAC Info Notice */}
          <div className="login-info-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <CheckCircle2 size={13} color="#059669" />
              <strong style={{ fontSize: '0.76rem', color: 'var(--text-main)' }}>
                Role-Based Permissions (RBAC)
              </strong>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              <strong>Admin:</strong> Full system access, database settings, and authority to provision staff accounts.
              <br />
              <strong>Staff:</strong> Scoped operational access to clinic appointments and emergency dispatches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
