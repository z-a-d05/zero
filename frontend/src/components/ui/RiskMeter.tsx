import React from 'react';
import { clsx } from 'clsx';
import { RiskLevel } from '../../types';
import { Badge } from './Badge';

interface RiskMeterProps {
  score: number; // 0.0 to 1.0 or 0 to 100
  size?: number;
  className?: string;
  showCategory?: boolean;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  size = 200,
  className,
  showCategory = true,
}) => {
  // Normalize score to 0 - 100
  const normalizedScore = score > 1 ? Math.min(100, Math.max(0, score)) : Math.min(100, Math.max(0, score * 100));

  let level: RiskLevel = 'low';
  let strokeColor = '#34C759'; // apple-green
  if (normalizedScore >= 66) {
    level = 'high';
    strokeColor = '#FF3B30'; // apple-red
  } else if (normalizedScore >= 33) {
    level = 'medium';
    strokeColor = '#FF9500'; // apple-orange
  }

  // Semicircle geometry
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  const height = size / 2 + strokeWidth + 8;

  return (
    <div className={clsx('flex flex-col items-center justify-center select-none', className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: height }}
      >
        <svg
          width={size}
          height={height}
          viewBox={`0 0 ${size} ${height}`}
          className="overflow-visible"
        >
          {/* Background Track Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#E5E5EA"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Calibrated Active Score Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Text Center - perfectly positioned and padded */}
        <div
          className="absolute inset-x-0 bottom-2 flex flex-col items-center justify-center text-center pointer-events-none"
        >
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-apple-text leading-none">
            {normalizedScore.toFixed(1)}%
          </span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-apple-text-secondary mt-1">
            احتمال الخطر
          </span>
        </div>
      </div>

      {showCategory && (
        <div className="mt-2 flex justify-center">
          <Badge level={level} size="md" />
        </div>
      )}
    </div>
  );
};
