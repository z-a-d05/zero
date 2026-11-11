import React from 'react';
import { clsx } from 'clsx';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  helperText?: string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  helperText,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-apple-text">{label}</label>
        <span className="text-sm font-semibold text-apple-blue bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
          {value} {unit}
        </span>
      </div>

      <div className="relative flex items-center h-6">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-apple-gray-2 rounded-lg appearance-none cursor-pointer accent-apple-blue focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
        />
      </div>

      <div className="flex justify-between text-xs text-apple-text-secondary">
        <span>{min} {unit}</span>
        {helperText && <span>{helperText}</span>}
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};

