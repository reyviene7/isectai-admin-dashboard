import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ActionLoadingOverlayProps {
  title: string;
  subtitle?: string;
  showTopBar?: boolean;
}

export const ActionLoadingOverlay: React.FC<ActionLoadingOverlayProps> = ({
  title,
  subtitle,
  showTopBar = true
}) => {
  return (
    <div
      className="action-loading-backdrop"
      id="action-loading-overlay"
      role="status"
      aria-live="polite"
    >
      {showTopBar && <div className="top-loading-bar" />}

      <div className="action-loading-card">
        {/* Animated Double-ring Spinner */}
        <div className="action-loading-spinner-wrapper">
          <div className="action-loading-ring-outer" />
          <Loader2 className="action-loading-spinner" size={32} />
        </div>

        {/* Text Details */}
        <div className="action-loading-text">
          <h3 className="action-loading-title">{title}</h3>
          {subtitle && <p className="action-loading-subtitle">{subtitle}</p>}
        </div>

        {/* Progress Track */}
        <div className="action-loading-progress-track">
          <div className="action-loading-progress-bar" />
        </div>
      </div>
    </div>
  );
};
