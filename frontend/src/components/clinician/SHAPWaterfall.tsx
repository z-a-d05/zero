import React from 'react';
import { SHAPExplanation } from '../../types';
import { Card } from '../ui/Card';
import { ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';

interface SHAPWaterfallProps {
  explanation: SHAPExplanation;
  finalRisk: number;
}

export const SHAPWaterfall: React.FC<SHAPWaterfallProps> = ({
  explanation,
  finalRisk,
}) => {
  const { features, baseValue } = explanation;

  // تتبع المجموع التراكمي لإحداثيات الشلال
  let running = baseValue;

  const steps = features.map((f) => {
    const start = running;
    running += f.contribution;
    const end = running;
    return {
      name: f.displayName || f.name,
      contribution: f.contribution,
      value: f.value,
      start,
      end,
      isPositive: f.contribution >= 0,
    };
  });

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
    <Card title="شلال قرار SHAP (الإسناد السريري المحلي)" className="p-6">
      <div className="flex items-center justify-between text-xs text-apple-text-secondary mb-4 pb-3 border-b border-apple-gray-2">
        <span>انحراف الميزة خطوة بخطوة من متوسط السكان E[f(x)]</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-apple-red font-medium">
            <ArrowUp size={13} /> عامل رافع للخطر
          </span>
          <span className="flex items-center gap-1 text-apple-green font-medium">
            <ArrowDown size={13} /> عامل وقائي
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* شريط خط الأساس */}
        <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-apple-gray rounded-xl">
          <span className="font-semibold text-apple-text">E[f(x)] خطر خط الأساس للسكان</span>
          <span className="font-bold text-apple-blue">{(baseValue * 100).toFixed(1)}%</span>
        </div>

        {/* خطوات شلال الميزات */}
        {steps.map((step) => {
          const arabicName = arabicNames[step.name] || step.name;
          return (
            <div
              key={step.name}
              className="flex items-center justify-between p-2 rounded-xl border border-apple-gray-2 hover:bg-apple-gray/40 transition"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-apple-text">{arabicName}</span>
                <span className="text-[11px] text-apple-text-secondary">
                  القياس السريري: {String(step.value)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* شريط مصغر مرئي */}
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                    step.isPositive
                      ? 'text-apple-red bg-red-50 border border-red-100'
                      : 'text-apple-green bg-green-50 border border-green-100'
                  }`}
                >
                  {step.isPositive ? '+' : ''}
                  {(step.contribution * 100).toFixed(1)}%
                </span>
                <span className="text-xs font-medium text-apple-text-secondary w-16 text-right">
                  → {(step.end * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}

        {/* الناتج النهائي */}
        <div className="flex items-center justify-between text-sm py-2.5 px-3 bg-blue-50/70 border border-blue-200 rounded-xl mt-2">
          <span className="font-bold text-apple-text">f(x) درجة الخطر المحسوبة للمريض</span>
          <span className="font-extrabold text-apple-blue text-base">
            {(finalRisk * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* ملاحظة سريرية مرجعية */}
      <div className="mt-4 p-3 bg-apple-gray rounded-xl flex items-start gap-2 text-[11px] text-apple-text-secondary">
        <HelpCircle size={15} className="mt-0.5 text-apple-blue flex-shrink-0" />
        <span>
          تم المعايرة باستخدام تفسيرات شابلي الإضافبية تحت صيغة Tree SHAP مع أهداف نسبة السكر في الدم للجمعية الأمريكية لمرض السكري (ADA 2024).
        </span>
      </div>
    </Card>
  );
};
