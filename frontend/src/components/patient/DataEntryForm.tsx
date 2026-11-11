import React, { useState, useId } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Slider } from '../ui/Slider';
import { PatientInput, ActivityLevel, Gender } from '../../types';
import { Activity, Heart, Scale, Flame, Users, Sparkles } from 'lucide-react';

interface DataEntryFormProps {
  onSubmit: (data: PatientInput) => Promise<void>;
  isLoading?: boolean;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({ onSubmit, isLoading }) => {
  const formId = useId();
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<Gender>('female');
  const [weightKg, setWeightKg] = useState<number>(72);
  const [heightCm, setHeightCm] = useState<number>(168);
  const [hba1c, setHba1c] = useState<number>(5.8);
  const [fastingGlucose, setFastingGlucose] = useState<number>(104);
  const [familyHistory, setFamilyHistory] = useState<boolean>(true);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('medium');
  const [smokingStatus, setSmokingStatus] = useState<boolean>(false);

  // حساب BMI المباشر: الوزن / (الطول/100)^2
  const heightInMeters = heightCm / 100;
  const bmi = heightInMeters > 0 ? parseFloat((weightKg / (heightInMeters * heightInMeters)).toFixed(1)) : 22.0;

  let bmiCategory = 'وزن طبيعي';
  let bmiColor = 'text-apple-green';
  if (bmi >= 30) {
    bmiCategory = 'نطاق السمنة';
    bmiColor = 'text-apple-red';
  } else if (bmi >= 25) {
    bmiCategory = 'نطاق وزن زائد';
    bmiColor = 'text-apple-orange';
  } else if (bmi < 18.5) {
    bmiCategory = 'نقص وزن';
    bmiColor = 'text-apple-orange';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      age,
      gender,
      weightKg,
      heightCm,
      bmi,
      hba1c,
      fastingGlucose,
      familyHistory,
      physicalActivityLevel: activityLevel,
      smokingStatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* رأس مقدمة */}
      <div className="text-center flex flex-col items-center gap-2 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-apple-blue flex items-center justify-center mb-1">
          <Heart size={24} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-apple-text">
          تقييم الصحة
        </h2>
        <p className="text-sm text-apple-text-secondary max-w-md">
          يرجى تزويدنا بمؤشراتك السريرية ونمط الحياة الحالية. نستخدم الذكاء الاصطناعي القابل للتفسير لحساب ملف خطورك.
        </p>
      </div>

      {/* بطاقات تقدم */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. بطاقة العمر والجنس */}
        <Card title="البيانات الديموغرافية" className="flex flex-col gap-4">
          <Input
            id={`${formId}-age`}
            label="العمر (سنوات)"
            type="number"
            min={18}
            max={100}
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value) || 18)}
            required
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-apple-text">الجنس البيولوجي</label>
            <div className="grid grid-cols-2 gap-2 bg-apple-gray p-1 rounded-xl">
              {(['female', 'male'] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 text-sm font-medium rounded-lg capitalize transition ${
                    gender === g
                      ? 'bg-white text-apple-text shadow-sm'
                      : 'text-apple-text-secondary hover:text-apple-text'
                  }`}
                >
                  {g === 'female' ? 'أنثى' : 'ذكر'}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* 2. الوزن، الطول وBMI مباشر */}
        <Card title="تركيبة الجسم" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              id={`${formId}-weight`}
              label="الوزن (كغ)"
              type="number"
              min={35}
              max={250}
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 50)}
              required
            />
            <Input
              id={`${formId}-height`}
              label="الطول (سم)"
              type="number"
              min={120}
              max={220}
              value={heightCm}
              onChange={(e) => setHeightCm(parseFloat(e.target.value) || 150)}
              required
            />
          </div>

          <div className="bg-apple-gray p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale size={18} className="text-apple-text-secondary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-apple-text-secondary">
                BMI محسوب
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-apple-text">{bmi}</span>
              <span className={`text-xs font-medium ${bmiColor}`}>(${bmiCategory})</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. المؤشرات الحيوية / قيم المختبر */}
      <Card title="المؤشرات المختبرية" className="flex flex-col gap-6">
        <Slider
          label="الهيموغلوبين السكري (HbA1c)"
          value={hba1c}
          min={4.0}
          max={12.0}
          step={0.1}
          unit="%"
          onChange={setHba1c}
          helperText="طبيعي: <5.7% | مقدمات سكري: 5.7–6.4% | سكري: ≥6.5%"
        />

        <Slider
          label="سكر الدم الصائم"
          value={fastingGlucose}
          min={70}
          max={280}
          step={1}
          unit="ملغ/ديسيلتر"
          onChange={setFastingGlucose}
          helperText="طبيعي: <100 | معطل: 100–125 | مرتفع: ≥126 ملغ/ديسيلتر"
        />
      </Card>

      {/* 4. التاريخ والنمط الحياتي */}
      <Card title="التاريخ والنمط الحياتي" className="flex flex-col gap-5">
        <div className="flex justify-between items-center py-2 border-b border-apple-gray-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-apple-text flex items-center gap-2">
              <Users size={16} className="text-apple-blue" /> تاريخ عائلي لمرض السكري
            </span>
            <span className="text-xs text-apple-text-secondary">
              قريب من الدرجة الأولى (والد أو أخ) تم تشخيصه بمرض السكري
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFamilyHistory(!familyHistory)}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${
              familyHistory ? 'bg-apple-blue' : 'bg-apple-gray-3'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                familyHistory ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* مقطع النشاط البدني */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-apple-text flex items-center gap-2">
            <Flame size={16} className="text-apple-orange" /> مستوى النشاط البدني
          </label>
          <div className="grid grid-cols-3 gap-2 bg-apple-gray p-1.5 rounded-xl">
            {(['low', 'medium', 'high'] as ActivityLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setActivityLevel(level)}
                className={`py-2 text-xs font-semibold rounded-lg capitalize transition ${
                  activityLevel === level
                    ? 'bg-white text-apple-text shadow-sm'
                    : 'text-apple-text-secondary hover:text-apple-text'
                }`}
              >
                {level === 'low' ? 'منخفض (<30د/أسبوع)' : level === 'medium' ? 'متوسط (1-2س/أسبوع)' : 'عالٍ (>3س/أسبوع)'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* زر الإرسال */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full text-base font-semibold py-3.5 shadow-md shadow-blue-500/10 hover:shadow-lg transition"
      >
        <Sparkles size={18} className="mr-1.5" />
        تحليل المؤشرات الصحية
      </Button>
    </form>
  );
};
