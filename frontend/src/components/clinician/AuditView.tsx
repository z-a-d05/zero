import React, { useState } from 'react';
import { Card } from '../ui/Card';
import {
  ShieldCheck,
  Lock,
  Search,
  Filter,
  CheckCircle,
  FileKey,
  Calendar,
  User,
  Activity,
} from 'lucide-react';

export const AuditView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const auditEvents = [
    {
      id: 'AUD-89102-1',
      timestamp: '2026-11-10 18:42:15 UTC',
      actor: 'dr.sarah@hospital.org',
      role: 'طبيب مقيم',
      action: 'GENERATE_PREDICTION',
      resourceType: 'مريض (إليانور فانس)',
      resourceId: 'p-101',
      ipAddress: '192.168.1.45',
      cryptoHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      status: 'VERIFIED_IMMUTABLE',
    },
    {
      id: 'AUD-89102-2',
      timestamp: '2026-11-10 18:35:02 UTC',
      actor: 'dr.sarah@hospital.org',
      role: 'طبيب مقيم',
      action: 'SIMULATE_WHATIF',
      resourceType: 'مريض (ماركوس ثورن)',
      resourceId: 'p-102',
      ipAddress: '192.168.1.45',
      cryptoHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'VERIFIED_IMMUTABLE',
    },
    {
      id: 'AUD-89102-3',
      timestamp: '2026-11-10 17:12:44 UTC',
      actor: 'sys-fhir-worker@dpis',
      role: 'حساب خدمة نظام السجل الطبي الإلكتروني',
      action: 'INGEST_LAB_OBSERVATIONS',
      resourceType: 'حزمة مشاهدات (HL7 FHIR)',
      resourceId: 'bundle-994',
      ipAddress: '10.0.4.12',
      cryptoHash: 'sha256:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
      status: 'VERIFIED_IMMUTABLE',
    },
    {
      id: 'AUD-89102-4',
      timestamp: '2026-11-10 16:04:19 UTC',
      actor: 'patient-self@demo.com',
      role: 'مريض',
      action: 'ACCESS_OWN_PHI',
      resourceType: 'ملف المريض الشخصي',
      resourceId: 'p-self-01',
      ipAddress: '172.56.21.90',
      cryptoHash: 'sha256:11a4b4c79e0ee7e7f7b2c018274d754b2d35272a74c43105ff76b1b7ab84db32',
      status: 'VERIFIED_IMMUTABLE',
    },
    {
      id: 'AUD-89102-5',
      timestamp: '2026-11-10 14:22:58 UTC',
      actor: 'dr.connor@hospital.org',
      role: 'رئيس قسم الغدد الصماء',
      action: 'EXPORT_CLINICAL_REPORT',
      resourceType: 'مريض (روبرت ميلر)',
      resourceId: 'p-104',
      ipAddress: '192.168.1.18',
      cryptoHash: 'sha256:2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      status: 'VERIFIED_IMMUTABLE',
    },
  ];

  const filtered = auditEvents.filter(
    (e) =>
      e.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.resourceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const arabicActions: Record<string, string> = {
    'GENERATE_PREDICTION': 'توليد تنبؤ',
    'SIMULATE_WHATIF': 'محاكاة ماذا لو',
    'INGEST_LAB_OBSERVATIONS': 'استيراد ملاحظات المختبر',
    'ACCESS_OWN_PHI': 'الوصول إلى المعلومات الصحية الشخصية',
    'EXPORT_CLINICAL_REPORT': 'تصدير تقرير سريري',
  };

  const arabicRoles: Record<string, string> = {
    'Attending Physician': 'طبيب مقيم',
    'EHR Service Account': 'حساب خدمة نظام السجل الطبي الإلكتروني',
    'Patient': 'مريض',
    'Chief of Endocrinology': 'رئيس قسم الغدد الصماء',
  };

  const arabicStatus: Record<string, string> = {
    'VERIFIED_IMMUTABLE': 'مؤكد غير قابل للتغيير',
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl">
      {/* رأس العنوان */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-apple-gray-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-apple-text">
              مسار التدقيق غير القابل للحذف (HIPAA و GDPR)
            </h1>
            <p className="text-xs text-apple-text-secondary mt-0.5">
              سجل أمني تشفيري مضاف فقط يلتقط 100% من معاملات المعلومات الصحية المحمية (PHI).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Lock size={14} /> وضع الإضافة فقط: لا يسمح بأي حذف
          </span>
        </div>
      </div>

      {/* بطاقات الأمان */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-apple-text-secondary">
            التحقق من التكامل
          </span>
          <h3 className="text-lg font-bold text-apple-text mt-1">
            دفتر الأستاذ مشفر SHA-256
          </h3>
          <p className="text-xs text-apple-text-secondary mt-1">
            كل إدخال في السجل مرتبط تشفيرياً لمنع التعديل أو العبث بأثر رجعي.
          </p>
        </Card>

        <Card className="p-5 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-apple-text-secondary">
            سياسة الوصول
          </span>
          <h3 className="text-lg font-bold text-apple-text mt-1">
            تطبيق RBAC
          </h3>
          <p className="text-xs text-apple-text-secondary mt-1">
            नियंत्रة وصول تستند إلى الأدوار تفصل سجلات المريض الذاتية عن مجموعات الأطباء.
          </p>
        </Card>

        <Card className="p-5 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-apple-text-secondary">
            حالة التشفير
          </span>
          <h3 className="text-lg font-bold text-apple-text mt-1">
            تشفير AES-256 أثناء الراحة / TLS 1.3
          </h3>
          <p className="text-xs text-apple-text-secondary mt-1">
            جميع معرفات المرضى المخزنة وأوزان النموذج تستخدم تشفير الأجهزة المتسارع من المستوى المؤسسي.
          </p>
        </Card>
      </div>

      {/* البحث والجدول */}
      <Card className="p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-base font-bold text-apple-text">
            أحداث التدقيق على الامتثال المباشر ({filtered.length})
          </h3>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-2.5 text-apple-text-secondary" />
            <input
              type="text"
              placeholder="البحث حسب المستخدم، الإجراء، أو المريض..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-apple-gray rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-apple-gray-2 text-apple-text-secondary uppercase font-semibold">
                <th className="py-2.5 px-3">معرف السجل</th>
                <th className="py-2.5 px-3">الطابع الزمني (UTC)</th>
                <th className="py-2.5 px-3">الفاعل / الدور</th>
                <th className="py-2.5 px-3">الإجراء السريري</th>
                <th className="py-2.5 px-3">مورد PHI المستهدف</th>
                <th className="py-2.5 px-3">مصدر IP</th>
                <th className="py-2.5 px-3">بصمة تشفيرية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-gray-2">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-apple-gray/50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-apple-text">{log.id}</td>
                  <td className="py-3 px-3 text-apple-text-secondary whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-apple-text">{log.actor}</span>
                      <span className="text-[10px] text-apple-text-secondary">{arabicRoles[log.role] ?? log.role}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-apple-blue bg-blue-50 px-2 py-0.5 rounded-md font-mono text-[11px]">
                      {arabicActions[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-apple-text">{log.resourceType}</td>
                  <td className="py-3 px-3 font-mono text-apple-text-secondary">{log.ipAddress}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 font-mono text-[10px] text-apple-green bg-green-50 px-2 py-0.5 rounded-md max-w-[180px] truncate" title={log.cryptoHash}>
                      <CheckCircle size={11} className="flex-shrink-0" />
                      <span className="truncate">{log.cryptoHash.slice(0, 20)}...</span>
                    </div>
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
