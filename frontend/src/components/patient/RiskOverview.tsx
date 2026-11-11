import React from 'react';
import { PredictionResult } from '../../types';
import { Card } from '../ui/Card';
import { RiskMeter } from '../ui/RiskMeter';
import { Badge } from '../ui/Badge';
import { Heart, Activity, Calendar, ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { AccuracyScore } from './AccuracyScore';

interface RiskOverviewProps {
  prediction: PredictionResult;
  onExploreFactors: () => void;
  onOpenWhatIf: () => void;
}

export const RiskOverview: React.FC<RiskOverviewProps> = ({
  prediction,
  onExploreFactors,
  onOpenWhatIf,
}) => {
  const { riskScore, riskPercentage, riskLevel, explanation } = prediction;

  // حساب العمر الأيضي التقديري مقارنة بالعمر الزمني
  // على سبيل المثال، إذا كان الخطر مرتفعًا، يكون العمر الأيضي أعلى
  const estimatedMetabolicAgeOffset =
    riskLevel === 'high' ? 8 : riskLevel === 'medium' ? 3 : -2;

  // حساب عدد الميزات المكتملة لحساب درجة الدقة
  const featureCount = explanation?.features?.length ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* بطاقة الحالة الأساسية للخطر */}
      <Card className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-white to-apple-gray/50">
        <div className="flex flex-col gap-3 max-w-md text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-apple-blue bg-blue-50 px-2.5 py-1 rounded-lg">
              تصنيف خطر مرض السكري من النوع الثاني
            </span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-apple-text">
            {riskLevel === 'low'
              ? 'احتمال منخفض'
              : riskLevel === 'medium'
                ? 'خطر معتدل تم الكشف عنه'
                : 'خطر مرتفع تم الكشف عنه'}
          </h2>

          <p className="text-sm leading-relaxed text-apple-text-secondary">
            {riskLevel === 'low'
              ? 'علاماتك الحيوية ومؤشرات أسلوب حياتك ضمن المستويات المثلى. الاستمرار في روتينك البدني الحالي سيحافظ على صحتك.'
              : riskLevel === 'medium'
                ? 'علاماتك تظهر مؤشرات مقاومة أنسولين خفيفة. التدخلات المبكرة في أسلوب الحياة يمكن أن تقلل أو تقلب هذا المسار.'
                : 'العلامات السريرية تظهر مستويات مرتفعة من الهيموغلوبين السكري والسكر الصائم. نوصي بتحديد موعد لاستشارة شاملة مع طبيبك.'}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" size="sm" onClick={onOpenWhatIf}>
              جرب محاكي "ماذا لو"
              <ArrowRight size={14} className="ml-1.5" />
            </Button>
            <Button variant="secondary" size="sm" onClick={onExploreFactors}>
              عرض العوامل
            </Button>
          </div>
        </div>

        {/* مقياس المخاطر */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl shadow-sm border border-apple-gray-2">
          <RiskMeter score={riskPercentage} size={220} />
        </div>
      </Card>

      {/* بطاقة درجة الدقة من 10 */}
      <AccuracyScore
        riskLevel={riskLevel}
        riskPercentage={riskPercentage}
        featureCount={featureCount}
      />

      {/* صف بطاقات المقاييس */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* بطاقة العمر الأيضي التقديري */}
        <Card className="flex flex-col gap-2 p-5 bg-white">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-apple-red flex items-center justify-center">
            <Heart size={20} />
          </div>
          <span className="text-xs uppercase font-semibold tracking-wider text-apple-text-secondary mt-1">
            العمر الصحي الأيضي
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-apple-text">
              {estimatedMetabolicAgeOffset > 0
                ? `+${estimatedMetabolicAgeOffset} سنوات`
                : `${estimatedMetabolicAgeOffset} سنوات`}
            </span>
            <span className="text-xs text-apple-text-secondary">مقارنة بالعمر البيولوجي</span>
          </div>
          <p className="text-xs text-apple-text-secondary mt-1">
            يعكس التآكل الوعائي الدهني العام والسكري الدهني.
          </p>
        </Card>

        {/* العامل الأساسي */}
        <Card className="flex flex-col gap-2 p-5 bg-white">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-apple-orange flex items-center justify-center">
            <Activity size={20} />
          </div>
          <span className="text-xs uppercase font-semibold tracking-wider text-apple-text-secondary mt-1">
            التأثير الأساسي
          </span>
          <span className="text-lg font-bold text-apple-text truncate">
            {explanation?.topFactors?.[0] || 'الهيموغلوبين السكري (HbA1c)'}
          </span>
          <p className="text-xs text-apple-text-secondary mt-1">
            يمثل أقوى إسناد في حساب درجتك.
          </p>
        </Card>

        {/* الجدول الزمني للإجراء الموصى به */}
        <Card className="flex flex-col gap-2 p-5 bg-white">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-apple-blue flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <span className="text-xs uppercase font-semibold tracking-wider text-apple-text-secondary mt-1">
            الجدول الزمني للمتابعة
          </span>
          <span className="text-lg font-bold text-apple-text">
            {riskLevel === 'high' ? 'خلال 2–4 أسابيع' : riskLevel === 'medium' ? 'خلال 3 أشهر' : 'فحص سنوي'}
          </span>
          <p className="text-xs text-apple-text-secondary mt-1">
            الفاصل الزمني الموصى به لتكرار القياسات المختبرية.
          </p>
        </Card>
      </div>

      {/* الرؤى الطبيعية (قواعد LIME المبسطة) */}
      {explanation?.limeRule && (
        <Card title="الملخص السريري" className="p-6">
          <div className="flex items-start gap-3 bg-apple-gray p-4 rounded-xl border border-apple-gray-2">
            <ShieldAlert size={20} className="text-apple-blue mt-0.5 flex-shrink-0" />
            <p className="text-sm text-apple-text leading-relaxed">
              {explanation.limeRule}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
