import React, { useState } from 'react';
import { PredictionResult, ActivityLevel } from '../../types';
import { Slider } from '../ui/Slider';
import { RiskMeter } from '../ui/RiskMeter';
import { ArrowDown, RefreshCw, Check, Sparkles, Scale, Flame, Apple } from 'lucide-react';

interface WhatIfSimulatorProps {
  initialPrediction: PredictionResult;
  onSimulate?: (mods: any) => Promise<void>;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ initialPrediction }) => {
  const [weightLossKg, setWeightLossKg] = useState<number>(5);
  const [activityTarget, setActivityTarget] = useState<ActivityLevel>('high');
  const [dietaryChange, setDietaryChange] = useState<boolean>(true);

  // حساب تخفيض الخطر المتوقع بشكل ديناميكي
  // أساسه 경험ي مبني على دليل تجربة منع مرض السكري (DPP):
  // كل 1 كغ خسارة ينتج عنه ~2.2% تخفيض نسبي في الخطر.
  const basePercentage = initialPrediction.riskPercentage;

  const weightReductionImpact = weightLossKg * 2.2;
  const activityImpact = activityTarget === 'high' ? 8.0 : activityTarget === 'medium' ? 3.5 : 0.0;
  const dietImpact = dietaryChange ? 6.0 : 0.0;

  const totalReduction = Math.min(basePercentage - 5, weightReductionImpact + activityImpact + dietImpact);
  const projectedRisk = Math.max(4.5, parseFloat((basePercentage - totalReduction).toFixed(1)));
  const percentageDrop = Math.max(0, parseFloat((basePercentage - projectedRisk).toFixed(1)));
  const relativePercentImprovement = basePercentage > 0 ? Math.round((percentageDrop / basePercentage) * 100) : 0;

  const handleReset = () => {
    setWeightLossKg(5);
    setActivityTarget('high');
    setDietaryChange(true);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* الوصف الرئيسي */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-apple-gray-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-apple-blue" />
            <span className="text-xs font-bold uppercase tracking-wider text-apple-blue">
              محرك المحاكاة لنمط الحياة التفاعلي
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-apple-text mt-1">
            محاكي سيناريو "ماذا لو" الصحي
          </h2>
          <p className="text-xs sm:text-sm text-apple-text-secondary mt-0.5">
            قم بتعديل المعايير السريرية لنمط الحياة أدناه لمحاكاة كيفية تعديل العادات المعتمدة علميًا 낮ًا لاحتمال إصابتك بمرض السكري.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-apple-gray hover:bg-apple-gray-2 text-xs font-semibold text-apple-text-secondary hover:text-apple-text transition"
        >
          <RefreshCw size={14} /> إعادة ضبط
        </button>
      </div>

      {/* التخطيط principal ثنائي الأعمدة المتجاوب */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* العمود الأيسر: الشرائط والتعديلات (7 أعمدة على سطح المكتب) */}
        <div className="xl:col-span-7 flex flex-col gap-5 bg-white p-5 sm:p-6 rounded-3xl border border-apple-gray-2 shadow-xs">
          <h3 className="text-sm font-bold text-apple-text uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-apple-blue" /> تعديلات نمط الحياة
          </h3>

          {/* 1. شريط فقدان الوزن */}
          <div className="p-4 rounded-2xl bg-apple-gray/50 border border-apple-gray-2 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-apple-text font-semibold text-sm">
              <Scale size={18} className="text-apple-blue" />
              <span>هدف تخفيض الوزن</span>
            </div>
            <Slider
              label="وزن للتخفيض"
              value={weightLossKg}
              min={0}
              max={20}
              step={1}
              unit="كغ"
              onChange={setWeightLossKg}
              helperText={`معادل ل${(weightLossKg * 2.204).toFixed(0)} رطل من كتلة الجسم`}
            />
          </div>

          {/* 2. النشاط البدني */}
          <div className="p-4 rounded-2xl bg-apple-gray/50 border border-apple-gray-2 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-apple-text font-semibold text-sm">
              <Flame size={18} className="text-apple-orange" />
              <span>هدف النشاط البدني</span>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-white p-1.5 rounded-xl border border-apple-gray-2">
              {(['low', 'medium', 'high'] as ActivityLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setActivityTarget(level)}
                  className={`py-2.5 px-2 text-xs font-semibold rounded-lg capitalize transition text-center whitespace-nowrap ${
                    activityTarget === level
                      ? 'bg-apple-blue text-white shadow-xs'
                      : 'text-apple-text-secondary hover:text-apple-text'
                  }`}
                >
                  {level === 'low' ? 'مستوى منخفض' : level === 'medium' ? 'متوسط' : 'عالٍ'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-apple-text-secondary text-center">
              <span>{'\u003C30 دقيقة/أسبوع'}</span>
              <span>(150 دقيقة/أسبوع)</span>
              <span>{'\u003E300 دقيقة/أسبوع'}</span>
            </div>
            <span className="text-[11px] text-apple-text-secondary">
              إرشادات ADA: على الأقل 150 دقيقة/أسبوع تمارين هوائية معتدلة + جلستين تمارين مقاومة.
            </span>
          </div>

          {/* 3. مفتاح التغذية */}
          <div className="p-4 rounded-2xl bg-apple-gray/50 border border-apple-gray-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-apple-green flex items-center justify-center flex-shrink-0">
                <Apple size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-apple-text">
                  نظام غذائي متوسطي منخفض نسبة السكر في الدم
                </span>
                <span className="text-xs text-apple-text-secondary">
                  إزالة المشروبات المحلاة بالسكر واستبدال النشويات المكررة بالألياف الذائبة
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDietaryChange(!dietaryChange)}
              className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out flex-shrink-0 ${
                dietaryChange ? 'bg-apple-blue' : 'bg-apple-gray-3'
              }`}
              aria-label="تبديل تغيير النظام الغذائي"
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  dietaryChange ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* العمود الأيمن: التأثير المتوقع المتغير (5 أعمدة على سطح المكتب) */}
        <div className="xl:col-span-5 flex flex-col gap-5 bg-gradient-to-b from-white to-blue-50/30 p-5 sm:p-6 rounded-3xl border border-blue-100 shadow-xs">
          <h3 className="text-sm font-bold text-apple-text uppercase tracking-wider text-center">
            المسار السريري المتوقع
          </h3>

          {/* شبكة بطاقات المقارنة */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {/* أساسي */}
            <div className="p-3.5 rounded-2xl bg-white border border-apple-gray-2 flex flex-col items-center text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-text-secondary">
                الخطر الأساسي
              </span>
              <span className="text-2xl font-bold text-apple-text mt-1">
                {basePercentage.toFixed(1)}%
              </span>
            </div>

            {/* متوقع */}
            <div className="p-3.5 rounded-2xl bg-white border border-green-200 flex flex-col items-center text-center shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-green">
                الخطر المحاكي
              </span>
              <span className="text-2xl font-bold text-apple-green mt-1">
                {projectedRisk}%
              </span>
            </div>
          </div>

          {/* مقياس نصف دائري */}
          <div className="flex flex-col items-center justify-center py-2">
            <RiskMeter score={projectedRisk} size={190} />
          </div>

          {/* حبوب الفرق */}
          <div className="w-full bg-green-50 border border-green-200 p-4 rounded-2xl flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-apple-green text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
              <Check size={16} strokeWidth={3} />
            </div>
            <div className="flex flex-col text-xs leading-relaxed text-green-950">
              <span className="font-bold text-sm text-apple-green mb-0.5">
                ↓ {percentageDrop}% تخفيض مطلق للخطر ({relativePercentImprovement}% تحسين نسبي)
              </span>
              <span>
                بالالتزام بهذه المجموعة من أنماط الحياة، ينتقل ملف المخاطر الأيضي لديك بشكل كبير أقرب إلى خط الأساس للسكان الأصحاء.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
