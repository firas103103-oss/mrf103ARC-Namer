
import React, { useState, useEffect } from 'react';
import { Mic, Cpu, ChevronRight, Activity, Globe, Lock, Shield } from 'lucide-react';

interface AIGuidanceProps {
  onComplete: () => void;
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
}

const AIGuidance: React.FC<AIGuidanceProps> = ({ onComplete, lang, setLang }) => {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'identifying' | 'briefing' | 'ready'>('identifying');
  const [isTyping, setIsTyping] = useState(true);

  const content = {
    en: {
      identity: "IDENTITY VERIFIED. ACCESS LEVEL: SUPREME COMMAND.",
      brief: "Welcome back. I am ARC-G-711, your cognitive interface. I've initiated a Class-7 briefing session. All node telemetry from our Riyadh HQ is synced to your biometric signature.",
      instruction: "Select your preferred linguistic protocol to initialize the neural briefing link.",
      enter: "INITIALIZE BRIEFING"
    },
    ar: {
      identity: "تم التحقق من الهوية. مستوى الوصول: قيادة عليا.",
      brief: "مرحباً بعودتك. أنا ARC-G-711، واجهتك الإدراكية. بدأت جلسة إيجاز من الفئة-7. جميع بيانات القياس من مقرنا في الرياض متزامنة مع بصمتك الحيوية.",
      instruction: "اختر بروتوكول اللغة المفضل لديك لبدء رابط الإيجاز العصبي.",
      enter: "بدء الإيجاز"
    }
  };

  const t = content[lang];

  useEffect(() => {
    let fullText = "";
    if (phase === 'identifying') fullText = t.identity;
    else if (phase === 'briefing') fullText = t.brief;
    else if (phase === 'ready') fullText = t.instruction;

    let currentIndex = 0;
    setIsTyping(true);
    setText('');

    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (phase === 'identifying') {
          setTimeout(() => setPhase('briefing'), 800);
        } else if (phase === 'briefing') {
             setTimeout(() => setPhase('ready'), 1500);
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, [phase, lang, t]);

  return (
    <div className="fixed inset-0 z-50 bg-xb-black flex flex-col items-center justify-center p-6 overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20"></div>
      
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        <div className="relative w-56 h-56 mb-16 flex items-center justify-center">
          <div className="absolute inset-0 border border-xb-green/20 rounded-full animate-[spin_12s_linear_infinite]"></div>
          <div className="absolute inset-4 border border-xb-green/30 rounded-full border-t-transparent animate-[spin_6s_linear_infinite_reverse]"></div>
          <div className="absolute inset-0 rounded-full bg-xb-green/5 blur-3xl animate-pulse"></div>
          
          <div className="relative z-20 bg-xb-dark border border-xb-green/40 p-8 rounded-full shadow-[0_0_40px_rgba(0,255,65,0.2)]">
             <div className="relative">
                <Mic className="w-16 h-16 text-xb-green" />
                <div className="absolute -bottom-2 -right-2 p-1.5 bg-xb-dark border border-xb-cyan/50 rounded-full">
                  <Cpu className="w-6 h-6 text-xb-cyan animate-pulse" />
                </div>
             </div>
          </div>
        </div>

        <div className="w-full bg-xb-dark/60 border-l-4 border-xb-green p-8 mb-12 shadow-2xl backdrop-blur-md">
           <div className="flex items-center gap-3 mb-4 text-xb-green/40 font-mono text-[10px] uppercase tracking-[0.4em]">
              <Activity className="w-3 h-3" />
              <span>ARC-G-711 // COGNITIVE_VOICE_SYNC</span>
           </div>
           <p className="font-mono text-lg md:text-xl text-xb-green leading-relaxed min-h-[80px]">
             {text}
             <span className="animate-blink inline-block w-3 h-5 bg-xb-green ml-2 align-middle"></span>
           </p>
        </div>

        <div className={`transition-all duration-1000 w-full flex flex-col items-center gap-8 ${phase === 'ready' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
           <div className="flex gap-6">
              <button onClick={() => setLang('en')} className={`px-8 py-3 border font-display text-sm tracking-widest transition-all ${lang === 'en' ? 'bg-xb-green text-black border-xb-green' : 'bg-transparent text-gray-500 border-gray-800 hover:border-xb-green/50 hover:text-xb-green'}`}>ENGLISH</button>
              <button onClick={() => setLang('ar')} className={`px-8 py-3 border font-display text-sm tracking-widest transition-all ${lang === 'ar' ? 'bg-xb-green text-black border-xb-green' : 'bg-transparent text-gray-500 border-gray-800 hover:border-xb-green/50 hover:text-xb-green'}`}>العربية</button>
           </div>

           <button onClick={onComplete} className="group relative px-12 py-5 bg-xb-green/5 border border-xb-green/30 hover:border-xb-green transition-all">
             <div className="flex items-center gap-4 relative z-10">
                <span className="font-display font-black text-xb-green tracking-[0.3em] text-xl">{t.enter}</span>
                <ChevronRight className="w-6 h-6 text-xb-green group-hover:translate-x-2 transition-transform" />
             </div>
           </button>
        </div>

        <div className="absolute -bottom-24 font-tech text-[10px] text-gray-700 tracking-[0.5em] flex items-center gap-3">
            <Shield className="w-4 h-4" />
            SECURE LINK ESTABLISHED FROM HQ RIYADH
        </div>
      </div>
    </div>
  );
};

export default AIGuidance;
