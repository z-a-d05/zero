import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Sidebar } from '../../components/layout/Sidebar';
import { PatientList } from '../../components/clinician/PatientList';
import { PatientDetail } from '../../components/clinician/PatientDetail';
import { Patient, PatientListItem, PredictionResult } from '../../types';
import { Users, BarChart3, FileText, ShieldCheck } from 'lucide-react';

// عينة واقعية من المرضى السريريين
const INITIAL_MOCK_PATIENTS: PatientListItem[] = [
  {
    id: 'p-101',
    name: 'إليانور فانس',
    age: 58,
    latestRiskScore: 0.78,
    riskLevel: 'high',
    lastVisit: 'اليوم',
  },
  {
    id: 'p-102',
    name: 'ماركوس ثورن',
    age: 49,
    latestRiskScore: 0.62,
    riskLevel: 'medium',
    lastVisit: 'الأمس',
  },
  {
    id: 'p-103',
    name: 'صوفيا تشن',
    age: 34,
    latestRiskScore: 0.22,
    riskLevel: 'low',
    lastVisit: 'منذ 3 أيام',
  },
  {
    id: 'p-104',
    name: 'روبرت ميلر',
    age: 63,
    latestRiskScore: 0.84,
    riskLevel: 'high',
    lastVisit: 'منذ أسبوع',
  },
  {
    id: 'p-105',
    name: 'أمنى المنصور',
    age: 42,
    latestRiskScore: 0.44,
    riskLevel: 'medium',
    lastVisit: 'منذ أسبوعين',
  },
];

