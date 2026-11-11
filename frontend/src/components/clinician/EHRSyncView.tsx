import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  FileText,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Server,
  DownloadCloud,
  Check,
  Clock,
} from 'lucide-react';

export const EHRSyncView: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const [pulledRecords, setPulledRecords] = useState([
    {
      id: 'FHIR-98214',
      name: 'إليانور فانس',
      mrn: 'MRN-849102',
      loincCode: '4548-4 (HbA1c)',
      value: '6.8 %',
      source: 'Epic EMR / HAPI FHIR R4',
      timestamp: 'اليوم، 10:14 صباحاً',
      status: 'مخصص إلى DPIS',
    },
    {
      id: 'FHIR-98215',
      name: 'ماركوس ثورن',
      mrn: 'MRN-723190',
      loincCode: '1558-6 (سكر الدم الصائم)',
      value: '112 ملغ/ديسيلتر',
      source: 'Cerner Millennium FHIR',
      timestamp: 'الأمس، 04:30 مساءً',
      status: 'مخصص إلى DPIS',
    },
    {
      id: 'FHIR-98216',
      name: 'روبرت ميلر',
      mrn: 'MRN-554210',
      loincCode: '8480-6 (ضغط الدم الانقباضي)',
      value: '150 مم زئبق',
      source: 'Epic EMR / HAPI FHIR R4',
      timestamp: 'الأمس، 02:15 مساءً',
      status: 'مخصص إلى DPIS',
    },
    {
      id: 'FHIR-98217',
      name: 'صوفيا تشن',
      mrn: 'MRN-901243',
      loincCode: '39156-5 (نسبة BMI)',
      value: '21.8 كغ/م²',
      source: 'Athenahealth FHIR API',
      timestamp: 'منذ يومين',
      status: 'مخصص إلى DPIS',
    },
  ]);

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncStatus('استعلام عن نقطة نهاية FHIR R4 (حزم المرضى والمشاهدات)...');

    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('تم مزامنة 18 ملاحظة سريرية جديدة بنجاح من السجل الطبي الإلكتروني للمستشفى.');
      setPulledRecords((prev) => [
        {
          id: `FHIR-${Math.floor(10000 + Math.random() * 90000)}`,
          name: 'أمنى المنصور',
          mrn: 'MRN-334211',
          loincCode: '4548-4 (HbA1c)',
          value: '5.7 %',
          source: 'Epic EMR / HAPI FHIR R4',
          timestamp: 'الآن',
          status: 'مخصص إلى DPIS',
        },
        ...prev,
      ]);
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl">
      {/* رأس العنوان */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-apple-gray-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-apple-green flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-apple-text">
              بوابة互operability للسجل الطبي الإلكتروني و FHIR R4
            </h1>
            <p className="text-xs text-apple-text-secondary mt-0.5">
              استخراج تلقائي لملاحظات المختبر، ورمزية أكواد LOINC السريرية، ومحفزات CDS Hooks السريرية.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleTriggerSync}
          isLoading={isSyncing}
          className="shadow-xs"
        >
          <RefreshCw size={15} className="mr-1.5" /> سحب المختبرات الحديثة عبر FHIR
        </Button>
      </div>

      {/* شريط حالة المزامنة إذا كان نشطاً */}
      {syncStatus && (
        <div className="p-3.5 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-2.5 text-xs text-green-950 font-medium">
          <CheckCircle2 size={16} className="text-apple-green flex-shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* بطاقات تاريخ الاتصال */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* بطاقة 1: خادم FHIR */}
        <Card className="p-5 bg-white flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-apple-text-secondary">
                جسر السجل الطبي الإلكتروني للمستشفى
              </span>
              <span className="text-xs font-bold text-apple-green bg-green-50 px-2 py-0.5 rounded-md">
                متصل
              </span>
            </div>
            <h3 className="text-base font-bold text-apple-text">
              نقطة نهاية HL7 FHIR R4
            </h3>
            <span className="text-xs text-apple-text-secondary font-mono bg-apple-gray p-1.5 rounded-lg">
              https://ehr.hospital.org/baseR4
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-apple-gray-2 text-[11px] text-apple-text-secondary flex items-center justify-between">
            <span>فترة الكمون: 48ms</span>
            <span className="font-semibold text-apple-blue">TLS 1.3 مؤكد</span>
          </div>
        </Card>

        {/* بطاقة 2: مستمع CDS Hooks */}
        <Card className="p-5 bg-white flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-apple-text-secondary">
                سير العمل السريري
              </span>
              <span className="text-xs font-bold text-apple-green bg-green-50 px-2 py-0.5 rounded-md">
                نشط
              </span>
            </div>
            <h3 className="text-base font-bold text-apple-text">
              خدمة CDS Hooks v1.0
            </h3>
            <span className="text-xs text-apple-text-secondary font-mono bg-apple-gray p-1.5 rounded-lg">
              hook: patient-view / order-select
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-apple-gray-2 text-[11px] text-apple-text-secondary flex items-center justify-between">
            <span>بطاقات عرضت: 240/يوم</span>
            <span className="font-semibold text-apple-blue">SMART on FHIR</span>
          </div>
        </Card>

        {/* بطاقة 3: محرك مصطلحات LOINC */}
        <Card className="p-5 bg-white flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-apple-text-secondary">
                التناغم المصطلحي
              </span>
              <span className="text-xs font-bold text-apple-blue bg-blue-50 px-2 py-0.5 rounded-md">
                LOINC 2.76
              </span>
            </div>
            <h3 className="text-base font-bold text-apple-text">
              قاموس مختبر معياري
            </h3>
            <span className="text-xs text-apple-text-secondary">
              ربط تلقائي لـ HbA1c، سكر الدم الصائم، ضغط الدم الانقباضي والانبساطي، وBMI.
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-apple-gray-2 text-[11px] text-apple-text-secondary flex items-center justify-between">
            <span>أكواد مرتبطة: 100%</span>
            <span className="font-semibold text-apple-green">لا توجد違ات</span>
          </div>
        </Card>
      </div>

      {/* تيار مباشر من الملاحظات المسحوبة */}
      <Card title="تيار ملاحظات المرضى المزامن (HL7 FHIR)" className="p-6 bg-white">
        <p className="text-xs text-apple-text-secondary mb-4">
          الإدخالات البيومترية والمختبرية الحديثة المستوردة من أنظمة السجل الطبي الإلكتروني إلى معالجات ميزات DPIS.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-apple-gray-2 text-apple-text-secondary uppercase font-semibold">
                <th className="py-2.5 px-3">معرف مورد FHIR</th>
                <th className="py-2.5 px-3">اسم المريض / الرقم الطبي</th>
                <th className="py-2.5 px-3">مفهوم LOINC</th>
                <th className="py-2.5 px-3">القيمة المستوردة</th>
                <th className="py-2.5 px-3">مصدر السجل الطبي الإلكتروني</th>
                <th className="py-2.5 px-3">وقت التسجيل</th>
                <th className="py-2.5 px-3">حالة خط الأنابيب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-gray-2">
              {pulledRecords.map((r) => (
                <tr key={r.id} className="hover:bg-apple-gray/50 transition">
                  <td className="py-3 px-3 font-mono text-[11px] text-apple-blue font-semibold">{r.id}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-apple-text">{r.name}</span>
                      <span className="text-[10px] text-apple-text-secondary">{r.mrn}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-apple-text">{r.loincCode}</td>
                  <td className="py-3 px-3 font-bold text-apple-text">{r.value}</td>
                  <td className="py-3 px-3 text-apple-text-secondary">{r.source}</td>
                  <td className="py-3 px-3 text-apple-text-secondary">{r.timestamp}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-apple-green bg-green-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      <Check size={12} strokeWidth={3} /> {r.status}
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
