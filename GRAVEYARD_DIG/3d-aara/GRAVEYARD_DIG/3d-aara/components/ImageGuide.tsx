
import React, { useState, useCallback, useMemo } from 'react';
import { LightbulbIcon, LandscapeIcon, CameraIcon, CheckCircleIcon, UploadIcon, HomeIcon, AngleGuideMiddleIcon, AngleGuideHighIcon, AngleGuideLowIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { GoogleGenAI } from "@google/genai";

declare const JSZip: any;

interface RuleCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const RuleCard: React.FC<RuleCardProps> = ({ icon, title, children }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 flex flex-col items-center text-center transform hover:scale-105 transition-all duration-300">
    <div className="text-cyan-400 mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-100 mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
  </div>
);

interface ImageGuideProps {
    setPage: (page: 'landing' | 'image' | 'video') => void;
}

const ImageGuide: React.FC<ImageGuideProps> = ({ setPage }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<(File | null)[]>(Array(15).fill(null));
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(Array(15).fill(null));
  const [isZipping, setIsZipping] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const { t, locale } = useLanguage();

  const loopInfo = useMemo(() => {
    if (currentStep < 5) return { title: t('image_guide_loop1_title'), instruction: t('image_guide_loop1_desc'), AngleIcon: AngleGuideMiddleIcon, tip: t('image_guide_loop1_tip') };
    if (currentStep < 10) return { title: t('image_guide_loop2_title'), instruction: t('image_guide_loop2_desc'), AngleIcon: AngleGuideHighIcon, tip: null };
    return { title: t('image_guide_loop3_title'), instruction: t('image_guide_loop3_desc'), AngleIcon: AngleGuideLowIcon, tip: null };
  }, [currentStep, locale, t]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadedImages(prev => {
        const newImages = [...prev];
        newImages[currentStep] = file;
        return newImages;
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => {
          const newPreviews = [...prev];
          newPreviews[currentStep] = reader.result as string;
          return newPreviews;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const runAiAudit = async () => {
    if (uploadedImages.some(img => !img)) return;
    setIsAuditing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // We send the first, middle and last images for efficiency in evaluation
      const sampleIndices = [0, 7, 14];
      const parts = await Promise.all(sampleIndices.map(async (idx) => {
          const file = uploadedImages[idx]!;
          const base64 = imagePreviews[idx]!.split(',')[1];
          return { inlineData: { data: base64, mimeType: file.type } };
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            ...parts,
            { text: `You are a professional photogrammetry expert. Analyze these 3 sample images from a 15-shot circular capture set.
            Provide a concise audit in ${locale === 'ar' ? 'Arabic' : 'English'}.
            Evaluate: 1. Lighting consistency. 2. Sharpness of the object. 3. Background simplicity.
            Conclude if this set is suitable for high-quality 3D reconstruction.` }
          ]
        },
      });
      setAiReport(response.text || "Audit failed to generate.");
    } catch (error) {
      console.error(error);
      setAiReport("Error connecting to AI Audit service.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDownloadZip = useCallback(async () => {
    if (uploadedImages.some(img => !img)) {
      alert(t('alert_all_images'));
      return;
    }
    setIsZipping(true);
    try {
      const zip = new JSZip();
      uploadedImages.forEach((file, index) => {
        if(file) {
          zip.file(`shot_${String(index + 1).padStart(2, '0')}.${file.name.split('.').pop()}`, file);
        }
      });
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `photogrammetry_set_${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert(t('error_zipping'));
    } finally {
      setIsZipping(false);
    }
  }, [uploadedImages, t]);

  return (
    <div className="flex-grow w-full max-w-6xl mx-auto px-4 py-10">
      <header className="flex items-center justify-between mb-12">
        <button onClick={() => setPage('landing')} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-cyan-400">
          <HomeIcon className="h-7 w-7" />
        </button>
        <div className="text-center">
            <h1 className="text-3xl font-black text-white">{t('image_guide_title')}</h1>
            <p className="text-gray-400 text-sm mt-1">{t('image_guide_subtitle')}</p>
        </div>
        <div className="w-10"></div>
      </header>

      {currentStep < 15 ? (
        <div className="space-y-10">
          <section className="grid md:grid-cols-3 gap-6">
            <RuleCard icon={<LightbulbIcon className="h-10 w-10" />} title={t('rule_lighting_title')}>{t('rule_lighting_desc')}</RuleCard>
            <RuleCard icon={<LandscapeIcon className="h-10 w-10" />} title={t('rule_background_title')}>{t('rule_background_desc')}</RuleCard>
            <RuleCard icon={<CameraIcon className="h-10 w-10" />} title={t('rule_focus_title')}>{t('rule_focus_desc')}</RuleCard>
          </section>

          <section className="bg-gray-800/80 rounded-2xl p-8 border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-cyan-400">{t('capture_plan_title', {current: currentStep + 1, total: 15})}</h2>
                <div className="text-gray-500 font-mono">{( (currentStep/15)*100 ).toFixed(0)}%</div>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-1.5 mb-10 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-400 h-full transition-all duration-500" style={{ width: `${(currentStep / 15) * 100}%` }}></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
                <div className="relative group aspect-square bg-gray-900 rounded-xl overflow-hidden border-2 border-dashed border-gray-700 flex flex-col items-center justify-center">
                    {imagePreviews[currentStep] ? (
                        <>
                            <img src={imagePreviews[currentStep]!} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label htmlFor="file-upload" className="cursor-pointer bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-white font-bold">{t('change_video_button')}</label>
                            </div>
                        </>
                    ) : (
                        <div className="p-10 text-center">
                            <UploadIcon className="h-14 w-14 text-gray-600 mb-4 mx-auto" />
                            <label htmlFor="file-upload" className="inline-block cursor-pointer bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all">{t('select_image_button', {step: currentStep+1})}</label>
                            <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                    )}
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <h4 className="text-gray-300 font-bold mb-4">{t('angle_guide_title')}</h4>
                    <loopInfo.AngleIcon className="w-48 h-48 drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]" />
                    <p className="text-gray-400 text-sm max-w-xs mt-4">{loopInfo.instruction}</p>
                    {loopInfo.tip && (
                        <div className="mt-6 p-4 bg-cyan-900/20 border-l-4 border-cyan-500 text-cyan-200 text-xs rounded-r-lg">
                            <span className="font-bold">{t('tip_title')}:</span> {loopInfo.tip}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between mt-10">
                <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0} className="px-8 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 disabled:opacity-30 transition-all font-bold">{t('prev_button')}</button>
                <button onClick={() => setCurrentStep(s => Math.min(15, s + 1))} disabled={!uploadedImages[currentStep]} className="px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/20 shadow-lg disabled:opacity-30 transition-all font-bold">
                    {currentStep === 14 ? t('finish_button') : t('next_button')}
                </button>
            </div>
          </section>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <section className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl text-center">
            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-white mb-2">{t('completion_title')}</h2>
            <p className="text-gray-400 mb-8">{t('ready_to_zip')}</p>

            {!aiReport ? (
              <button 
                onClick={runAiAudit} 
                disabled={isAuditing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-black text-lg transition-all mb-4 flex items-center justify-center gap-3 disabled:bg-gray-700"
              >
                {isAuditing ? <><div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> {t('ai_auditing')}</> : t('ai_audit_button')}
              </button>
            ) : (
              <div className="mb-8 text-start bg-gray-900/50 p-6 rounded-xl border border-indigo-500/30">
                <h4 className="text-indigo-400 font-bold mb-3 flex items-center gap-2">✨ {t('ai_audit_title')}</h4>
                <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{aiReport}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleDownloadZip} disabled={isZipping} className="bg-cyan-600 hover:bg-cyan-500 py-4 rounded-xl font-bold transition-all disabled:opacity-50">
                {isZipping ? t('zipping_button') : t('download_zip_button')}
              </button>
              <button onClick={() => { setCurrentStep(0); setUploadedImages(Array(15).fill(null)); setAiReport(null); }} className="bg-gray-700 hover:bg-gray-600 py-4 rounded-xl font-bold transition-all">
                {t('start_over_button')}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ImageGuide;
