import React, { useState } from 'react';
import { Patient, PredictionResult } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { RiskMeter } from '../ui/RiskMeter';
import { SHAPWaterfall } from './SHAPWaterfall';
import { TreatmentSimulator } from './TreatmentSimulator';
import { ClinicalReportModal } from './ClinicalReportModal';
import { Button } from '../ui/Button';
import {
  Printer,
  FileDown,
  UserCheck,
  Calendar,
  Activity,
  Heart,
  Scale,
  Sparkles,
} from 'lucide-react';

interface PatientDetailProps {
  patient: Patient;
  prediction?: PredictionResult | null;
  onExportPdf?: () => void;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  prediction,
  onExportPdf,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);

  const currentRisk = prediction ? prediction.riskScore : 0.45;
  const currentRiskPercentage = prediction ? prediction.riskPercentage : 45;
  const currentRiskLevel = prediction ? prediction.riskLevel : 'medium';

  const arabicGender: Record<string, string> = {
    male: 'ذكر',
    female: 'أنثى',
    other: 'أخرى',
  };

  const arabicActivity: Record<string, string> = {
    low: 'منخفض',
    medium: 'متوسط',
    high: 'عالٍ',
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
      {/* 1. رأس المريض وشريط الإجراءات */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-apple-gray-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-apple-blue/10 text-apple-blue flex items-center justify-center font-bold text-xl">
            {patient.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-apple-text">
                {patient.name}
              </h1>
              <Badge level={currentRiskLevel} size="md" />
            </div>
            <span className="text-xs text-apple-text-secondary mt-0.5">
              الرقم الطبي: #{patient.id.slice(0, 8)} • {patient.age} سنة • الجنس البيولوجي:{' '}
              <span className="capitalize">{arabicGender[patient.gender] ?? patient.gender}</span> • تاريخ إنشاء السجل:{' '}
              {new Date(patient.createdAt).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={() => setShowReportModal(true)}>
            <Printer size={15} className="mr-1.5" />
            طباعة الملخص
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowReportModal(true)}>
            <FileDown size={15} className="mr-1.5" />
            تصدير التقرير الطبي بصيغة PDF
          </Button>
        </div>
      </div>

      {/* 2. نظرة عامة عليا: مقياس الخطر وشبكة المؤشرات الحيوية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* بطاقة مقياس الخطر */}
        <Card className="p-6 flex flex-col items-center justify-center bg-white">
          <span className="text-xs font-semibold uppercase tracking-wider text-apple-text-secondary mb-2">
            تصنيف خطر السكري من النوع الثاني المتوقع
          </span>
          <RiskMeter score={currentRiskPercentage} size={200} />
          <div className="mt-4 text-center">
            <span className="text-xs text-apple-text-secondary">
              نموذج الثقة: <span className="font-semibold text-apple-text">{prediction?.modelVersion || 'XGBoost-Tree v1.0'}</span>
            </span>
          </div>
        </Card>

        {/* ملخص العلامات الحيوية والمختبرات الحالية */}
        <Card title="العلامات الحيوية والعلامات الحالية" className="lg:col-span-2 p-6 bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* HbA1c */}
            <div className="p-3.5 rounded-xl bg-apple-gray border border-apple-gray-2 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-text-secondary">
                مستوى HbA1c
              </span>
              <span className="text-xl font-bold text-apple-text mt-1">
                {patient.hba1c}%
              </span>
              <span className="text-[11px] text-apple-text-secondary mt-0.5">
                {patient.hba1c >= 6.5 ? 'نطاق سكري' : patient.hba1c >= 5.7 ? 'مقدمات سكري' : 'طبيعي (<5.7)'}
              </span>
            </div>

            {/* سكر الدم الصائم */}
            <div className="p-3.5 rounded-xl bg-apple-gray border border-apple-gray-2 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-text-secondary">
                سكر الدم الصائم
              </span>
              <span className="text-xl font-bold text-apple-text mt-1">
                {patient.fastingGlucose} ملغ/ديسيلتر
              </span>
              <span className="text-[11px] text-apple-text-secondary mt-0.5">
                الهدف: 70–99 ملغ/ديسيلتر
              </span>
            </div>

            /* BMI */
            <div className="p-3.5 rounded-xl bg-apple-gray border border-apple-gray-2 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-text-secondary">
                مؤشر كتلة الجسم
              </span>
              <span className="text-xl font-bold text-apple-text mt-1">
                {patient.bmi} كغ/م²
              </span>
              <span className="text-[11px] text-apple-text-secondary mt-0.5">
                {patient.bmi >= 30 ? 'سمنة من الدرجة الأولى/الثانية' : patient.bmi >= 25 ? 'وزن زائد' : 'طبيعي'}
              </span>
            </div>

            {/* ضغط الدم */}
            <div className="p-3.5 rounded-xl bg-apple-gray border border-apple-gray-2 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-text-secondary">
                ضغط الدم
              </span>
              <span className="text-xl font-bold text-apple-text mt-1">
                {patient.bloodPressureSys}/{patient.bloodPressureDia}
              </span>
              <span className="text-[11px] text-apple-text-secondary mt-0.5">
                انقباضي / انبساطي مم زئبق
              </span>
            </div>

            {/* التاريخ العائلي */}
            <div className="p-3.5 rounded-xl bg-apple-gray border border-apple-gray-2 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-text-secondary">
                التاريخ العائلي
              </span>
              <span className="text-xl font-bold text-apple-text mt-1">
                {patient.familyHistory ? 'إيجابي' : 'لم يتم الإبلاغ عن أي شيء'}
              </span>
              <span className="text-[11px] text-apple-text-secondary mt-0.5">
                الوراثة من الدرجة الأولى
              </span>
            </div>

            {/* مستوى النشاط */}
            <div className="p-3.5 rounded-xl bg-apple-gray border border-apple-gray-2 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-text-secondary">
                النشاط البدني
              </span>
              <span className="text-xl font-bold text-apple-text capitalize mt-1">
                {arabicActivity[patient.physicalActivityLevel] ?? patient.physicalActivityLevel}
              </span>
              <span className="text-[11px] text-apple-text-secondary mt-0.5">
                تمارين قلبية/قوة أسبوعية
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. قسم الشرح SHAP Waterfall */}
      {prediction?.explanation && (
        <SHAPWaterfall
          explanation={prediction.explanation}
          finalRisk={prediction.riskScore}
        />
      )}

      {/* 4. قسم محاكي العلاج */}
      <TreatmentSimulator
        currentRisk={currentRisk}
        currentHba1c={patient.hba1c}
      />

      {/* 5. التقرير الرسمي القابل للطباعة المーダل */}
      <ClinicalReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        patient={patient}
        prediction={prediction}
      />
    </div>
  );
};
