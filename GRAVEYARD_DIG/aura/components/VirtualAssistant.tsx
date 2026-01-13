
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageAuthor } from '../types';
import { sendMessageToAssistant } from '../services/geminiService';
import { Send, Bot, User } from 'lucide-react';

interface VirtualAssistantProps {
  isOpen: boolean;
}

const VirtualAssistant: React.FC<VirtualAssistantProps> = ({ isOpen }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { author: MessageAuthor.ASSISTANT, text: "Hello. I am Aura. Ask me about this world you now see." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { author: MessageAuthor.USER, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantResponseText = await sendMessageToAssistant(input);
    const assistantMessage: ChatMessage = { author: MessageAuthor.ASSISTANT, text: assistantResponseText };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  return (
    <div className={`absolute bottom-0 right-0 h-full md:h-auto md:max-h-[90%] w-full md:w-96 p-4 pointer-events-none transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-black/70 backdrop-blur-md rounded-xl shadow-2xl shadow-purple-900/50 h-full flex flex-col pointer-events-auto">
            <h2 className="text-xl font-bold p-4 border-b border-purple-500/30 text-purple-300">Aura Guide</h2>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'}`}>
                        {msg.author === MessageAuthor.ASSISTANT && <Bot className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />}
                        <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${msg.author === MessageAuthor.USER ? 'bg-blue-600/80 text-white' : 'bg-gray-700/80 text-gray-200'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                         {msg.author === MessageAuthor.USER && <User className="w-6 h-6 text-blue-300 flex-shrink-0 mt-1" />}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <Bot className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1"/>
                        <div className="max-w-xs md:max-w-sm rounded-lg px-4 py-2 bg-gray-700/80 text-gray-200">
                            <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-0"></span>
                                <span className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-purple-500/30">
                <div className="flex items-center bg-gray-800/80 rounded-lg">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about the Echoes..."
                        className="flex-1 bg-transparent text-white px-4 py-2 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading} className="p-3 text-purple-300 hover:text-purple-100 disabled:text-gray-500">
                        <Send size={20}/>
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default VirtualAssistant;
