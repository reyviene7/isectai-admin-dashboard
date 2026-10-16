import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { ServiceJob, Appointment } from '../lib/types';

export interface StatusOption<T extends string> {
  value: T;
  label: string;
  dotColor: string;
  bg: string;
  color: string;
  border: string;
}

interface StatusPickerProps<T extends string> {
  value: T;
  options: StatusOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  isNearBottom?: boolean;
  title?: string;
}

export function StatusPicker<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  isNearBottom = false,
  title = 'Click to update status'
}: StatusPickerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [autoPosTop, setAutoPosTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    if (!isOpen) return;

    // Check available space below to decide if menu should open upwards
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 240px below and more space above, open upwards
      if (spaceBelow < 240 && rect.top > 240) {
        setAutoPosTop(true);
      } else {
        setAutoPosTop(false);
      }
    }

    // Elevate parent slot card and hour row stacking context when picker is open
    const slotCard = containerRef.current?.closest('.schedule-slot-card') as HTMLElement | null;
    const hourRow = containerRef.current?.closest('.schedule-hour-row') as HTMLElement | null;

    if (slotCard) {
      slotCard.classList.add('has-open-picker');
      slotCard.style.zIndex = '70';
    }
    if (hourRow) {
      hourRow.classList.add('has-open-picker');
      hourRow.style.zIndex = '70';
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (slotCard) {
        slotCard.classList.remove('has-open-picker');
        slotCard.style.zIndex = '';
      }
      if (hourRow) {
        hourRow.classList.remove('has-open-picker');
        hourRow.style.zIndex = '';
      }
    };
  }, [isOpen]);

  const handleSelect = (newVal: T, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (newVal !== value) {
      onChange(newVal);
    }
  };

  const shouldOpenTop = isNearBottom || autoPosTop;

  return (
    <div
      ref={containerRef}
      className={`status-picker-container ${isOpen ? 'is-open' : ''}`}
      style={{ position: 'relative', zIndex: isOpen ? 80 : 'auto' }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="status-picker-trigger"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        title={title}
        style={{
          backgroundColor: currentOption.bg,
          color: currentOption.color,
          borderColor: currentOption.border
        }}
      >
        <span
          className="status-picker-dot"
          style={{ backgroundColor: currentOption.dotColor }}
        />
        <span>{currentOption.label}</span>
        <ChevronDown
          size={11}
          className={`status-picker-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className={`status-picker-menu ${shouldOpenTop ? 'pos-top' : 'pos-bottom'}`}
          role="menu"
        >
          <div className="status-picker-header">Change Status</div>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`status-picker-option ${isSelected ? 'active' : ''}`}
                onClick={(e) => handleSelect(opt.value, e)}
                role="menuitem"
              >
                <div className="status-picker-option-left">
                  <span
                    className="status-picker-dot"
                    style={{ backgroundColor: opt.dotColor }}
                  />
                  <span
                    className="status-picker-option-label"
                    style={{ color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}
                  >
                    {opt.label}
                  </span>
                </div>
                {isSelected && <Check size={13} color="var(--primary)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const SERVICE_JOB_STATUS_OPTIONS: StatusOption<ServiceJob['status']>[] = [
  {
    value: 'pending_dispatch',
    label: 'Pending',
    dotColor: '#94a3b8',
    bg: 'var(--bg-subtle)',
    color: 'var(--text-secondary)',
    border: 'var(--border-light)'
  },
  {
    value: 'dispatched',
    label: 'Dispatched',
    dotColor: '#3b82f6',
    bg: 'var(--primary-soft)',
    color: 'var(--primary)',
    border: 'var(--primary-border)'
  },
  {
    value: 'on_site',
    label: 'On Site',
    dotColor: '#f59e0b',
    bg: 'var(--service-soft)',
    color: 'var(--service-color)',
    border: 'var(--service-border)'
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    dotColor: '#e11d48',
    bg: 'var(--danger-soft)',
    color: 'var(--danger-color)',
    border: 'var(--danger-border)'
  },
  {
    value: 'completed',
    label: 'Completed',
    dotColor: '#059669',
    bg: 'var(--success-soft)',
    color: 'var(--success-color)',
    border: 'var(--success-border)'
  },
  {
    value: 'invoiced',
    label: 'Invoiced',
    dotColor: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    color: '#7c3aed',
    border: 'rgba(139, 92, 246, 0.28)'
  }
];

export const APPOINTMENT_STATUS_OPTIONS: StatusOption<Appointment['status']>[] = [
  {
    value: 'scheduled',
    label: 'Scheduled',
    dotColor: '#0284c7',
    bg: 'var(--medical-soft)',
    color: 'var(--medical-color)',
    border: 'var(--medical-border)'
  },
  {
    value: 'confirmed',
    label: 'Confirmed',
    dotColor: '#059669',
    bg: 'var(--success-soft)',
    color: 'var(--success-color)',
    border: 'var(--success-border)'
  },
  {
    value: 'in_consultation',
    label: 'In Consultation',
    dotColor: '#f59e0b',
    bg: 'var(--service-soft)',
    color: 'var(--service-color)',
    border: 'var(--service-border)'
  },
  {
    value: 'completed',
    label: 'Completed',
    dotColor: '#10b981',
    bg: 'var(--success-soft)',
    color: 'var(--success-color)',
    border: 'var(--success-border)'
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    dotColor: '#e11d48',
    bg: 'var(--danger-soft)',
    color: 'var(--danger-color)',
    border: 'var(--danger-border)'
  },
  {
    value: 'no_show',
    label: 'No Show',
    dotColor: '#94a3b8',
    bg: 'var(--bg-subtle)',
    color: 'var(--text-muted)',
    border: 'var(--border-light)'
  }
];
