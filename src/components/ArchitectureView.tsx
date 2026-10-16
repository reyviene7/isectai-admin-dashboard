import React, { useState } from 'react';
import {
  Database,
  Lock,
  Layers,
  FileCode2,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { RelationalERDVisualizer } from './RelationalERDVisualizer';
import { SchemaAndRLSViewer } from './SchemaAndRLSViewer';
import { ArchitectureSolutionsView } from './ArchitectureSolutionsView';

export const ArchitectureView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'answers' | 'erd' | 'schema_sql'>('answers');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', minWidth: 0 }}>
      {/* 1. Contextual Architecture KPIs */}
      <div className="kpi-row" id="architecture-kpis">
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Database size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">Single DB</span>
            <span className="kpi-title">PostgreSQL 15+ & RLS</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Lock size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">Kernel RLS</span>
            <span className="kpi-title">Zero Cross-Tenant Bleed</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <Layers size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">Hybrid JSONB</span>
            <span className="kpi-title">Clinic & Trade Polymorphism</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Cpu size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">Real-Time</span>
            <span className="kpi-title">WebSockets & pgvector</span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tab Navigation Bar */}
      <div className="content-toolbar">
        <div className="filter-group">
          <button
            className={`filter-btn ${activeSubTab === 'answers' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('answers')}
            id="arch-subtab-answers"
          >
            <HelpCircle size={15} />
            <span>Architecture Solutions</span>
          </button>

          <button
            className={`filter-btn ${activeSubTab === 'erd' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('erd')}
            id="arch-subtab-erd"
          >
            <Layers size={15} />
            <span>Relational ERD & Data Model</span>
          </button>

          <button
            className={`filter-btn ${activeSubTab === 'schema_sql' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('schema_sql')}
            id="arch-subtab-sql"
          >
            <FileCode2 size={15} />
            <span>PostgreSQL DDL & RLS Policies</span>
          </button>
        </div>
      </div>

      {/* 3. Sub-Tab 1: Architecture Questions & Production Answers */}
      {activeSubTab === 'answers' && (
        <ArchitectureSolutionsView />
      )}

      {/* 4. Sub-Tab 2: Relational ERD & Data Model Visualizer */}
      {activeSubTab === 'erd' && (
        <RelationalERDVisualizer />
      )}

      {/* 5. Sub-Tab 3: SQL Schema & RLS DDL Studio */}
      {activeSubTab === 'schema_sql' && (
        <SchemaAndRLSViewer />
      )}
    </div>
  );
};
