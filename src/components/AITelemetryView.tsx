import React, { useState, useEffect } from 'react';
import { PhoneCall, Clock, Cpu, MessageSquareQuote } from 'lucide-react';
import type { AIActivityLog, Tenant } from '../lib/types';
import { Pagination } from './Pagination';

interface AITelemetryViewProps {
  logs: AIActivityLog[];
  tenants: Tenant[];
  searchQuery?: string;
}

export const AITelemetryView: React.FC<AITelemetryViewProps> = ({ logs, tenants, searchQuery = '' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredLogs = logs.filter((log) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const tenant = tenants.find((t) => t.id === log.tenant_id);
      const matchCaller = log.caller_name.toLowerCase().includes(q);
      const matchPhone = log.caller_phone.toLowerCase().includes(q);
      const matchSummary = log.summary.toLowerCase().includes(q);
      const matchTranscript = log.transcript_snippet.toLowerCase().includes(q);
      const matchSentiment = log.sentiment.toLowerCase().includes(q);
      const matchEvent = log.event_type.toLowerCase().includes(q);
      const matchTenant = tenant?.name.toLowerCase().includes(q) ?? false;
      return (
        matchCaller ||
        matchPhone ||
        matchSummary ||
        matchTranscript ||
        matchSentiment ||
        matchEvent ||
        matchTenant
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', minWidth: 0 }}>
      {paginatedLogs.length === 0 ? (
        <div
          style={{
            padding: '48px 20px',
            textAlign: 'center',
            background: 'var(--bg-shell)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-muted)'
          }}
        >
          No AI telemetry activity logs recorded yet.
        </div>
      ) : (
        paginatedLogs.map((log) => {
        const tenant = tenants.find((t) => t.id === log.tenant_id);

        return (
          <div
            key={log.id}
            style={{
              background: 'var(--bg-shell)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              width: '100%',
              minWidth: 0,
              overflow: 'hidden'
            }}
          >
            {/* Top row with clean wrapping */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10
              }}
            >
              {/* Caller Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <PhoneCall size={17} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      wordBreak: 'break-word',
                      lineHeight: 1.3
                    }}
                  >
                    {log.caller_name}
                  </h4>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexWrap: 'wrap'
                    }}
                  >
                    <span>{log.caller_phone}</span>
                    <span>•</span>
                    <span style={{ fontWeight: 600 }}>{tenant?.name.split('&')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Status and Telemetry stats */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap'
                }}
              >
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
                    gap: 8,
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={12} /> {log.duration_seconds}s
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Cpu size={12} /> {log.tokens_used.toLocaleString()} tok
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <p
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45,
                wordBreak: 'break-word'
              }}
            >
              {log.summary}
            </p>

            {/* Transcript Snippet */}
            <div
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                wordBreak: 'break-word'
              }}
            >
              <MessageSquareQuote size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ lineHeight: 1.4 }}>{log.transcript_snippet}</div>
            </div>
          </div>
        );
      }))}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredLogs.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        itemLabel="telemetry call logs"
        isStandalone={true}
      />
    </div>
  );
};
