
import React from 'react';
import { CameraIcon, VideoCameraIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface LandingPageProps {
    setPage: (page: 'landing' | 'image' | 'video') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setPage }) => {
    const { locale, setLocale, t } = useLanguage();

    const toggleLanguage = () => {
        setLocale(locale === 'ar' ? 'en' : 'ar');
    };

    return (
        <main className="flex-grow flex flex-col items-center justify-center relative overflow-hidden px-4 py-20">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>

            <header className="mb-16 z-10 max-w-4xl text-center">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black tracking-widest uppercase">
                    IDigital Innovation
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                    {t('landing_title')}
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    {t('landing_subtitle')}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl z-10">
                <button 
                    onClick={() => setPage('image')}
                    className="group relative p-1 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 hover:from-cyan-900/40 hover:to-indigo-900/40 transition-all duration-500 shadow-2xl"
                >
                    <div className="bg-gray-900/80 backdrop-blur-xl p-10 rounded-[22px] h-full flex flex-col items-center border border-gray-700/50">
                        <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <CameraIcon className="h-10 w-10 text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-3">{t('landing_image_button')}</h2>
                        <div className="w-12 h-1 bg-cyan-500 rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
                    </div>
                </button>

                <button 
                    onClick={() => setPage('video')}
                    className="group relative p-1 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 hover:from-indigo-900/40 hover:to-sky-900/40 transition-all duration-500 shadow-2xl"
                >
                    <div className="bg-gray-900/80 backdrop-blur-xl p-10 rounded-[22px] h-full flex flex-col items-center border border-gray-700/50">
                         <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <VideoCameraIcon className="h-10 w-10 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-3">{t('landing_video_button')}</h2>
                        <div className="w-12 h-1 bg-indigo-500 rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
                    </div>
                </button>
            </div>
            
            <div className="absolute top-8 right-8 z-20">
                <button
                    onClick={toggleLanguage}
                    className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold backdrop-blur-md transition-all flex items-center gap-2"
                >
                    <span className="opacity-60">Language:</span>
                    {locale === 'ar' ? 'English' : 'العربية'}
                </button>
            </div>

            <footer className="mt-20 text-center z-10">
                <p className="text-sm font-bold text-gray-500 tracking-widest uppercase mb-2 opacity-60">
                    {t('landing_owner')}
                </p>
                <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                    <span className="text-xs text-cyan-400 font-mono">AI Analysis Engine Active</span>
                </div>
            </footer>
        </main>
    );
};

export default LandingPage;
