import React from 'react';
import { clsx } from 'clsx';
import { SHAPFeature } from '../../types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SHAPChartProps {
  features: SHAPFeature[];
  baseValue?: number;
  className?: string;
}

export const SHAPChart: React.FC<SHAPChartProps> = ({
  features,
  baseValue = 0.15,
  className,
}) => {
  // أخذ الميزات الأعلى وتصنيفها حسب المساهمة المطلقة
  const sorted = [...features]
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 7);

  const maxAbs = Math.max(...sorted.map((f) => Math.abs(f.contribution)), 0.05);

  const arabicNames: Record<string, string> = {
    hba1c: 'مستوى HbA1c',
    fasting_glucose: 'سكر الدم الصائم',
    bmi: 'مؤشر كتلة الجسم',
    family_history: 'التاريخ العائلي',
    age: 'العمر',
    blood_pressure_sys: 'ضغط الدم الانقباضي',
    physical_activity_level: 'مستوى النشاط البدني',
    smoking_status: 'حالة التدخين',
  };

  return (
    <div className={clsx('flex flex-col gap-4', className)}>
      <div className="flex justify-between items-center text-xs text-apple-text-secondary border-b border-apple-gray-2 pb-2">
        <span>عامل الخطر</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1 text-apple-green">
            <ArrowDownRight size={14} /> يخفض الخطر
          </span>
          <span className="flex items-center gap-1 text-apple-red">
            <ArrowUpRight size={14} /> يزيد الخطر
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map((item) => {
          const isPositive = item.contribution > 0;
          const percentageWidth = Math.min(100, (Math.abs(item.contribution) / maxAbs) * 100);
          const arabicName = arabicNames[item.name] || item.displayName || item.name;

          return (
            <div key={item.name} className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-apple-text">
                  {arabicName}
                </span>
                <span
                  className={clsx(
                    'font-semibold text-xs',
                    isPositive ? 'text-apple-red' : 'text-apple-green'
                  )}
                >
                  {isPositive ? '+' : ''}
                  {(item.contribution * 100).toFixed(1)}%
                </span>
              </div>

              {/* شريط ثنائي الاتجاه */}
              <div className="h-3 w-full bg-apple-gray rounded-full overflow-hidden flex relative">
                <div className="w-1/2 flex justify-end pr-0.5">
                  {!isPositive && (
                    <div
                      className="h-full bg-apple-green rounded-full transition-all duration-700"
                      style={{ width: `${percentageWidth}%` }}
                    />
                  )}
                </div>
                {/* علامة المركز */}
                <div className="w-0.5 h-full bg-apple-gray-3 z-10" />
                <div className="w-1/2 flex justify-start pl-0.5">
                  {isPositive && (
                    <div
                      className="h-full bg-apple-red rounded-full transition-all duration-700"
                      style={{ width: `${percentageWidth}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-apple-text-secondary bg-apple-gray p-3 rounded-xl flex items-center justify-between">
        <span>خطر خط الأساس للسكان</span>
        <span className="font-semibold text-apple-text">{(baseValue * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
};
