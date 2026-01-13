import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Binary, Eye } from 'lucide-react';

interface TerminalLoaderProps {
  onComplete: () => void;
  lang: 'en' | 'ar';
}

const TerminalLoader: React.FC<TerminalLoaderProps> = ({ onComplete, lang }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const bootSequenceEn = [
    "Initializing X-BIO Core...",
    "Connecting to Riyadh Secure Server (SAIP-Reg)...",
    "Verifying HSHC-05 Circuit Integrity...",
    "Loading EFII-22 Metaphysical Drivers...",
    "Syncing with ARC-G-711 Neural Net...",
    "Checking Biometric Signatures...",
    "Access Granted: Class-7 Node Active."
  ];

  const bootSequenceAr = [
    "جاري تهيئة نواة X-BIO...",
    "الاتصال بالخادم الآمن في الرياض...",
    "التحقق من سلامة دائرة الاستشفاء الذاتي HSHC-05...",
    "تحميل برمجيات الرصد الماورائي EFII-22...",
    "المزامنة مع الشبكة العصبية ARC-G-711...",
    "فحص البصمة الحيوية...",
    "تم منح الوصول: العقدة من الفئة-7 نشطة."
  ];

  const sequence = lang === 'en' ? bootSequenceEn : bootSequenceAr;

  useEffect(() => {
    let currentLogIndex = 0;
    
    // Increased speed: 600ms -> 250ms for lower perceived latency
    const interval = setInterval(() => {
      if (currentLogIndex < sequence.length) {
        setLogs(prev => [...prev, sequence[currentLogIndex]]);
        setProgress(((currentLogIndex + 1) / sequence.length) * 100);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 500); // Reduced delay before completion
      }
    }, 250);

    return () => clearInterval(interval);
  }, [lang, onComplete, sequence]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-mono text-xb-green p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg border border-xb-green/30 bg-xb-dark/90 p-6 rounded relative overflow-hidden shadow-[0_0_30px_rgba(0,255,65,0.2)]">
        {/* Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-xb-green/50 animate-scanline opacity-50"></div>
        
        <div className="flex items-center justify-between mb-6 border-b border-xb-green/20 pb-2">
          <h1 className="text-xl font-bold font-display tracking-widest">X-BIO SENTINEL</h1>
          <Lock className="w-5 h-5 animate-pulse" />
        </div>

        <div className="space-y-2 mb-6 h-48 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="flex items-center gap-2">
               <span className="text-xb-green/50">{`>`}</span>
               <span className="typing-effect">{log}</span>
            </div>
          ))}
          <div className="animate-blink">_</div>
        </div>

        <div className="w-full bg-xb-gray h-1 rounded overflow-hidden">
          <div 
            className="h-full bg-xb-green transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-xb-green/40 mt-2 font-tech uppercase">
          <span>{lang === 'en' ? 'System: Online' : 'النظام: متصل'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="mt-8 flex gap-4 opacity-50">
        <ShieldCheck className="w-6 h-6 text-xb-green" />
        <Binary className="w-6 h-6 text-xb-cyan" />
        <Eye className="w-6 h-6 text-xb-red" />
      </div>
    </div>
  );
};

export default TerminalLoader;