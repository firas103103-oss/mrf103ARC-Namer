
import React, { useState, useEffect } from 'react';
import { LOADING_MESSAGES } from '../constants';

const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
    </svg>
);


const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[500px] bg-slate-50">
      <div className="relative">
        <DocumentIcon className="w-24 h-24 text-slate-300" />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mt-8">Crafting Your Constitution...</h2>
      <p className="text-slate-600 mt-2 text-center transition-opacity duration-500">
        {LOADING_MESSAGES[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingScreen;
