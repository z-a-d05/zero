import React, { useState } from 'react';
import { PredictionResult } from '../../types';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import {
  Apple,
  Dumbbell,
  Stethoscope,
  CheckCircle2,
  ChevronRight,
  Flame,
  Check,
  Calendar,
  AlertTriangle,
  Award,
  BookOpen,
} from 'lucide-react';

interface RecommendationsProps {
  prediction: PredictionResult;
}

interface ProtocolDetails {
  id: string;
  category: string;
  icon: React.ElementType;
  title: string;
  tagline: string;
  badge: string;
  evidenceBase: string;
  clinicalObjectives: string[];
  actionSteps: { title: string; desc: string; frequency: string }[];
  sampleSchedule: string[];
  medicalAlert?: string;
}

const ACCREDITED_PROTOCOLS: Record<string, ProtocolDetails> = {
  activity: {
    id: 'activity',
    category: 'بروتوكول التمارين وعلم الحركة',
    icon: Dumbbell,
    title: 'إرشادات ACSM و ADA للأنظمة الرياضية المنظمة',
    tagline: 'وصف تمارين مزدوج المسار هوائي ومقاومة هيكلي',
    badge: 'دليل ADA 2024 من الدرجة أ',
    evidenceBase:
      'مدعوم من تجربة تجربة منع مرض السكري (DPP) السريرية العشوائية، المثبتة أن 150 دقيقة/أسبوع من النشاط المنظم تقلل التقدم نحو مرض السكري بنسبة 58%.',
    clinicalObjectives: [
      'تحفيز translocation لناقل الجلوكوز من النوع 4 (GLUT-4) غير المعتمد على الأنسولين مباشرة إلى أنسجة العضلات الهيكلية.',
      'تعزيز الفسفرة الأكسدة الميتوكوندرية وحساسية الأنسولين المحيطية.',
      'تخفيف زيادات الجلوكوز بعد الوجبات عبر استنفاد الجليكوجين العضلي النشط.',
    ],
    actionSteps: [
      {
        title: 'تمارين هوائية معتدلة من المنطقة 2',
        desc: 'مشي سريع (5.0–6.0 كم/ساعة)، دراجات ثابتة، أو سباحة بمعدل 60–70% من الحد الأقصى لمعدل ضربات القلب.',
        frequency: '150 إلى 300 دقيقة أسبوعيًا (مثلاً، 30–45 دقيقة على 5 أيام)',
      },
      {
        title: 'تدريب مقاومة هيكلي تدريجي',
        desc: 'حركات مقاومة متعددة المفاصل (القرفصاء بالوزن الجسدي، تمارين ضغط الساق، الاندفاع، وشريط المقاومة). كتلة العضلات هي المصرف الأساسي للجلوكوز المتداول.',
        frequency: '2 إلى 3 أيام غير متتالية أسبوعيًا (2–3 مجموعات من 10–12 تكرار)',
      },
      {
        title: 'مشي 10 دقائق بعد الوجبة',
        desc: 'مشي خفيف يبدأ خلال 20–30 دقيقة بعد الوجبات الرئيسية التي تحتوي على الكربوهيدرات لتقليل ذروات الجلوكوز بنسبة تصل إلى 22%.',
        frequency: 'يومياً بعد الغداء والعشاء',
      },
      {
        title: 'مقاطعة الوقت المستقر',
        desc: 'مقاطعة الجلوس الطويل على المكتب كل 30 دقيقة بدقيقتين من الوقوف، أو رفع العجل، أو تحريك الجذع.',
        frequency: 'خلال ساعات العمل',
      },
    ],
    sampleSchedule: [
      'الاثنين: 35 دقيقة مشي سريع (المنطقة 2) + 10 دقائق نزهة بعد العشاء',
      'الثلاثاء: 30 دقيقة تمرين مقاومة للجسم بالكامل باستخدام شرائط المقاومة',
      'الأربعاء: 40 دقيقة دراجات أو سباحة (المنطقة 2)',
      'الخميس: راحة أو حركة نشطة / يوغا',
      'الجمعة: 30 دقيقة مقاومة الجزء السفلي من الجسم (القرفصاء، الاندفاع، رفع العجل)',
      'السبت: 45 دقيقة مشي خارجي / نزهة خفيفة مع العائلة',
      'الأحد: تعافي نشط وتمارين إطالة',
    ],
    medicalAlert:
      'إذا كنت تعاني من ارتفاع ضغط الدم غير المنضبط (ضغط الدم > 160/100) أو اعتلال الشبكية، تجنب مناورات فالسالفا الثقيلة واستشر طبيبك قبل رفع الأوزان الحرة الثقيلة.',
  },
  nutrition: {
    id: 'nutrition',
    category: 'العلاج الغذائي الطبي (MNT)',
    icon: Apple,
    title: 'بنية النظام الغذائي المتوسطي منخفض نسبة السكر في الدم',
    tagline: 'تسلسل المغذيات الدقيقة المعتمد علميًا وتقليل الحمل السكري',
    badge: 'توافق التغذية السريرية 2024',
    evidenceBase:
      'موثق من تجارب PREDIMED و Look AHEAD السريرية التي أثبتت حماية قلبية أيضية مستمرة وتقليلًا كبيرًا في HbA1c (-0.5% إلى -1.0%).',
    clinicalObjectives: [
      'إزالة الزيادات السريعة في السكر في الدم وفرط أنسولين الدم التعويضي المقابل.',
      'زيادة إنتاج الأحماض الدهنية قصيرة السلسلة (SCFA) في ميكروبيوم الأمعاء من خلال الألياف اللزجة الذائبة.',
      'استمرار الشعور بالشبع وحفظ كتلة العضلات النحيلة خلال فقدان الوزن التدريجي.',
    ],
    actionSteps: [
      {
        title: 'الاستبدال الصارم لمؤشر نسبة السكر في الدم (GI)',
        desc: 'إزالة الكربوهيدرات عالية GI (الدقيق الأبيض، الأرز الأبيض، رقائق البطاطس، الشوفان الفوري) واستبدالها بمكافئات منخفضة GI معقدة (الشوفان المقطع، الكينوا، العدس، الحمص، البرغل).',
        frequency: 'جميع الوجبات اليومية',
      },
      {
        title: 'هدف الألياف اللزجة الذائبة (30–35 غرام/يوم)',
        desc: 'ادخل قشر السيليوم، بذور الشيا، بذ الكتان المطحون، والخضروات الصليبية. الألياف اللزجة تشكل هلامًا في الأمعاء الدقيقة يؤخر امتصاص الكربوهيدرات.',
        frequency: 'يوميًا عبر الإفطار والغداء',
      },
      {
        title: 'استراتيجية ترتيب الوجبات ("الخضروات والبروتين أولاً")',
        desc: 'تناول السلطات غير النشوية ومصادر البروتين قبل النشويات/الكربوهيدرات في كل وجبة. التحقق السريري أن هذا التسلسل يبطئ إفراغ المعدة ويخفض زيادات الجلوكوز بعد الوجبة بنسبة 35%.',
        frequency: 'الغداء والعشاء',
      },
      {
        title: 'إزالة السكر السائل المطلق',
        desc: 'عدم تحمل للمشروبات الغازية العادية، عصائر الفواكه المعبأة، الشاي المحلى، والمثبطات التجارية.',
        frequency: 'مستمر',
      },
    ],
    sampleSchedule: [
      'الإفطار: بيضتان مسلوقتان + نصف أفوكادو + سبانخ مقلية + شريحة واحدة من خبز الجاودار الكثيف 100% / المنبت',
      'وجبة خفيفة في منتصف النهار: 30 غرام من الجوز الخام أو اللوز + 1 كوب زبادي يوناني غير محلى مع القرفة',
      'الغداء: سمك السلمون المشوي أو التوفو + سلطة بحرية كبيرة (زيت زيتون وعصير ليمون) + نصف كوب عدس مطبوخ',
      'العشاء: صدر دجاج مشوي + برוקلي مطبوخ بالبخار مع زيت زيتون زائد البكر + ثلث كوب كينوا مطبوخ',
      'الترطيب: 2.5 إلى 3.0 لتر من الماء / الشاي الأخضر يوميًا',
    ],
    medicalAlert:
      'يجب على المرضى الذين يتناولون مثبطات SGLT2 أو سلفونيل يوريا استشارة أخصائي الغدد الصماء قبل الشروع في الصيام المتقطع الصارم لمنع نقص سكر الدم أو الحماض الكيتوني.',
  },
  clinical: {
    id: 'clinical',
    category: 'بروتوكول المراقبة السريرية',
    icon: Stethoscope,
    title: 'تقييم التشخيص والمراقبة الدوائية',
    tagline: 'التشخيص الفحوصات القياسية الموجهة من قبل الطبيب',
    badge: 'معايير ADA الطبية للرعاية',
    evidenceBase:
      'تلتزم بالتوصيات الرسمية لممارسة الرعاية السريرية للجمعية الأمريكية لمرض السكري (ADA) وجمعية الغدد الصماء لمنع مرض السكري والخلو منه.',
    clinicalObjectives: [
      'تأكيد التشخيص السريري باستخدام القياسات المختبرية الوريدية بدلاً من فحص الأصابع الشعري.',
      'فحص الأمراض المصاحبة القلبية الأيضية (خطر تصلب الشرايين، خلل الدهون، كبد دهني).',
      'إنشاء خط أساس علاجي رسمي لاعتبار العلاج الدوائي الوقائي.',
    ],
    actionSteps: [
      {
        title: 'فحص الهيموغلوبين السكري الوريدي (HbA1c)',
        desc: 'فحص مختبري معتمد لتقييم متوسطisierten الغليكوزيلين للخلايا الحمراء على مدى 90 يومًا. النطاقات المرجعية: طبيعي <5.7%، مقدمات السكري 5.7–6.4%، تشخيص السكري ≥6.5%.',
        frequency: 'كرر كل 3 أشهر إذا كان مقدمات السكري؛ كل 6–12 شهرًا إذا كان منخفض الخطر',
      },
      {
        title: 'اختبار تحمل الجلوكوز الفموي لمدة ساعتين (75غ OGTT)',
        desc: 'يقيس سكر الدم الصائم seguito بسحب الدم بعد ساعتين من تناول حمل جلوكوز معياري 75غ. يكشف عن تحمل الجلوكوز الضعيف الخفي الذي يفوته اختبار الصيام وحده.',
        frequency: 'خلال 30–60 يومًا بناءً على توصية الطبيب',
      },
      {
        title: 'مصفوفة المخاطر القلبية الكلوية',
        desc: 'فحص دهون صائم مع نسبة ثلاثي الغليسيريد/HDL (مثالي < 2.0)، بروتين ب apolipoprotein B (ApoB)، ونسبة الألبومين إلى الكرياتين في البول العشوائي (uACR).',
        frequency: 'فحص أساس سنوي',
      },
      {
        title: 'تقييم العلاج الدوائي الوقائي (متروفمين)',
        desc: 'وفقًا لمعايير ADA، فكر في بدء متروفمين المبكر في المرضى الذين تتراوح أعمارهم بين 25–59 عامًا مع BMI ≥35 كغ/م²، أو سكر الدم الصائم ≥110 ملغ/ديسيلتر، أو تاريخ من سكري الحمل.',
        frequency: 'ناقش في زيارة المتابعة في الرعاية الأولية',
      },
    ],
    sampleSchedule: [
      'الأسبوع 1: حدد موعدًا مع طبيب الرعاية الأولية أو أخصائي الغدد الصماء',
      'الأسبوع 2: اكتمل فحوصات الدم المختبرية (سكر صائم، HbA1c، لوحة التمثيل الغذائي الشاملة)',
      'الأسبوع 3: راجع نتائج المختبر التشخيصية وأنشئ مقاييس الهدف المخصصة',
      'الأسبوع 4: ابدأ نظام العلاج الغذائي والتمارين الرياضية الحركية',
      'الشهر 3: كرر HbA1c لتقييم المسار الأيضي المبكر واستجابة الدواء',
    ],
    medicalAlert:
      'يجب العناية الطبية الفورية إذا واجهت فقدان وزن سريع غير متوقع، أو العطش المفرط، أو التبول الليلي المتكرر.',
  },
};

