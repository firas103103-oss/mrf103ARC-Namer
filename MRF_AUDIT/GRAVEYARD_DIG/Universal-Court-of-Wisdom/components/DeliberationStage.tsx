
import React, { useState, useEffect } from 'react';

const messages = [
  "The Council deliberates...",
  "Weighing universal truths...",
  "Consulting the annals of time...",
  "Considering all perspectives...",
  "The threads of fate are being examined...",
  "Seeking resonance with cosmic law...",
];

const DeliberationStage: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-8 text-center animate-fade-in flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-2 border-purple-400 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-2 border-2 border-yellow-300 rounded-full animate-ping animation-delay-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243a3 3 0 01-4.243-4.243" />
                </svg>
            </div>
        </div>

      <h2 className="text-3xl font-cinzel font-bold tracking-wider text-gray-200 mb-4">Deliberation in Progress</h2>
      <p className="text-purple-300 text-lg transition-opacity duration-1000">
        {message}
      </p>
    </div>
  );
};

export default DeliberationStage;
