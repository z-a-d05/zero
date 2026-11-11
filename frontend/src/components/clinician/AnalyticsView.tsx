import React from 'react';
import { Card } from '../ui/Card';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Award,
  Layers,
  Activity,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const modelMetrics = [
    { label: 'نقطة ROC-AUC', value: '0.914', target: '≥ 0.900', status: 'optimal' },
    { label: 'الحساسية السريرية (الاستدعاء)', value: '89.6%', target: '≥ 85.0%', status: 'optimal' },
    { label: 'النوعية السريرية', value: '92.3%', target: '≥ 90.0%', status: 'optimal' },
    { label: 'نتيجة F1 التوافقي', value: '0.887', target: '≥ 0.850', status: 'optimal' },
    { label: 'خطأ معايرة Brier', value: '0.074', target: '< 0.100', status: 'optimal' },
  ];

  const populationSHAP = [
    { feature: 'مستوى HbA1c (%)', importance: 0.34, meanContribution: '+22.4%', color: 'bg-apple-red' },
    { feature: 'سكر البلازما الصائم (ملغ/ديسيلتر)', importance: 0.26, meanContribution: '+17.8%', color: 'bg-apple-orange' },
    { feature: 'مؤشر كتلة الجسم (BMI)', importance: 0.18, meanContribution: '+12.1%', color: 'bg-apple-blue' },
    { feature: 'فئات العمر (سنوات)', importance: 0.09, meanContribution: '+6.2%', color: 'bg-purple-500' },
    { feature: 'التاريخ العائلي (الدرجة الأولى)', importance: 0.08, meanContribution: '+5.5%', color: 'bg-teal-500' },
    { feature: 'ضغط الدم الانقباضي', importance: 0.05, meanContribution: '+3.4%', color: 'bg-pink-500' },
  ];

  const fairnessAudits = [
    { demographic: 'الجنس البيولوجي: أنثى', sampleSize: '2,640', auc: '0.916', parityGap: '-0.002 (تحقيق التكافؤ)' },
    { demographic: 'الجنس البيولوجي: ذكر', sampleSize: '2,360', auc: '0.912', parityGap: '+0.002 (تحقيق التكافؤ)' },
    { demographic: 'فئة العمر: 18–39', sampleSize: '1,120', auc: '0.908', parityGap: '-0.006 (تحقيق التكافؤ)' },
    { demographic: 'فئة العمر: 40–59', sampleSize: '2,410', auc: '0.918', parityGap: '+0.004 (تحقيق التكافؤ)' },
    { demographic: 'فئة العمر: ≥60', sampleSize: '1,470', auc: '0.914', parityGap: '0.000 (تحقيق التكافؤ)' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl">
      {/* رأس العنوان */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-apple-gray-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-apple-blue flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-apple-text">
              مراقبة عن بعد للنموذج والتحليلات التنبؤية
            </h1>
            <p className="text-xs text-apple-text-secondary mt-0.5">
              مقاييس الاستدلال على مستوى السكان، والمنحنيات المميزة المضبوطة، والتدقيق على العدالة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-apple-green bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <CheckCircle size={14} /> النموذج الإنتاجي نشط: XGBoost-Tree v1.0
          </span>
        </div>
      </div>

      {/* شبكة المقاييس الأساسية */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {modelMetrics.map((m) => (
          <div key={m.label} className="p-4 rounded-2xl bg-white border border-apple-gray-2 shadow-xs flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-apple-text-secondary">
              {m.label}
            </span>
            <span className="text-2xl font-extrabold text-apple-text mt-1">
              {m.value}
            </span>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-apple-gray-2 text-[11px] text-apple-text-secondary">
              <span>المقياس المعياري: {m.target}</span>
              <span className="text-apple-green font-bold">نجح</span>
            </div>
          </div>
        ))}
      </div>

      {/* عمودان: SHAP عالمي للسكان ومصفوفة الالتباس */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* أهمية SHAP العالمية (7 أعمدة) */}
        <Card title="أهمية الميزات العالمية SHAP لل gruppo" className="lg:col-span-7 p-6 bg-white">
          <p className="text-xs text-apple-text-secondary mb-4">
            قيم SHAP المطلقة المتوسطة المجمعة عبر 5000 سجل مدرج تم تقييمه، للتحقق من توافق ADA.
          </p>

          <div className="space-y-4">
            {populationSHAP.map((item) => (
              <div key={item.feature} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-apple-text">{item.feature}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-apple-text-secondary">التأثير: {item.meanContribution}</span>
                    <span className="font-bold text-apple-text w-12 text-right">
                      {(item.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="h-2.5 w-full bg-apple-gray rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.importance * 100 * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-apple-blue">
            <Award size={18} className="flex-shrink-0 mt-0.5" />
            <span>
              أكدت خوارزمية Tree SHAP عدم وجود ارتباطات بديلة كاذبة؛ HbA1c والجلوكوز البلازمي يظلا المحركين الرياضيين الرئيسيين غير المتنازع عليهم.
            </span>
          </div>
        </Card>

        {/* دقة التشخيص والتمييز (5 أعمدة) */}
        <Card title="مصفوفة الالتباس السريرية (مجموعة الاختبار)" className="lg:col-span-5 p-6 bg-white flex flex-col justify-between">
          <div>
            <p className="text-xs text-apple-text-secondary mb-4">
              تم التقييم على 1000 حالة تحقق سريري معتم (N=1,000).
            </p>

            <div className="grid grid-cols-2 gap-3 text-center">
              {/* إيجابي حقيقي */}
              <div className="p-4 rounded-2xl bg-green-50 border border-green-200 flex flex-col">
                <span className="text-xs font-bold text-green-900">إيجابي حقيقي (TP)</span>
                <span className="text-2xl font-extrabold text-apple-green mt-1">269</span>
                <span className="text-[10px] text-green-700 mt-0.5">الحساسية: 89.6%</span>
              </div>

              {/* إيجابي كاذب */}
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col">
                <span className="text-xs font-bold text-orange-900">إيجابي كاذب (FP)</span>
                <span className="text-2xl font-extrabold text-apple-orange mt-1">54</span>
                <span className="text-[10px] text-orange-700 mt-0.5">خطأ من النوع الأول</span>
              </div>

              {/* سلبي كاذب */}
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col">
                <span className="text-xs font-bold text-red-900">سلبي كاذب (FN)</span>
                <span className="text-2xl font-extrabold text-apple-red mt-1">31</span>
                <span className="text-[10px] text-red-700 mt-0.5">خطأ من النوع الثاني (3.1%)</span>
              </div>

              {/* سلبي حقيقي */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col">
                <span className="text-xs font-bold text-blue-900">سلبي حقيقي (TN)</span>
                <span className="text-2xl font-extrabold text-apple-blue mt-1">646</span>
                <span className="text-[10px] text-blue-700 mt-0.5">النوعية: 92.3%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-apple-gray-2 text-[11px] text-apple-text-secondary flex items-center justify-between">
            <span>الدقة التشخيصية الإجمالية:</span>
            <span className="font-bold text-apple-text text-sm">91.5%</span>
          </div>
        </Card>
      </div>

      {/* جدول التدقيق على الخوارزمية والتحيز */}
      <Card title="تدقيق التكافؤ الديموغرافي والتحيز الخوارزمي (HIPAA §164)" className="p-6 bg-white">
        <p className="text-xs text-apple-text-secondary mb-4">
          مراقبة تلقائية روتينية للعدالة تضمن اتساق التنبؤ عبر الجنسين البيولوجيين وفئات العمر دون تحيز خوارزمي.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-apple-gray-2 text-apple-text-secondary uppercase font-semibold">
                <th className="py-2.5 px-3">الفئة الديموغرافية الفرعية</th>
                <th className="py-2.5 px-3">عدد العينة</th>
                <th className="py-2.5 px-3">AUC المجموعة الفرعية</th>
                <th className="py-2.5 px-3">تحمل التكافؤ (Δ &lt; 0.02)</th>
                <th className="py-2.5 px-3">حالة الامتثال</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-gray-2">
              {fairnessAudits.map((f, i) => (
                <tr key={i} className="hover:bg-apple-gray/50 transition">
                  <td className="py-3 px-3 font-semibold text-apple-text">{f.demographic}</td>
                  <td className="py-3 px-3 text-apple-text-secondary">{f.sampleSize}</td>
                  <td className="py-3 px-3 font-bold text-apple-text">{f.auc}</td>
                  <td className="py-3 px-3 text-apple-blue font-medium">{f.parityGap}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-apple-green bg-green-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      <CheckCircle size={12} /> معتمد
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
