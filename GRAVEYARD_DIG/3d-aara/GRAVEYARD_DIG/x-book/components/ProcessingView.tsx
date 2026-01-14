import React from 'react';
import { Loader2 } from 'lucide-react';
import { ProcessingStatus, BookMetadata, Language } from '../types';

interface ProcessingViewProps {
  status: ProcessingStatus | null;
  metadata: Partial<BookMetadata>;
  language: Language;
}

export function ProcessingView({ status, metadata, language }: ProcessingViewProps) {
  if (!status) return null;

  const stageNames = {
    ar: {
      analyzing: 'التحليل',
      editing: 'التحرير',
      generating_cover: 'توليد الغلاف',
      creating_package: 'إنشاء الحزمة',
      complete: 'اكتمل'
    },
    en: {
      analyzing: 'Analysis',
      editing: 'Editing',
      generating_cover: 'Cover Generation',
      creating_package: 'Package Creation',
      complete: 'Complete'
    },
    de: {
      analyzing: 'Analyse',
      editing: 'Bearbeitung',
      generating_cover: 'Cover-Generierung',
      creating_package: 'Paket-Erstellung',
      complete: 'Abgeschlossen'
    }
  };

  const stageName = stageNames[language][status.stage] || status.stage;

  return (
    <div className="my-6">
      <div className="bg-slate-800/80 border border-gold-600/30 rounded-xl p-6 backdrop-blur-sm">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
            <h3 className="text-lg font-semibold text-gold-400">
              {stageName}
            </h3>
          </div>
          <span className="text-2xl font-bold text-gold-400">{status.progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden mb-4">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-gold-500 to-gold-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${status.progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>

        {/* Message */}
        <div className="text-sm text-gray-300">{status.message}</div>

        {/* Chunk Information */}
        {status.currentChunk && status.totalChunks && (
          <div className="mt-3 text-xs text-gray-400">
            {language === 'ar' 
              ? `معالجة الجزء ${status.currentChunk} من ${status.totalChunks}`
              : `Processing chunk ${status.currentChunk} of ${status.totalChunks}`}
          </div>
        )}
      </div>
    </div>
  );
}
