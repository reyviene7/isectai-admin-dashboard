import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  Server,
  RefreshCw,
  Trash2
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  testSupabaseConnection
} from '../lib/supabase';
import type { ConnectionTestResult } from '../lib/supabase';

interface SupabaseConfigModalProps {
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  onClose,
  onConfigSaved
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    saveStoredSupabaseConfig(url, anonKey);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setIsTesting(false);

    if (result.success) {
      onConfigSaved();
    }
  };

  const handleClear = () => {
    saveStoredSupabaseConfig('', '');
    setUrl('');
    setAnonKey('');
    setTestResult({
      success: true,
      message: 'Reset to local demo mode.'
    });
    onConfigSaved();
  };

  return (
    <div className="clean-modal-overlay" id="supabase-modal-overlay">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
        {/* Header */}
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--success-soft)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Database Connection
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Connect live Supabase project or evaluate via local demo
              </p>
            </div>
          </div>

          <button
            className="btn-clean-secondary"
            onClick={onClose}
            style={{ width: 32, height: 32, padding: 0, justifyContent: 'center' }}
            id="close-supabase-modal-btn"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTestAndSave} className="clean-modal-body">
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              lineHeight: 1.4,
              marginBottom: 16
            }}
          >
            💡 Run <code>supabase/schema.sql</code> and <code>seed.sql</code> in your Supabase SQL Editor, then paste your credentials below.
          </div>

          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 4
              }}
            >
              Supabase Project URL
            </label>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-shell)',
                color: 'var(--text-main)',
                fontSize: '0.86rem',
                outline: 'none'
              }}
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 4
              }}
            >
              Anon Public API Key
            </label>
            <input
              type="password"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-shell)',
                color: 'var(--text-main)',
                fontSize: '0.86rem',
                outline: 'none'
              }}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              required
            />
          </div>

          {testResult && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.82rem',
                background: testResult.success ? 'var(--success-soft)' : 'var(--danger-soft)',
                color: testResult.success ? '#059669' : '#e11d48'
              }}
            >
              {testResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="clean-modal-footer" style={{ padding: '16px 0 0 0', marginTop: 16 }}>
            <button
              type="button"
              className="btn-clean-secondary"
              onClick={handleClear}
              style={{ marginRight: 'auto' }}
            >
              <Trash2 size={14} />
              <span>Reset to Demo</span>
            </button>

            <button type="button" className="btn-clean-secondary" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="btn-clean-primary" disabled={isTesting}>
              {isTesting ? (
                <>
                  <RefreshCw size={14} className="spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Server size={14} />
                  <span>Connect & Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