export const Recommendations: React.FC<RecommendationsProps> = ({ prediction }) => {
  const { riskLevel, recommendations } = prediction;
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (itemKey: string) => {
    setCompletedItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const activeProtocol = selectedProtocolId ? ACCREDITED_PROTOCOLS[selectedProtocolId] : null;

  const guidanceItems = [
    {
      id: 'activity',
      category: 'بروتوكول النشاط البدني',
      icon: Dumbbell,
      color: 'text-apple-orange bg-orange-50 border-orange-100',
      title: 'نظام ACSM و ADA الرياضي',
      description:
        'تدريب هوائي من المنطقة 2 بمعدل 150 دقيقة/أسبوع مع جلستين مقاومة تدريجية لدفع امتصاص الجلوكوز عبر GLUT-4.',
      duration: '150–300 دقيقة/أسبوع',
      grade: 'دليل من الدرجة أ',
    },
    {
      id: 'nutrition',
      category: 'بنية التغذية',
      icon: Apple,
      color: 'text-apple-green bg-green-50 border-green-100',
      title: 'نظام غذائي متوسطي منخفض نسبة السكر في الدم',
      description:
        'تسلسل المغذيات الدقيقة، وحمل الألياف اللزجة الذائبة (35 غرام/يوم)، وإزالة مطلقة للسكر السائل لتسطيح زيادات الجلوكوز.',
      duration: 'عادة يومية',
      grade: 'تجربة PREDIMED',
    },
    {
      id: 'clinical',
      category: 'المراقبة السريرية',
      icon: Stethoscope,
      color: 'text-apple-blue bg-blue-50 border-blue-100',
      title: riskLevel === 'high' ? 'لوحة الرعاية الأولية التشخيصية' : 'فحص سكري وقائي',
      description:
        riskLevel === 'high'
          ? 'اختبار تحمل الجلوكوز الفموي التأكيدي (OGTT)، ولوحة قلبية أيضية، وبدء محتمل لمتروفمين الوقائي.'
          : 'تقييم HbA1c دوريًا ولوحة دهون وفقًا للفواصل الزمنية القياسية لـ ADA.',
      duration: riskLevel === 'high' ? 'خلال 2–4 أسابيع' : 'خلال 3–6 أشهر',
      grade: 'معايير ADA 2024',
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-apple-green" />
          <span className="text-xs font-bold uppercase tracking-wider text-apple-green">
            مصفوفة التدخل المعتمد على الأدلة
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-apple-text">
          البروتوكولات السريرية القابلة للتنفيذ
        </h2>
        <p className="text-sm text-apple-text-secondary">
          انقر على أي بطاقة بروتوكول لمراجعة التمارين السريرية المنظمة، وخطط الوجبات، وجداول الفحوصات المعتمدة.
        </p>
      </div>

      {/* Bandeja التنبيه الأساسية للتوصية */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50/70 via-white to-green-50/50 border border-blue-100 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-apple-blue text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Award size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-apple-text">
              التدخلات المستهدفة يمكن أن تخفض معدل حدوث مرض السكري بنسبة 58%
            </span>
            <span className="text-xs text-apple-text-secondary">
              وفقًا لتجربة منع مرض السكري (DPP) التاريخية المنشورة في مجلة نيو إنجلاند للطب.
            </span>
          </div>
        </div>
      </div>

      {/* شبكة بطاقات الإرشاد */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {guidanceItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              className="p-6 flex flex-col justify-between h-full bg-white border-apple-gray-2 hover:border-apple-blue/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => setSelectedProtocolId(item.id)}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${item.color}`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-apple-blue bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {item.grade}
                  </span>
                </div>

                <span className="text-[11px] uppercase tracking-wider font-bold text-apple-text-secondary mt-1">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-apple-text group-hover:text-apple-blue transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-apple-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-5 border-t border-apple-gray-2 flex flex-col gap-3">
                <span className="text-[11px] font-semibold text-apple-text-secondary flex items-center gap-1">
                  <Calendar size={13} /> {item.duration}
                </span>
                <span className="text-xs font-bold text-apple-blue inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  استكشاف البروتوكول الكامل <ChevronRight size={15} />
                </span>
                <div className="mt-3 h-1.5 bg-apple-gray rounded-full overflow-hidden">
                  <div
                    className="h-full bg-apple-green rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        (Object.keys(completedItems).filter((k) => k.startsWith(item.id) && completedItems[k]).length /
                          ACCREDITED_PROTOCOLS[item.id]?.actionSteps.length) *
                        100
                      )}%`
                    }}
                  />
                </div>
                <span className="text-[10px] text-apple-text-secondary text-right mt-0.5">
                  {Object.keys(completedItems).filter((k) => k.startsWith(item.id) && completedItems[k]).length} / {ACCREDITED_PROTOCOLS[item.id]?.actionSteps.length || 0} مكتمل
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* التوصيات الشخصية من نموذج الذكاء الاصطناعي */}
      {recommendations && recommendations.length > 0 && (
        <Card title="ملاحظات الإجراءات المخصصة للعلامات الحيوية" className="p-6 bg-white">
          <ul className="space-y-3">
            {recommendations.map((rec, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-apple-gray/60 border border-apple-gray-2 text-xs sm:text-sm text-apple-text"
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 text-apple-blue flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                  {i + 1}
                </div>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* الدليل السريري المفصل المーダل */}
      {activeProtocol && (
        <Modal
          isOpen={!!activeProtocol}
          onClose={() => setSelectedProtocolId(null)}
          title={activeProtocol.title}
          size="3xl"
        >
          <div className="flex flex-col gap-6">
            {/* رأس التقدم */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-apple-gray-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-apple-blue">
                    {activeProtocol.category}
                  </span>
                </div>
                <div className="hidden sm:block w-48">
                  <div className="h-2 bg-apple-gray rounded-full overflow-hidden">
                    <div
                      className="h-full bg-apple-green rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round(
                          (Object.keys(completedItems).filter((k) => k.startsWith(activeProtocol.id) && completedItems[k]).length /
                            activeProtocol.actionSteps.length) *
                          100
                        )}%`
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-apple-text-secondary mt-0.5">
                    {Object.keys(completedItems).filter((k) => k.startsWith(activeProtocol.id) && completedItems[k]).length} / {activeProtocol.actionSteps.length} خطوة مكتملة
                  </span>
                </div>
              </div>
              <span className="self-start sm:self-auto text-xs font-bold text-apple-green bg-green-50 border border-green-200 px-3 py-1 rounded-xl">
                {activeProtocol.badge}
              </span>
            </div>

            {/* الشعار التوضيحي */}
            <div className="pb-2 border-b border-apple-gray-2">
              <p className="text-sm font-semibold text-apple-text">
                {activeProtocol.tagline}
              </p>
            </div>

            {/* صندوق الأساس العلمي */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
              <BookOpen size={20} className="text-apple-blue flex-shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-apple-blue uppercase tracking-wider">
                  الأساس العلمي السريري
                </span>
                <p className="text-xs text-apple-text leading-relaxed mt-0.5">
                  {activeProtocol.evidenceBase}
                </p>
              </div>
            </div>

            {/* الأهداف السريرية */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-apple-text-secondary">
                الأهداف الأيضية الفسيولوجية
              </h4>
              <ul className="space-y-2">
                {activeProtocol.clinicalObjectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-apple-text">
                    <CheckCircle2 size={15} className="text-apple-green flex-shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* خطوات الإجراء مع صناديق الاختيار */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-apple-text-secondary">
                خطوات الإجراء والوصفة الأسبوعية
              </h4>
              <div className="space-y-3">
                {activeProtocol.actionSteps.map((step, idx) => {
                  const itemKey = `${activeProtocol.id}-${idx}`;
                  const isChecked = !!completedItems[itemKey];

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(itemKey)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                        isChecked
                          ? 'bg-green-50/40 border-green-200'
                          : 'bg-white border-apple-gray-2 hover:border-apple-blue/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 flex-shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-apple-green border-apple-green text-white'
                              : 'border-apple-gray-3 bg-white'
                          }`}
                        >
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-bold ${
                              isChecked ? 'text-apple-green line-through' : 'text-apple-text'
                            }`}
                          >
                            {step.title}
                          </span>
                          <span className="text-xs text-apple-text-secondary mt-1 leading-relaxed">
                            {step.desc}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-apple-blue bg-blue-50 px-2.5 py-1 rounded-lg flex-shrink-0 whitespace-nowrap">
                        {step.frequency}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* الجدول الزمني النموذمي المنظم */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-apple-gray border border-apple-gray-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-apple-text">
                مخطط التنفيذ الأسبوعي
              </h4>
              <div className="space-y-1.5 mt-1">
                {activeProtocol.sampleSchedule.map((line, idx) => (
                  <div key={idx} className="flex items-baseline gap-2 text-xs text-apple-text">
                    <span className="w-1.5 h-1.5 rounded-full bg-apple-blue flex-shrink-0" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* تنبيه طبي تحذيري */}
            {activeProtocol.medicalAlert && (
              <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200 flex items-start gap-2.5 text-xs text-orange-950">
                <AlertTriangle size={16} className="text-apple-orange flex-shrink-0 mt-0.5" />
                <span>
                  <strong>إشعار طبي:</strong> {activeProtocol.medicalAlert}
                </span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
