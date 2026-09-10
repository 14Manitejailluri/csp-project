import React from 'react';
import { DONATION_STATUS_COLORS } from '../../utils/constants';

const StatusBadge = ({ status, size = 'sm' }) => {
  if (!status) return null;
  const config = DONATION_STATUS_COLORS[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    dot: 'bg-slate-400',
    label: status,
  };

  const sizeClasses = size === 'lg'
    ? 'px-4 py-1.5 text-sm font-semibold'
    : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
