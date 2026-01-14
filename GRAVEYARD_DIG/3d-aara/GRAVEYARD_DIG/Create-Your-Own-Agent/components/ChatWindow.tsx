
import React, { useState, useRef, useEffect } from 'react';
import type { Gem, ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './ChatMessage';
import { SendIcon, BackIcon, iconMap, BotIcon } from './icons';

interface ChatWindowProps {
  gem: Gem;
  chatHistory: ChatMessageType[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onGoBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ gem, chatHistory, isLoading, onSendMessage, onGoBack }) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);
  
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const IconComponent = iconMap[gem.icon] || BotIcon;

  return (
    <div className="flex flex-col h-full w-full bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 animate-fade-in-up">
      <header className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800/80 backdrop-blur-sm rounded-t-2xl">
        <div className="flex items-center gap-4">
           <button onClick={onGoBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
            <BackIcon className="w-6 h-6 text-gray-400" />
           </button>
           <div className="bg-gray-900 p-2 rounded-md">
                <IconComponent className="w-6 h-6 text-gray-300" />
           </div>
           <h2 className="text-xl font-bold text-gray-100">{gem.name}</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatHistory.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && <ChatMessage message={{ role: 'model', parts: [{ text: '' }] }} isLoading={true} />}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700 sticky bottom-0 bg-gray-800/80 backdrop-blur-sm rounded-b-2xl">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={`Message ${gem.name}...`}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 max-h-48"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-cyan-600 text-white rounded-lg p-3 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-500 transition-colors"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