const DETAILED_PATIENT_RECORDS: Record<string, { patient: Patient; prediction: PredictionResult }> = {
  'p-101': {
    patient: {
      id: 'p-101',
      name: 'إليانور فانس',
      age: 58,
      gender: 'female',
      bmi: 32.4,
      hba1c: 6.8,
      fastingGlucose: 138,
      bloodPressureSys: 144,
      bloodPressureDia: 92,
      familyHistory: true,
      physicalActivityLevel: 'low',
      smokingStatus: false,
      createdAt: '2024-03-12T10:00:00Z',
    },
    prediction: {
      id: 'pr-101',
      patientId: 'p-101',
      predictionType: 'T2DM',
      riskScore: 0.78,
      riskLevel: 'high',
      riskPercentage: 78.0,
      modelVersion: 'XGBoost-Tree v1.0',
      createdAt: '2024-03-12T10:05:00Z',
      recommendations: [
        'ابدأ بمتروفمين 500 ملغ مرتين يوميًا مع الوجبات.',
        'إحالة إلى معلم سكري معتمد لحساب الكربوهيدرات.',
        'حدد موعدًا لتكرار فحص HbA1c ولوحة الدهون خلال 12 أسبوعًا.',
      ],
      explanation: {
        baseValue: 0.15,
        topFactors: ['مستوى HbA1c (6.8%)', 'سكر الدم الصائم (138 ملغ/ديسيلتر)', 'مؤشر كتلة الجسم (32.4 كغ/م²)'],
        limeRule: 'HbA1c > 6.5% ومؤشر كتلة الجسم > 30 كغ/م² هما العاملان الأساسيان اللذان يرفعان الخطر إلى 78%.',
        features: [
          { name: 'hba1c', displayName: 'مستوى HbA1c', value: 6.8, contribution: 0.32 },
          { name: 'fasting_glucose', displayName: 'سكر الدم الصائم', value: 138, contribution: 0.18 },
          { name: 'bmi', displayName: 'مؤشر كتلة الجسم', value: 32.4, contribution: 0.12 },
          { name: 'family_history', displayName: 'التاريخ العائلي', value: 'نعم', contribution: 0.08 },
          { name: 'blood_pressure_sys', displayName: 'ضغط الدم الانقباضي', value: 144, contribution: 0.04 },
          { name: 'physical_activity_level', displayName: 'مستوى النشاط البدني', value: 'منخفض', contribution: 0.05 },
          { name: 'age', displayName: 'العمر', value: 58, contribution: 0.04 },
          { name: 'smoking_status', displayName: 'حالة التدخين', value: 'لا', contribution: -0.01 },
        ],
      },
    },
  },
  'p-102': {
    patient: {
      id: 'p-102',
      name: 'ماركوس ثورن',
      age: 49,
      gender: 'male',
      bmi: 28.1,
      hba1c: 5.9,
      fastingGlucose: 112,
      bloodPressureSys: 132,
      bloodPressureDia: 84,
      familyHistory: true,
      physicalActivityLevel: 'medium',
      smokingStatus: true,
      createdAt: '2024-03-10T11:00:00Z',
    },
    prediction: {
      id: 'pr-102',
      patientId: 'p-102',
      predictionType: 'T2DM',
      riskScore: 0.62,
      riskLevel: 'medium',
      riskPercentage: 62.0,
      modelVersion: 'XGBoost-Tree v1.0',
      createdAt: '2024-03-10T11:05:00Z',
      recommendations: [
        'إرشاد للإقلاع عن التدخين.',
        'هدف فقدان 5% من الوزن من خلال نظام غذائي متوسطي.',
      ],
      explanation: {
        baseValue: 0.15,
        topFactors: ['سكر صائم معتمد (112 ملغ/ديسيلتر)', 'HbA1c مقدمات سكري (5.9%)', 'حالة التدخين'],
        limeRule: 'نطاق HbA1c مقدمات السكري (5.9%) مع التاريخ العائلي يشير إلى تسارع معتدل.',
        features: [
          { name: 'hba1c', displayName: 'مستوى HbA1c', value: 5.9, contribution: 0.21 },
          { name: 'fasting_glucose', displayName: 'سكر الدم الصائم', value: 112, contribution: 0.14 },
          { name: 'smoking_status', displayName: 'حالة التدخين', value: 'نعم', contribution: 0.06 },
          { name: 'bmi', displayName: 'مؤشر كتلة الجسم', value: 28.1, contribution: 0.05 },
          { name: 'family_history', displayName: 'التاريخ العائلي', value: 'نعم', contribution: 0.07 },
          { name: 'physical_activity_level', displayName: 'مستوى النشاط البدني', value: 'متوسط', contribution: -0.03 },
        ],
      },
    },
  },
  'p-103': {
    patient: {
      id: 'p-103',
      name: 'صوفيا تشن',
      age: 34,
      gender: 'female',
      bmi: 21.8,
      hba1c: 5.1,
      fastingGlucose: 86,
      bloodPressureSys: 116,
      bloodPressureDia: 74,
      familyHistory: false,
      physicalActivityLevel: 'high',
      smokingStatus: false,
      createdAt: '2024-03-08T09:30:00Z',
    },
    prediction: {
      id: 'pr-103',
      patientId: 'p-103',
      predictionType: 'T2DM',
      riskScore: 0.22,
      riskLevel: 'low',
      riskPercentage: 22.0,
      modelVersion: 'XGBoost-Tree v1.0',
      createdAt: '2024-03-08T09:35:00Z',
      recommendations: ['حافظ على أسلوب حياتك الغذائي والنشط الحالي.'],
      explanation: {
        baseValue: 0.15,
        topFactors: ['HbA1c مثالي (5.1%)', 'مؤشر كتلة جسم طبيعي (21.8)', 'نشاط بدني عالي'],
        limeRule: 'العلامات الحيوية ضمن النطاقات المرجعية المثلى.',
        features: [
          { name: 'hba1c', displayName: 'مستوى HbA1c', value: 5.1, contribution: -0.08 },
          { name: 'bmi', displayName: 'مؤشر كتلة الجسم', value: 21.8, contribution: -0.06 },
          { name: 'physical_activity_level', displayName: 'مستوى النشاط البدني', value: 'عالٍ', contribution: -0.07 },
          { name: 'fasting_glucose', displayName: 'سكر الدم الصائم', value: 86, contribution: -0.05 },
          { name: 'age', displayName: 'العمر', value: 34, contribution: -0.04 },
        ],
      },
    },
  },
  'p-104': {
    patient: {
      id: 'p-104',
      name: 'روبرت ميلر',
      age: 63,
      gender: 'male',
      bmi: 34.0,
      hba1c: 7.2,
      fastingGlucose: 152,
      bloodPressureSys: 150,
      bloodPressureDia: 96,
      familyHistory: true,
      physicalActivityLevel: 'low',
      smokingStatus: true,
      createdAt: '2024-03-05T14:00:00Z',
    },
    prediction: {
      id: 'pr-104',
      patientId: 'p-104',
      predictionType: 'T2DM',
      riskScore: 0.84,
      riskLevel: 'high',
      riskPercentage: 84.0,
      modelVersion: 'XGBoost-Tree v1.0',
      createdAt: '2024-03-05T14:10:00Z',
      recommendations: [
        'إحالة عاجلة إلى تخصص الغدد الصماء الأيضي.',
        'تقييم العلاج المزدوج بمضادات ارتفاع ضغط الدم والمتروفمين.',
      ],
      explanation: {
        baseValue: 0.15,
        topFactors: ['HbA1c (7.2%)', 'سكر الدم الصائم (152 ملغ/ديسيلتر)', 'العمر (63) وBMI (34)'],
        limeRule: 'معلمات جلوكوز في نطاق التشخيص السكري مع ارتفاع ضغط الدم.',
        features: [
          { name: 'hba1c', displayName: 'مستوى HbA1c', value: 7.2, contribution: 0.36 },
          { name: 'fasting_glucose', displayName: 'سكر الدم الصائم', value: 152, contribution: 0.22 },
          { name: 'bmi', displayName: 'مؤشر كتلة الجسم', value: 34.0, contribution: 0.14 },
          { name: 'age', displayName: 'العمر', value: 63, contribution: 0.08 },
          { name: 'blood_pressure_sys', displayName: 'ضغط الدم الانقباضي', value: 150, contribution: 0.06 },
        ],
      },
    },
  },
  'p-105': {
    patient: {
      id: 'p-105',
      name: 'أمنى المنصور',
      age: 42,
      gender: 'female',
      bmi: 26.5,
      hba1c: 5.7,
      fastingGlucose: 105,
      bloodPressureSys: 122,
      bloodPressureDia: 78,
      familyHistory: true,
      physicalActivityLevel: 'medium',
      smokingStatus: false,
      createdAt: '2024-02-28T16:00:00Z',
    },
    prediction: {
      id: 'pr-105',
      patientId: 'p-105',
      predictionType: 'T2DM',
      riskScore: 0.44,
      riskLevel: 'medium',
      riskPercentage: 44.0,
      modelVersion: 'XGBoost-Tree v1.0',
      createdAt: '2024-02-28T16:05:00Z',
      recommendations: ['إرشادات نمط الحياة لمنع التقدم إلى سكري مكشوف.'],
      explanation: {
        baseValue: 0.15,
        topFactors: ['HbA1c حدودي (5.7%)', 'التاريخ العائلي', 'وزن زائد طفيف (BMI 26.5)'],
        limeRule: 'مقدمات سكري حدودية مبكرة. مستجيبة لتعديل نمط الحياة.',
        features: [
          { name: 'hba1c', displayName: 'مستوى HbA1c', value: 5.7, contribution: 0.15 },
          { name: 'family_history', displayName: 'التاريخ العائلي', value: 'نعم', contribution: 0.09 },
          { name: 'fasting_glucose', displayName: 'سكر الدم الصائم', value: 105, contribution: 0.08 },
          { name: 'bmi', displayName: 'مؤشر كتلة الجسم', value: 26.5, contribution: 0.04 },
        ],
      },
    },
  },
};

