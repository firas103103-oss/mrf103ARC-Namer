
import React, { useState, useRef } from 'react';
import { LightbulbIcon, VideoCameraIcon, HomeIcon, UploadIcon, CheckCircleIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { GoogleGenAI } from "@google/genai";
import { translations } from '../lib/translations';

type Translations = typeof translations.ar;

interface AnalysisResult {
    suitability: 'high' | 'medium' | 'low';
    feedback: string;
}

const getStatusColor = (status: string) => {
    switch(status) {
        case 'high': return 'bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-sm font-bold';
        case 'medium': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-sm font-bold';
        case 'low': return 'bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-sm font-bold';
        default: return 'text-gray-400';
    }
}

interface VideoGuideProps {
    setPage: (page: 'landing' | 'image' | 'video') => void;
}

const VideoGuide: React.FC<VideoGuideProps> = ({ setPage }) => {
    const { t, locale } = useLanguage();
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.size > 500 * 1024 * 1024) {
                alert(t('alert_file_too_large'));
                return;
            }
            setAnalysisResult(null);
            const reader = new FileReader();
            reader.onloadend = () => setVideoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const captureFrame = (): Promise<string> => {
        return new Promise((resolve) => {
            const video = videoRef.current;
            if (!video) return resolve("");
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
        });
    };

    const handleAnalyze = async () => {
        if (!videoPreview) return;
        setIsAnalyzing(true);
        try {
            // Seek to middle of video for analysis
            if (videoRef.current) {
                videoRef.current.currentTime = videoRef.current.duration / 2;
                await new Promise(r => setTimeout(r, 500));
            }
            
            const frameBase64 = await captureFrame();
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        { inlineData: { data: frameBase64, mimeType: 'image/jpeg' } },
                        { text: `Analyze this video frame for its suitability for 3D photogrammetry.
                        Respond in ${locale === 'ar' ? 'Arabic' : 'English'}.
                        Format your response exactly as:
                        SUITABILITY: [high/medium/low]
                        FEEDBACK: [One short paragraph with specific advice on lighting and detail]` }
                    ]
                }
            });

            const text = response.text || "";
            const suitabilityMatch = text.match(/SUITABILITY:\s*(high|medium|low)/i);
            const feedbackMatch = text.match(/FEEDBACK:\s*([\s\S]*)/i);

            setAnalysisResult({
                suitability: (suitabilityMatch ? suitabilityMatch[1].toLowerCase() : 'medium') as any,
                feedback: feedbackMatch ? feedbackMatch[1].trim() : text
            });
        } catch (error) {
            console.error(error);
            setAnalysisResult({ suitability: 'medium', feedback: "AI Analysis currently unavailable. Please follow visual rules." });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
    <div className="flex-grow w-full max-w-6xl mx-auto px-4 py-10">
        <header className="flex items-center justify-between mb-12">
            <button onClick={() => setPage('landing')} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-sky-400">
                <HomeIcon className="h-7 w-7" />
            </button>
            <div className="text-center">
                <h1 className="text-3xl font-black text-white">{t('video_guide_title')}</h1>
                <p className="text-gray-400 text-sm mt-1">{t('video_guide_subtitle')}</p>
            </div>
            <div className="w-10"></div>
        </header>

        <section className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700">
                <LightbulbIcon className="h-8 w-8 text-yellow-400 mb-4" />
                <h3 className="font-bold text-gray-100 mb-2">{t('rule_lighting_title')}</h3>
                <p className="text-gray-400 text-xs">{t('video_rule_lighting_desc')}</p>
            </div>
            <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700">
                <VideoCameraIcon className="h-8 w-8 text-sky-400 mb-4" />
                <h3 className="font-bold text-gray-100 mb-2">{t('video_rule_movement_title')}</h3>
                <p className="text-gray-400 text-xs">{t('video_rule_movement_desc')}</p>
            </div>
            <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700">
                <CheckCircleIcon className="h-8 w-8 text-green-400 mb-4" />
                <h3 className="font-bold text-gray-100 mb-2">{t('video_rule_path_title')}</h3>
                <p className="text-gray-400 text-xs">{t('video_rule_path_desc')}</p>
            </div>
        </section>

        <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl overflow-hidden relative">
                    <h3 className="text-xl font-bold text-white mb-4">{t('upload_video_title')}</h3>
                    <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border border-gray-900 shadow-inner">
                        {videoPreview ? (
                            <video ref={videoRef} src={videoPreview} controls className="w-full h-full" />
                        ) : (
                            <div className="text-center p-10">
                                <UploadIcon className="h-16 w-16 text-gray-700 mb-4 mx-auto" />
                                <button onClick={() => fileInputRef.current?.click()} className="bg-sky-600 hover:bg-sky-500 px-6 py-2 rounded-lg font-bold transition-all">{t('select_video_button')}</button>
                                <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                            </div>
                        )}
                    </div>
                    {videoPreview && (
                        <button onClick={() => fileInputRef.current?.click()} className="mt-4 text-xs text-gray-500 hover:text-sky-400 transition-colors underline">{t('change_video_button')}</button>
                    )}
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl h-full flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-4">{t('analyze_video_title')}</h3>
                    <p className="text-gray-400 text-sm mb-6">{t('analyze_video_instruction')}</p>
                    
                    {!analysisResult ? (
                        <button 
                            onClick={handleAnalyze} 
                            disabled={isAnalyzing || !videoPreview} 
                            className="mt-auto w-full bg-cyan-600 hover:bg-cyan-500 py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                        >
                            {isAnalyzing ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <CheckCircleIcon className="h-5 w-5" />}
                            {isAnalyzing ? t('analyzing_button') : t('analyze_button')}
                        </button>
                    ) : (
                        <div className="space-y-6 flex-grow flex flex-col">
                            <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-400 text-sm font-bold">{t('analysis_suitability')}</span>
                                    <span className={getStatusColor(analysisResult.suitability)}>{t(`${analysisResult.suitability}_suitability` as keyof Translations)}</span>
                                </div>
                                <div className="text-xs text-gray-300 leading-relaxed italic">
                                    " {analysisResult.feedback} "
                                </div>
                            </div>
                            
                            <button onClick={handleAnalyze} className="mt-auto w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-bold transition-all">
                                {t('reanalyze_button')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
};

export default VideoGuide;
