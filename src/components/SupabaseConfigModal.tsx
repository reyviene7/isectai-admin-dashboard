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

    // Save temporary config to test
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
      message: 'Credentials cleared. Switched to instant local demonstration mode.'
    });
    onConfigSaved();
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="supabase-modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Supabase Connection Manager
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Configure live PostgreSQL credentials or evaluate via local mode
              </p>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ borderRadius: '50%', width: 32, height: 32, padding: 0 }}
            id="close-supabase-modal-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTestAndSave} className="modal-body">
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              fontSize: '0.84rem',
              color: '#c7d2fe',
              marginBottom: 20
            }}
          >
            💡 <strong>Quick Setup:</strong> In your Supabase project, execute the SQL found in{' '}
            <code>supabase/schema.sql</code> and <code>supabase/seed.sql</code>. Then paste your Project URL and Anon API Key below to connect live!
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="supabase-url-input">
              Project URL (e.g., https://your-project.supabase.co)
            </label>
            <input
              id="supabase-url-input"
              type="text"
              className="form-input"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="supabase-key-input">
              Supabase Anon Public API Key
            </label>
            <input
              id="supabase-key-input"
              type="password"
              className="form-input"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              required
            />
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                marginTop: 16,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                fontSize: '0.84rem',
                background: testResult.success
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(244, 63, 94, 0.15)',
                border: `1px solid ${
                  testResult.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'
                }`,
                color: testResult.success ? '#6ee7b7' : '#fda4af'
              }}
            >
              {testResult.success ? (
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              ) : (
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              )}
              <div>
                <p style={{ fontWeight: 600 }}>{testResult.message}</p>
                {testResult.latencyMs && (
                  <p style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 2 }}>
                    Roundtrip Latency: {testResult.latencyMs} ms
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="modal-footer" style={{ padding: '20px 0 0 0', marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
              style={{ marginRight: 'auto' }}
            >
              <Trash2 size={15} />
              <span>Reset to Local Demo</span>
            </button>

            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="btn btn-primary" disabled={isTesting}>
              {isTesting ? (
                <>
                  <RefreshCw size={15} className="spin" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <Server size={15} />
                  <span>Connect & Verify</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
