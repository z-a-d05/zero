import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot, ChevronRight } from 'lucide-react';
import { PredictionResult, ChatMessage } from '../../types';

interface ChatbotProps {
  prediction?: PredictionResult | null;
}

export const Chatbot: React.FC<ChatbotProps> = ({ prediction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'مرحباً! أنا مساعدك الصحي من DPIS. يمكنني المساعدة في تفسير تقييم المخاطر لديك، وشرح مؤشرات مختبرك، أو اقتراح خطوات نمط حياة قائمة على الأدلة. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const suggestedQuestions = [
    'ما معنى درجة خطوري؟',
    'أي عامل زاد خطوري أكثر؟',
    'ما التغييرات في نمط الحياة التي يجب أن أبدأ بها اليوم؟',
    'متى يجب أن أزور الطبيب؟',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue('');

    // توليد رد ذكي قائم على الأدلة السريرية
    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();
      const riskLevel = prediction?.riskLevel || 'medium';
      const topFactor = prediction?.explanation?.topFactors?.[0] || 'مستوى HbA1c';

      if (lower.includes('mean') || lower.includes('score') || lower.includes('معنى') || lower.includes('درجة')) {
        reply = `درجة خطورك مصنفة كـ ${riskLevel}. هذا يعني أنه بناءً على مدخلاتك السريرية، فإن احتمال إصابتك بمرض السكري من النوع الثاني خلال السنوات الخمس القادمة مقدر بواسطة نموذجنا. من الناحية السريرية، فإن التدخل المبكر في هذه المرحلة فعال للغاية في تطبيع المعايير الأيضية.`;
      } else if (lower.includes('factor') || lower.includes('increase') || lower.includes('why') || lower.includes('عامل') || lower.includes('زادت') || lower.includes('لماذا')) {
        reply = `بناءً على تحليل الإسناد SHAP لدينا، فإن عامل الخطر الأساسي لديك هو ${topFactor}. تساهم المستويات المرتفعة بشكل أقوى في مقاومة الأنسولين الجهازية. العوامل الثانوية تشمل مؤشر كتلة الجسم وأنماط النشاط البدني.`;
      } else if (lower.includes('lifestyle') || lower.includes('reduce') || lower.includes('change') || lower.includes('نمط الحياة') || lower.includes('تقليل') || lower.includes('تغيير')) {
        reply =
          'تظهر التجارب السريرية أن التدخلات المعتدلة في نمط الحياة يمكن أن تقلل خطر التقدم بنسبة تصل إلى 58%. الخطوات الأكثر تأثيراً هي: 1) الهدف من 150 دقيقة من التمارين الهوائية أسبوعياً، 2) التركيز على أطعمة نظام غذائي متوسطي غني بالألياف، و3) هدف تقليل تدريجي في وزن الجسم بنسبة 5–7%.';
      } else if (lower.includes('doctor') || lower.includes('physician') || lower.includes('when') || lower.includes('طبيب') || lower.includes('متى')) {
        if (riskLevel === 'high') {
          reply =
            'نظرًا لأن مستوى خطورك مرتفع، فإننا نوصي بشدة بتحديد موعد مع مقدم الرعاية الأولية لديك خلال 2 إلى 4 أسابيع لإجراء اختبارات تشخيصية رسمية (مثل فحص HbA1c المتكرر أو اختبار تحمل الجلوكوز الفموي).';
        } else {
          reply =
            'بالنسبة لملف خطورك الحالي، فإن مناقشة هذه النتائج خلال زيارتك الدورية التالية أو خلال الأشهر الثلاثة القادمة أمر مناسب. استمر في مراقبة عاداتك الغذائية ونشاطك البدني.';
        }
      } else {
        reply = `شكراً لسؤالك. بناءً على ملفك الصحي، فإن الحفاظ على نشاط بدني منتظم ومراقبة load السكر في الدم الغذائي سيساعد في الحفاظ على مؤشراتك مستقرة. لا تتردد في السؤال أكثر عن أرقام المختبرات الخاصة بك أو استخدم محاكي "ماذا لو" على البوابة!`;
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* زر المشغل العائم */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-apple-blue text-white shadow-lg shadow-blue-500/25 flex items-center justify-center hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-apple-blue/20"
          aria-label="فتح مساعد الذكاء الاصطناعي الصحي"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* نافذة الدردشة */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-3xl shadow-2xl border border-apple-gray-2 flex flex-col overflow-hidden animate-slide-up">
          {/* الرأس */}
          <div className="p-4 bg-white border-b border-apple-gray-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-apple-blue flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-apple-text">مساعد DPIS السريري</span>
                <span className="text-[10px] text-apple-green font-semibold">● متصل • ذكاء اصطناعي قابل للتفسير</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-apple-text-secondary hover:text-apple-text hover:bg-apple-gray transition"
              aria-label="إغلاق المساعد"
            >
              <X size={18} />
            </button>
          </div>

          {/* جسم الرسائل */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-apple-gray/40">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                      isUser ? 'bg-apple-blue text-white' : 'bg-white text-apple-text border border-apple-gray-2'
                    }`}
                  >
                    {isUser ? <User size={13} /> : <Bot size={13} />}
                  </div>
                  <div
                    className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                      isUser
                        ? 'bg-apple-blue text-white rounded-tr-xs'
                        : 'bg-white text-apple-text border border-apple-gray-2 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* أسئلة سريعة مقترحة */}
          <div className="px-3 py-2 bg-white border-t border-apple-gray-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-apple-gray hover:bg-blue-50 hover:text-apple-blue text-[11px] font-medium text-apple-text-secondary border border-apple-gray-2 transition flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* تذييل الإدخال */}
          <div className="p-3 bg-white border-t border-apple-gray-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="اسأل عن مؤشراتك الصحية..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-apple-gray rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2 rounded-xl bg-apple-blue text-white disabled:opacity-40 transition"
              >
                <Send size={15} />
              </button>
            </form>
            <div className="text-[10px] text-center text-apple-text-secondary mt-1.5">
              بواسطة محرك القابلية للتفسير السريري DPIS
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
