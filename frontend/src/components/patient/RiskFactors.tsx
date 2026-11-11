import React from 'react';
import { SHAPExplanation } from '../../types';
import { Card } from '../ui/Card';
import { SHAPChart } from '../ui/SHAPChart';
import {
  Activity,
  Heart,
  Scale,
  Dna,
  Flame,
  Cigarette,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface RiskFactorsProps {
  explanation: SHAPExplanation;
}

const factorIcons: Record<string, React.ElementType> = {
  hba1c: Activity,
  fasting_glucose: Heart,
  bmi: Scale,
  family_history: Dna,
  age: Clock,
  blood_pressure_sys: Heart,
  physical_activity_level: Flame,
  smoking_status: Cigarette,
};

const factorArabicNames: Record<string, string> = {
  hba1c: 'مستوى HbA1c',
  fasting_glucose: 'سكر الدم الصائم',
  bmi: 'مؤشر كتلة الجسم',
  family_history: 'التاريخ العائلي',
  age: 'العمر',
  blood_pressure_sys: 'ضغط الدم الانقباضي',
  physical_activity_level: 'مستوى النشاط البدني',
  smoking_status: 'حالة التدخين',
};

export const RiskFactors: React.FC<RiskFactorsProps> = ({ explanation }) => {
  const { features, baseValue, topFactors } = explanation;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-apple-text">
          فهم عوامل الخطر لديك
        </h2>
        <p className="text-sm text-apple-text-secondary">
          يقوم خوارزمية الذكاء الاصطناعي القابلة للتفسير بتحليل كل مؤشر حيوي لاظهار مدى مساهمته في 결과ك النهائي.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* بطاقة مخطط SHAP */}
        <Card title="تقسيم التأثير" className="lg:col-span-2 p-6">
          <SHAPChart features={features} baseValue={baseValue} />
        </Card>

        {/* بطاقة أكثر العوامل تأثيراً */}
        <Card title="المحركات الأعلى" className="p-6 flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <p className="text-xs text-apple-text-secondary">
              هذه العوامل الثلاثة كانت ذات أكبر وزن رياضي على درجتك:
            </p>
            <div className="flex flex-col gap-2.5">
              {topFactors.map((factor, index) => (
                <div
                  key={factor}
                  className="flex items-center gap-3 p-3 rounded-xl bg-apple-gray border border-apple-gray-2"
                >
                  <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-apple-blue shadow-xs">
                    {index + 1}
                  </div>
                  <span className="text-sm font-semibold text-apple-text truncate">
                    {factor}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-apple-blue leading-relaxed">
            على عكس النماذج "الصندوق الأسود"، كل عامل أعلاه تم التحقق منه وفقًا لمبادئ الجمعية الأمريكية لمرض السكري (ADA) السريرية.
          </div>
        </Card>
      </div>

      {/* بطاقات العوامل المفصلة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((item) => {
          const Icon = factorIcons[item.name] || Activity;
          const isHighRisk = item.contribution > 0;
          const arabicName = factorArabicNames[item.name] || item.displayName || item.name;

          return (
            <div
              key={item.name}
              className="p-4 rounded-2xl bg-white border border-apple-gray-2 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isHighRisk ? 'bg-red-50 text-apple-red' : 'bg-green-50 text-apple-green'
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-apple-text">
                    {arabicName}
                  </span>
                  <span className="text-xs text-apple-text-secondary">
                    القيمة المسجلة: {String(item.value)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {isHighRisk ? (
                  <span className="inline-flex items-center text-xs font-semibold text-apple-red bg-red-50 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={14} className="mr-0.5" />
                    +{(item.contribution * 100).toFixed(1)}%
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-semibold text-apple-green bg-green-50 px-2 py-1 rounded-lg">
                    <ArrowDownRight size={14} className="mr-0.5" />
                    {(item.contribution * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
