import React from 'react';
import { clsx } from 'clsx';
import { RiskLevel } from '../../types';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface BadgeProps {
  level: RiskLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const levelConfig = {
  low: {
    label: 'خطر منخفض',
    classes: 'text-apple-green bg-green-50 border border-green-100',
    Icon: CheckCircle,
  },
  medium: {
    label: 'خطر معتدل',
    classes: 'text-apple-orange bg-orange-50 border border-orange-100',
    Icon: AlertCircle,
  },
  high: {
    label: 'خطر مرتفع',
    classes: 'text-apple-red bg-red-50 border border-red-100',
    Icon: AlertTriangle,
  },
};

const sizeClasses = {
  sm: 'text-xs px-2.5 py-1 rounded-lg gap-1',
  md: 'text-sm px-3 py-1.5 rounded-xl gap-1.5',
};

export const Badge: React.FC<BadgeProps> = ({
  level,
  showIcon = true,
  size = 'md',
  className,
}) => {
  const config = levelConfig[level];
  const { Icon } = config;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold',
        config.classes,
        sizeClasses[size],
        className,
      )}
      role="status"
      aria-label={config.label}
    >
      {showIcon && <Icon size={iconSize} aria-hidden="true" />}
      {config.label}
    </span>
  );
};
