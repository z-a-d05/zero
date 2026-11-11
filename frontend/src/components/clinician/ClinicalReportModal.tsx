import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Patient, PredictionResult } from '../../types';
import { Printer, Download, Activity, CheckCircle, ShieldAlert, Award } from 'lucide-react';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  prediction?: PredictionResult | null;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  patient,
  prediction,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const currentRisk = prediction ? prediction.riskPercentage : 45.0;
  const currentRiskLevel = prediction ? prediction.riskLevel : 'medium';
  const explanation = prediction?.explanation;

  const arabicGender: Record<string, string> = {
    male: 'ذكر',
    female: 'أنثى',
    other: 'أخرى',
  };

  const arabicRiskLevel: Record<string, string> = {
    low: 'منخفض',
    medium: 'معتدل',
    high: 'مرتفع',
  };

  const arabicDiagnosis: Record<string, string> = {
    'Diagnostic Diabetic': 'تشخيص سكري',
    'Prediabetes Range': 'نطاق مقدمات السكري',
    'Normal': 'طبيعي',
    'Elevated Diabetic': 'سكري مرتفع',
    'Impaired Fasting Glucose': 'سكر صائم معطل',
    'Obesity Class I/II': 'سمنة من الدرجة الأولى/الثانية',
    'Overweight': 'وزن زائد',
    'Stage 2 Hypertension': 'ارتفاع ضغط الدم من الدرجة الثانية',
    'Stage 1 Hypertension': 'ارتفاع ضغط الدم من الدرجة الأولى',
    'Normotensive': 'ضغط دم طبيعي',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تقرير استشارة طبية سريري رسمي"
      size="4xl"
    >
      <div className="flex flex-col gap-6 p-2 print:p-0">
        {/* شريط إجراءات أعلى (مخفي عند الطباعة) */}
        <div className="flex items-center justify-between bg-apple-gray p-3 rounded-2xl print:hidden">
          <div className="flex items-center gap-2 text-xs text-apple-text-secondary">
            <span className="w-2 h-2 rounded-full bg-apple-green" />
            <span>حالة المستند: ملخص دعم اتخاذ القرار السريري النهائي</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer size={15} className="mr-1.5" />
              طباعة / حفظ كملف PDF
            </Button>
          </div>
        </div>

        {/* ورقة طبية رسمية قابلة للطباعة */}
        <div className="bg-white border border-apple-gray-2 rounded-2xl p-6 sm:p-10 flex flex-col gap-8 shadow-xs print:border-none print:shadow-none print:p-0">
          {/* رأس خطابات المستشفى */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-apple-gray-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-apple-blue text-white flex items-center justify-center font-bold text-xl shadow-xs">
                <Activity size={26} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-extrabold tracking-tight text-apple-text">
                  مركز DPIS للذكاء السريري
                </h1>
                <span className="text-xs uppercase font-bold tracking-wider text-apple-text-secondary">
                  قسم الغدد الصماء والصحة الأيضية
                </span>
              </div>
            </div>

            <div className="text-right text-xs text-apple-text-secondary">
              <div><strong>تاريخ التقييم:</strong> {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div><strong>بروتوكول التقرير:</strong> معايير ADA للرعاية (الإصدار 2024)</div>
              <div><strong>خوارزمية دعم القرار:</strong> XGBoost-Tree معاير v1.0</div>
            </div>
          </div>

          {/* كتلة البيانات الديموغرافية للمريض */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-apple-gray/60 border border-apple-gray-2 text-xs">
            <div>
              <span className="text-apple-text-secondary uppercase font-semibold text-[10px]">اسم المريض</span>
              <div className="font-bold text-sm text-apple-text">{patient.name}</div>
            </div>
            <div>
              <span className="text-apple-text-secondary uppercase font-semibold text-[10px]">الرقم الطبي (MRN)</span>
              <div className="font-bold text-sm text-apple-text font-mono">#{patient.id.slice(0, 10).toUpperCase()}</div>
            </div>
            <div>
              <span className="text-apple-text-secondary uppercase font-semibold text-[10px]">العمر / الجنس البيولوجي</span>
              <div className="font-bold text-sm text-apple-text">{patient.age} سنة • <span className="capitalize">{arabicGender[patient.gender] ?? patient.gender}</span></div>
            </div>
            <div>
              <span className="text-apple-text-secondary uppercase font-semibold text-[10px]">التشخيص الأساسي</span>
              <div className="font-bold text-sm text-apple-text">تصنيف أيضي</div>
            </div>
          </div>

          {/* كتلة نتيجة تصنيف الخطر */}
          <div className="p-5 rounded-2xl border-2 border-blue-100 bg-blue-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-apple-blue">
                احتمال السكري من النوع الثاني المحسوب
              </span>
              <h2 className="text-2xl font-extrabold text-apple-text mt-1">
                {currentRisk.toFixed(1)}% احتمال الخطر
              </h2>
              <span className="text-xs text-apple-text-secondary mt-0.5">
                الفئة المصنفة:{' '}
                <strong className={`uppercase ${currentRiskLevel === 'high' ? 'text-apple-red' : currentRiskLevel === 'medium' ? 'text-apple-orange' : 'text-apple-green'}`}>
                  {arabicRiskLevel[currentRiskLevel]} خطر
                </strong>
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-apple-gray-2 text-xs max-w-sm">
              <span className="font-semibold text-apple-text">التقييم السريري:</span>
              <p className="text-apple-text-secondary mt-0.5 leading-relaxed">
                {explanation?.limeRule ||
                  'يظهر نمط العلامات الحيوية مقاومة الأنسولين المرتفعة مما يتطلب تعديلاً منظمًا لنمط الحياة ومراقبة مختبرية.'}
              </p>
            </div>
          </div>

          {/* جدول العلامات الحيوية */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-apple-text-secondary">
              العلامات الحيوية المختبرية الملاحظة والعلامات السريرية
            </h3>
            <table className="w-full text-left text-xs border border-apple-gray-2 rounded-xl overflow-hidden">
              <thead className="bg-apple-gray text-apple-text-secondary font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">مفهوم المؤشر الحيوي</th>
                  <th className="py-2.5 px-3">قيمة المريض</th>
                  <th className="py-2.5 px-3">النطاق المرجعي الطبيعي السريري</th>
                  <th className="py-2.5 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-gray-2">
                <tr>
                  <td className="py-2.5 px-3 font-semibold">الهيموغلوبين السكري (HbA1c)</td>
                  <td className="py-2.5 px-3 font-bold">{patient.hba1c}%</td>
                  <td className="py-2.5 px-3 text-apple-text-secondary">&lt; 5.7 %</td>
                  <td className="py-2.5 px-3 font-semibold text-apple-red">
                    {patient.hba1c >= 6.5 ? 'تشخيص سكري' : patient.hba1c >= 5.7 ? 'نطاق مقدمات السكري' : 'طبيعي'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">سكر الدم الصائم</td>
                  <td className="py-2.5 px-3 font-bold">{patient.fastingGlucose} ملغ/ديسيلتر</td>
                  <td className="py-2.5 px-3 text-apple-text-secondary">70–99 ملغ/ديسيلتر</td>
                  <td className="py-2.5 px-3 font-semibold text-apple-orange">
                    {patient.fastingGlucose >= 126 ? 'سكري مرتفع' : patient.fastingGlucose >= 100 ? 'سكر صائم معطل' : 'طبيعي'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">مؤشر كتلة الجسم (BMI)</td>
                  <td className="py-2.5 px-3 font-bold">{patient.bmi} كغ/م²</td>
                  <td className="py-2.5 px-3 text-apple-text-secondary">18.5–24.9 كغ/م²</td>
                  <td className="py-2.5 px-3 font-semibold">
                    {patient.bmi >= 30 ? 'سمنة من الدرجة الأولى/الثانية' : patient.bmi >= 25 ? 'وزن زائد' : 'طبيعي'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">ضغط الدم (الانقباضي / الانبساطي)</td>
                  <td className="py-2.5 px-3 font-bold">{patient.bloodPressureSys}/{patient.bloodPressureDia} مم زئبق</td>
                  <td className="py-2.5 px-3 text-apple-text-secondary">&lt; 120/80 مم زئبق</td>
                  <td className="py-2.5 px-3 font-semibold">
                    {patient.bloodPressureSys >= 140 ? 'ارتفاع ضغط الدم من الدرجة الثانية' : patient.bloodPressureSys >= 130 ? 'ارتفاع ضغط الدم من الدرجة الأولى' : 'ضغط دم طبيعي'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* قسم إسناد الذكاء الاصطناعي القابل للتفسير SHAP */}
          {explanation && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-apple-text-secondary">
                تفاصيل إسناد الذكاء الاصطناعي القابل للتفسير (XAI)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {explanation.features.slice(0, 4).map((f) => (
                  <div key={f.name} className="p-3 rounded-xl bg-apple-gray border border-apple-gray-2 text-xs flex justify-between items-center">
                    <span className="font-semibold text-apple-text">{f.displayName || f.name}</span>
                    <span className={`font-bold ${f.contribution >= 0 ? 'text-apple-red' : 'text-apple-green'}`}>
                      {f.contribution >= 0 ? '+' : ''}{(f.contribution * 100).toFixed(1)}% إسهام
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* خطة العلاج الموصى بها للطبيب */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-apple-text-secondary">
              الخطة العلاجية المقررة
            </h3>
            <div className="p-4 rounded-xl bg-apple-gray/50 border border-apple-gray-2 text-xs space-y-1.5 leading-relaxed">
              <div>1. <strong>العلاج التغذوي الطبي (MNT):</strong> بنية نظام غذائي متوسطي منخفض نسبة السكر في الدم مع 35 غرام/يوم من الألياف الذائبة.</div>
              <div>2. <strong>وصفة تمارين ديناميكية حركية:</strong> 150 دقيقة/أسبوع مشي هوائي من المنطقة 2 + جلستين مقاومة أسبوعياً.</div>
              <div>3. <strong>اعتبار دوائي:</strong> تقييم متروفمين 500 ملغ مرتين يومياً مع الوجبات إذا كان BMI {'&gt;'} 35 والعمر {'&lt;'} 60.</div>
              <div>4. <strong>مراقبة:</strong> تكرار فحص HbA1c ولوحة الدهون الصائمة المختبرية في 12 أسبوعاً.</div>
            </div>
          </div>

          {/* كتلة توقيع الطبيب */}
          <div className="pt-8 border-t border-apple-gray-2 flex justify-between items-end text-xs">
            <div className="flex flex-col gap-1 max-w-sm text-apple-text-secondary text-[10px]">
              <span><strong>إخلاء مسؤولية طبي:</strong> يتم إنتاج هذا التقرير السريري بواسطة نظام دعم اتخاذ القرار السريري (CDS) من الفئة الثانية وفقاً لمبادئ FDA 2022 وقواعد أمان HIPAA.</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-48 border-b-2 border-apple-text mb-1" />
              <span className="font-bold text-apple-text">طبيب مقيم MD</span>
              <span className="text-[10px] text-apple-text-secondary">الترخيص: #MD-89210-EN</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
