import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Pill, Apple, Activity, Check, ArrowRight } from 'lucide-react';

interface TreatmentSimulatorProps {
  currentRisk: number; // 0.0 إلى 1.0
  currentHba1c: number;
}

export const TreatmentSimulator: React.FC<TreatmentSimulatorProps> = ({
  currentRisk,
  currentHba1c,
}) => {
  const [metformin, setMetformin] = useState<boolean>(false);
  const [dietitianReferral, setDietitianReferral] = useState<boolean>(true);
  const [glp1Agonist, setGlp1Agonist] = useState<boolean>(false);
  const [aerobicPrescription, setAerobicPrescription] = useState<boolean>(true);

  // عوامل تخفيض الخطر للعلاج السريري
  let deltaRisk = 0;
  let projectedHba1c = currentHba1c;

  if (metformin) {
    deltaRisk += 0.12;
    projectedHba1c -= 0.6;
  }
  if (dietitianReferral) {
    deltaRisk += 0.08;
    projectedHba1c -= 0.4;
  }
  if (glp1Agonist) {
    deltaRisk += 0.18;
    projectedHba1c -= 1.1;
  }
  if (aerobicPrescription) {
    deltaRisk += 0.07;
    projectedHba1c -= 0.3;
  }

  const simulatedRisk = Math.max(0.04, currentRisk - deltaRisk);
  const percentReduction = Math.round(((currentRisk - simulatedRisk) / currentRisk) * 100);

  const arabicLabels: Record<string, string> = {
    'Initiate Metformin (500mg BID)': 'ابدأ متروفمين (500 ملغ مرتين يومياً)',
    'Expected HbA1c reduction: ~0.5–1.0%': 'التخفيض المتوقع في HbA1c: ~0.5–1.0%',
    'Medical Nutrition Therapy (MNT)': 'العلاج التغذوي الطبي (MNT)',
    'Referral to Certified Diabetes Care Specialist': 'إحالة إلى أخصائي رعاية سكري معتمد',
    'GLP-1 Receptor Agonist': 'منبه مستقبلات GLP-1',
    'Indicated for high ASCVD/obesity phenotype': 'مُشار إليه لطراز ASCVD/سمنة مرتفع',
    'Supervised Aerobic Protocol': 'بروتوكول هوائي تحت الإشراف',
    'Structured 150m/week resistance + cardio Rx': 'وصفة مقاومة وهواء منظمة 150 دقيقة/أسبوع',
    'Current Risk': 'الخطر الحالي',
    'Post-Intervention': 'بعد التدخل',
    'Current HbA1c': 'HbA1c الحالي',
    'Target HbA1c': 'HbA1c المستهدف',
    'Estimated Risk Drop:': 'التخفيض المقدر في الخطر:',
    'Save Plan to EHR': 'حفظ الخطة في السجل الطبي الإلكتروني',
  };

  return (
    <Card title="محاكي السيناريو العلاجي (CDS سريري)" className="p-6">
      <p className="text-xs text-apple-text-secondary mb-4">
        محاكاة خطط التدخل متعددة الوسائط وفحص التحولات المتوقعة في المسار قبل إصدار أوامر الوصفة الطبية.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* خيارات التدخل */}
        <div className="flex flex-col gap-3">
          {/* متروفمين */}
          <div
            onClick={() => setMetformin(!metformin)}
            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
              metformin ? 'border-apple-blue bg-blue-50/50' : 'border-apple-gray-2 bg-white hover:bg-apple-gray/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Pill size={18} className="text-apple-blue" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-apple-text">{arabicLabels['Initiate Metformin (500mg BID)']}</span>
                <span className="text-[11px] text-apple-text-secondary">{arabicLabels['Expected HbA1c reduction: ~0.5–1.0%']}</span>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${metformin ? 'bg-apple-blue border-apple-blue text-white' : 'border-apple-gray-3'}`}>
              {metformin && <Check size={14} />}
            </div>
          </div>

          {/* إحالة إلى أخصائي تغذية */}
          <div
            onClick={() => setDietitianReferral(!dietitianReferral)}
            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
              dietitianReferral ? 'border-apple-blue bg-blue-50/50' : 'border-apple-gray-2 bg-white hover:bg-apple-gray/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Apple size={18} className="text-apple-green" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-apple-text">{arabicLabels['Medical Nutrition Therapy (MNT)']}</span>
                <span className="text-[11px] text-apple-text-secondary">{arabicLabels['Referral to Certified Diabetes Care Specialist']}</span>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${dietitianReferral ? 'bg-apple-blue border-apple-blue text-white' : 'border-apple-gray-3'}`}>
              {dietitianReferral && <Check size={14} />}
            </div>
          </div>

          {/* منبه مستقبلات GLP-1 */}
          <div
            onClick={() => setGlp1Agonist(!glp1Agonist)}
            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
              glp1Agonist ? 'border-apple-blue bg-blue-50/50' : 'border-apple-gray-2 bg-white hover:bg-apple-gray/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Pill size={18} className="text-purple-600" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-apple-text">{arabicLabels['GLP-1 Receptor Agonist']}</span>
                <span className="text-[11px] text-apple-text-secondary">{arabicLabels['Indicated for high ASCVD/obesity phenotype']}</span>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${glp1Agonist ? 'bg-apple-blue border-apple-blue text-white' : 'border-apple-gray-3'}`}>
              {glp1Agonist && <Check size={14} />}
            </div>
          </div>

          {/* وصفة تمارين */}
          <div
            onClick={() => setAerobicPrescription(!aerobicPrescription)}
            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
              aerobicPrescription ? 'border-apple-blue bg-blue-50/50' : 'border-apple-gray-2 bg-white hover:bg-apple-gray/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity size={18} className="text-apple-orange" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-apple-text">{arabicLabels['Supervised Aerobic Protocol']}</span>
                <span className="text-[11px] text-apple-text-secondary">{arabicLabels['Structured 150m/week resistance + cardio Rx']}</span>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${aerobicPrescription ? 'bg-apple-blue border-apple-blue text-white' : 'border-apple-gray-3'}`}>
              {aerobicPrescription && <Check size={14} />}
            </div>
          </div>
        </div>

        {/* صندوق النتيجة السريرية المتوقعة */}
        <div className="bg-apple-gray p-5 rounded-2xl flex flex-col justify-between border border-apple-gray-2">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-apple-text-secondary">
              المسار العلاجي المتوقع
            </span>

            <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-apple-gray-2">
              <div className="flex flex-col">
                <span className="text-xs text-apple-text-secondary">{arabicLabels['Current Risk']}</span>
                <span className="text-lg font-bold text-apple-text">{(currentRisk * 100).toFixed(0)}%</span>
              </div>
              <ArrowRight size={18} className="text-apple-blue" />
              <div className="flex flex-col items-end">
                <span className="text-xs text-apple-text-secondary">{arabicLabels['Post-Intervention']}</span>
                <span className="text-lg font-bold text-apple-green">{(simulatedRisk * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-apple-gray-2">
              <div className="flex flex-col">
                <span className="text-xs text-apple-text-secondary">{arabicLabels['Current HbA1c']}</span>
                <span className="text-lg font-bold text-apple-text">{currentHba1c.toFixed(1)}%</span>
              </div>
              <ArrowRight size={18} className="text-apple-blue" />
              <div className="flex flex-col items-end">
                <span className="text-xs text-apple-text-secondary">{arabicLabels['Target HbA1c']}</span>
                <span className="text-lg font-bold text-apple-green">{Math.max(5.2, projectedHba1c).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-apple-gray-2 flex items-center justify-between">
            <span className="text-xs font-bold text-apple-green">
              {arabicLabels['Estimated Risk Drop:']} {percentReduction}%
            </span>
            <Button variant="primary" size="sm">
              {arabicLabels['Save Plan to EHR']}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
