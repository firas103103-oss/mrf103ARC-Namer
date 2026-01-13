import React from 'react';
import { ChatStep, BookMetadata } from '../types';

interface ResumePromptProps {
  savedData: { 
    step: ChatStep; 
    metadata: Partial<BookMetadata>;
  };
  onResume: () => void;
  onStartNew: () => void;
  language: 'ar' | 'en' | 'de';
}

export function ResumePrompt({ 
  savedData, 
  onResume, 
  onStartNew,
  language
}: ResumePromptProps) {
  const translations = {
    ar: {
      title: 'جلسة سابقة محفوظة',
      message: 'وجدنا جلسة سابقة لم تكتمل. هل تريد المتابعة من حيث توقفت؟',
      resume: 'متابعة الجلسة',
      startNew: 'بدء جديد'
    },
    en: {
      title: 'Previous Session Found',
      message: 'We found an incomplete previous session. Would you like to continue where you left off?',
      resume: 'Resume Session',
      startNew: 'Start New'
    },
    de: {
      title: 'Frühere Sitzung gefunden',
      message: 'Wir haben eine unvollständige frühere Sitzung gefunden. Möchten Sie dort fortfahren?',
      resume: 'Sitzung fortsetzen',
      startNew: 'Neu beginnen'
    }
  };

  const t = translations[language];

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-gold-500/30 rounded-2xl p-8 max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">
          {t.title}
        </h2>
        <p className="text-slate-400 mb-6">
          {t.message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onResume}
            className="flex-1 bg-gold-600 text-slate-950 font-semibold py-3 rounded-xl hover:bg-gold-500 transition"
          >
            {t.resume}
          </button>
          <button
            onClick={onStartNew}
            className="flex-1 bg-slate-800 text-white py-3 rounded-xl hover:bg-slate-700 transition"
          >
            {t.startNew}
          </button>
        </div>
      </div>
    </div>
  );
}
