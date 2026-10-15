import React from 'react';
import { PhoneCall, Clock, Cpu, MessageSquareQuote } from 'lucide-react';
import type { AIActivityLog, Tenant } from '../lib/types';

interface AITelemetryViewProps {
  logs: AIActivityLog[];
  tenants: Tenant[];
}

export const AITelemetryView: React.FC<AITelemetryViewProps> = ({ logs, tenants }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {logs.map((log) => {
        const tenant = tenants.find((t) => t.id === log.tenant_id);

        return (
          <div
            key={log.id}
            style={{
              background: 'var(--bg-shell)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PhoneCall size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {log.caller_name}
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                      ({log.caller_phone})
                    </span>
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Tenant: {tenant?.name || 'Clinic'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  className={`badge-clean ${
                    log.sentiment === 'urgent' ? 'badge-danger' : 'badge-success'
                  }`}
                >
                  {log.sentiment}
                </span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> {log.duration_seconds}s
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Cpu size={13} /> {log.tokens_used.toLocaleString()} tokens
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {log.summary}
            </p>

            {/* Transcript Snippet */}
            <div
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8
              }}
            >
              <MessageSquareQuote size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{log.transcript_snippet}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
