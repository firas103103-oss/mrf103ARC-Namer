
import React from 'react';
import { AiIcon } from './icons';

export const TypingIndicator: React.FC = () => (
  <div className="flex items-start gap-3 self-start">
    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 mt-1">
      <AiIcon />
    </div>
    <div className="bg-[#2a2a3c] self-start rounded-bl-none px-4 py-3 rounded-2xl flex items-center space-x-1.5" style={{ direction: 'ltr' }}>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
    </div>
  </div>
);
