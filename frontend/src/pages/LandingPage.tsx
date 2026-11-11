import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  Heart,
  ShieldCheck,
  Stethoscope,
  Activity,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  FileCheck,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-apple-gray text-apple-text">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 bg-gradient-to-b from-white via-white to-apple-gray">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-apple-blue text-xs font-semibold">
            <Sparkles size={14} />
            <span>نظام دعم اتخاذ القرار السريري (CDSS) • الإصدار 1.0</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-apple-text max-w-4xl leading-[1.15]">
            الكشف المبكر. إجابات واضحة.{' '}
            <span className="text-apple-blue">رعاية أفضل.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-apple-text-secondary max-w-2xl leading-relaxed">
            تقييم معتمد سريريًا لخطر مرض السكري، مدعوم بالتعلم الآلي الشفاف والقابل للتفسير — مصمم للمرضى وفرق الرعاية.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Link to="/patient" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition"
              >
                أنا مريض
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link to="/clinician" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold"
              >
                بوابة الطبيب
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-apple-text-secondary pt-8 mt-4 border-t border-apple-gray-2/70 w-full max-w-xl">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-apple-green" /> متوافق مع معايير HIPAA و GDPR
            </span>
            <span className="flex items-center gap-1.5">
              <Layers size={16} className="text-apple-blue" /> ذكاء اصطناعي شفاف باستخدام SHAP و LIME
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck size={16} className="text-apple-orange" /> معايير ADA 2024
            </span>
          </div>
        </div>
      </section>

      {/* Philosophy & Architecture Highlights */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-wider text-apple-blue">
            المبادئ الأساسية
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-apple-text mt-1">
            الوضوح يفوق الذكاء الاصطناعي
          </h2>
          <p className="text-sm text-apple-text-secondary mt-2">
            نتجنب الخوارزميات "الصندوق الأسود" والمؤثرات البصرية المبهرة. تبقى التكنولوجيا هادئة في الخلفية بينما تأخذ الأفكار السريرية مكانها المركزي.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-white border border-apple-gray-2 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-apple-blue flex items-center justify-center">
                <Heart size={24} />
              </div>
              <h3 className="text-xl font-bold text-apple-text">
                التخصص المخصص لمستوى الخطر
              </h3>
              <p className="text-sm text-apple-text-secondary leading-relaxed">
                جمع البيانات التدريجي يقيم المؤشرات الحيوية المتعددة: HbA1c، سكر الدم الصائم، مؤشر كتلة الجسم، والتاريخ العائلي دون إرباك المستخدم.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-apple-gray-2 text-xs font-semibold text-apple-blue">
              بروتوكول逐جي من 7 حقول
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-white border border-apple-gray-2 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-apple-green flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-apple-text">
                الذكاء الاصطناعي القابل للتفسير (XAI)
              </h3>
              <p className="text-sm text-apple-text-secondary leading-relaxed">
                تحلل خوارزميات SHAP و LIME كل تنبؤ إلى عوامل واضحة يمكن فهمها، مما يزيل غموض الخوارزميات في اتخاذ القرار الطبي.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-apple-gray-2 text-xs font-semibold text-apple-green">
              الشلال والنسب النصية المبسطة
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-white border border-apple-gray-2 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-apple-orange flex items-center justify-center">
                <Stethoscope size={24} />
              </div>
              <h3 className="text-xl font-bold text-apple-text">
                التكامل مع سير العمل السريري
              </h3>
              <p className="text-sm text-apple-text-secondary leading-relaxed">
                مصمم لممارسي الرعاية الصحية مع إمكانية التشغيل البيني HL7 FHIR، وبيئة محاكاة العلاج، والملخصات السريرية المؤتمتة بصيغة PDF.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-apple-gray-2 text-xs font-semibold text-apple-orange">
              رحلة سريرية في صفحة واحدة
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 bg-white border-t border-apple-gray-2 text-xs text-apple-text-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-apple-blue" />
            <span className="font-semibold text-apple-text">DPIS</span>
            <span>— نظام الذكاء للتنبؤ بمرض السكري</span>
          </div>
          <div>منصة دعم اتخاذ القرار الطبي • ليست بديلاً عن التشخيص المباشر</div>
        </div>
      </footer>
    </div>
  );
};
