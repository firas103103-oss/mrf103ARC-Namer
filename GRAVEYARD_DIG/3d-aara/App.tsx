import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import LandingPage from './components/LandingPage';
import ImageGuide from './components/ImageGuide';
import VideoGuide from './components/VideoGuide';

type Page = 'landing' | 'image' | 'video';

const AppContent: React.FC = () => {
    const [page, setPage] = useState<Page>('landing');
    const { locale } = useLanguage();

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        document.title = locale === 'ar' ? 'دليل إنشاء الأصول ثلاثية الأبعاد' : '3D Asset Creation Guide';
    }, [locale]);

    const renderPage = () => {
        switch (page) {
            case 'image':
                return <ImageGuide setPage={setPage} />;
            case 'video':
                return <VideoGuide setPage={setPage} />;
            case 'landing':
            default:
                return <LandingPage setPage={setPage} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
            {renderPage()}
        </div>
    );
};


const App: React.FC = () => {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
};

export default App;