// عرض فرز المرضى (الافتراضي/مسار الفهرس)
const PatientTriageView: React.FC = () => {
  const [patientList, setPatientList] = useState<PatientListItem[]>(INITIAL_MOCK_PATIENTS);
  const [selectedId, setSelectedId] = useState<string>('p-101');

  const activeRecord = DETAILED_PATIENT_RECORDS[selectedId] || DETAILED_PATIENT_RECORDS['p-101'];

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      <PatientList
        patients={patientList}
        selectedPatientId={selectedId}
        onSelectPatient={(id) => setSelectedId(id)}
      />
      <PatientDetail
        patient={activeRecord.patient}
        prediction={activeRecord.prediction}
      />
    </div>
  );
};

export const ClinicianDashboard: React.FC = () => {
  const location = useLocation();

  const isAnalytics = location.pathname.includes('/analytics');
  const isEHR = location.pathname.includes('/ehr');
  const isAudit = location.pathname.includes('/audit');

  return (
    <Layout>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-apple-gray">
        {/* شريط التنقل السريري (سطح المكتب) */}
        <Sidebar className="hidden lg:flex" />

        {/* شريط التنقل الثانوي للهواتف المحمولة */}
        <div className="lg:hidden bg-white border-b border-apple-gray-2 p-2 flex items-center justify-around overflow-x-auto">
          <Link
            to="/clinician"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${
              !isAnalytics && !isEHR && !isAudit
                ? 'bg-apple-blue text-white'
                : 'text-apple-text-secondary hover:text-apple-text'
            }`}
          >
            <Users size={14} /> فرز المرضى
          </Link>
          <Link
            to="/clinician/analytics"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${
              isAnalytics
                ? 'bg-apple-blue text-white'
                : 'text-apple-text-secondary hover:text-apple-text'
            }`}
          >
            <BarChart3 size={14} /> التحليلات
          </Link>
          <Link
            to="/clinician/ehr"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${
              isEHR
                ? 'bg-apple-blue text-white'
                : 'text-apple-text-secondary hover:text-apple-text'
            }`}
          >
            <FileText size={14} /> السجل الطبي الإلكتروني / FHIR
          </Link>
          <Link
            to="/clinician/audit"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${
              isAudit
                ? 'bg-apple-blue text-white'
                : 'text-apple-text-secondary hover:text-apple-text'
            }`}
          >
            <ShieldCheck size={14} /> سجل التدقيق
          </Link>
        </div>

        {/* مساحة العمل الرئيسية - عروض المسارات الفرعية عبر Outlet */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </Layout>
  );
};

// تصدير PatientTriageView لمسار الفهرس
export { PatientTriageView };
