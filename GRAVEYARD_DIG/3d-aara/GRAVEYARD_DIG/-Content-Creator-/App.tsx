
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Stage } from './types';
import { ChatWindow } from './components/ChatWindow';
import { UserInput } from './components/UserInput';
import { generateAiResponse } from './services/geminiService';
import { initialWelcomeMessage } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([initialWelcomeMessage]);
  const [stage, setStage] = useState<Stage>(Stage.WELCOME);
  const [projectData, setProjectData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'ai' | 'expert-tip') => {
    setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), text, sender }]);
  };

  const handleUserResponse = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;

    addMessage(userInput, 'user');
    setIsLoading(true);

    try {
      // Determine if transitioning stage
      const positiveKeywords = ['نعم', 'موافق', 'بالتأكيد', 'أجل', 'فلنبدأ', 'لننتقل', 'جاهز'];
      const isTransitioning = positiveKeywords.some(keyword => userInput.toLowerCase().includes(keyword)) && stage !== Stage.WELCOME;
      
      let nextStage = stage;
      if (isTransitioning) {
        nextStage = stage + 1;
        setStage(nextStage);
      }
      
      const response = await generateAiResponse(userInput, nextStage, projectData, messages);
      
      if (response.expertTip) {
        addMessage(response.mainResponse, 'ai');
        setTimeout(() => {
          addMessage(`💡 نصيحة الخبير: ${response.expertTip}`, 'expert-tip');
        }, 500);
      } else {
        addMessage(response.mainResponse, 'ai');
      }
      
      // Update project data if available in response
      if (response.updatedProjectData) {
        setProjectData(prev => ({...prev, ...response.updatedProjectData}));
      }

    } catch (error) {
      console.error("Error communicating with AI:", error);
      addMessage("عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.", 'ai');
    } finally {
      setIsLoading(false);
    }
  }, [stage, projectData, messages]);

  return (
    <div className="flex flex-col h-screen bg-[#11111b] font-sans">
       <header className="bg-[#1e1e2e] p-4 border-b border-gray-700 shadow-lg">
        <h1 className="text-xl font-bold text-center text-gray-100">
          ورشة صانع المحتوى 🤖
        </h1>
        <p className="text-center text-sm text-gray-400 mt-1">مرشدك الذكي لإنشاء محتوى احترافي خطوة بخطوة</p>
      </header>
      <ChatWindow messages={messages} chatRef={chatRef} isLoading={isLoading} />
      <UserInput onSendMessage={handleUserResponse} isLoading={isLoading} />
    </div>
  );
};

export default App;
